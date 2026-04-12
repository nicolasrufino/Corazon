import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { toBackendCategory } from '@/lib/aiApi'
import { supabase } from '@/lib/supabase'
import { generateUsername } from '@/lib/username'
import type {
  AnalyzerRecord,
  AppLanguage,
  ChatMessage,
  Occupation,
  OnboardingProfile,
  Resource,
  User,
} from '@/types/app'

// localStorage key for the resource interaction log — shared across
// guest + signed-in sessions so if someone explores-then-signs-up we
// don't lose the archetype signal they built up before creating an
// account. Capped at MAX_INTERACTIONS so the log can't grow unbounded.
const INTERACTIONS_STORAGE_KEY = 'corazon:interactions_log:v1'
const MAX_INTERACTIONS = 200

function loadInteractionsLog(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(INTERACTIONS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

function saveInteractionsLog(log: string[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(INTERACTIONS_STORAGE_KEY, JSON.stringify(log))
  } catch {
    // Ignore quota errors — the log is advisory, not critical
  }
}

interface AppContextValue {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  user: User | null
  authLoading: boolean
  savedResourceIds: string[]
  analyzerHistory: AnalyzerRecord[]
  chatHistory: ChatMessage[]
  interactionsLog: string[]
  signIn: (
    email: string,
    password: string,
    preferredAppLanguage: AppLanguage
  ) => Promise<string | null>
  startSignUp: (
    email: string,
    password: string,
    preferredAppLanguage: AppLanguage
  ) => Promise<string | null>
  resetPassword: (email: string) => Promise<string | null>
  completeOnboarding: (profile: OnboardingProfile) => Promise<void>
  signOut: () => Promise<void>
  toggleSavedResource: (resource: Resource) => void
  hasSavedResource: (resourceId: string) => boolean
  addChatMessage: (message: ChatMessage) => void
  addAnalyzerRecord: (record: AnalyzerRecord) => void
  logResourceInteraction: (resource: Resource) => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

interface ProfileData {
  profile: OnboardingProfile
  username: string
}

async function fetchProfile(
  userId: string
): Promise<(ProfileData & { onboardingCompleted: boolean }) | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error || !data) return null
  return {
    username: data.username || '',
    onboardingCompleted: !!data.onboarding_completed,
    profile: {
      countryOfOrigin: data.country_of_origin || undefined,
      immigrationStatus: data.immigration_status || undefined,
      preferredLanguage: data.language_preference || 'spanish',
      occupations: data.occupation
        ? ((data.occupation as string).split(',').filter(Boolean) as Occupation[])
        : [],
      goals: data.goals || [],
    },
  }
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<AppLanguage>('es')
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [savedResourceIds, setSavedResourceIds] = useState<string[]>([])
  const [analyzerHistory, setAnalyzerHistory] = useState<AnalyzerRecord[]>([])
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [interactionsLog, setInteractionsLog] = useState<string[]>(() => loadInteractionsLog())

  // Persist interaction log to localStorage on every change so the
  // archetype signal survives refreshes. Runs on every log mutation
  // including the initial hydration (no-op on first mount since the
  // value matches what's already in storage).
  useEffect(() => {
    saveInteractionsLog(interactionsLog)
  }, [interactionsLog])

  // Restore session on mount + subscribe to auth changes
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          const u = session.user
          fetchProfile(u.id)
            .then(result => {
              const lang = result?.profile?.preferredLanguage === 'english' ? 'en' : 'es'
              setLanguage(lang)
              setUser({
                id: u.id,
                email: u.email || '',
                username: result?.username || '',
                preferredAppLanguage: lang,
                onboardingCompleted: result?.onboardingCompleted ?? false,
                profile: result?.profile || undefined,
              })
              setAuthLoading(false)
            })
            .catch(() => {
              setAuthLoading(false)
            })
        } else {
          setAuthLoading(false)
        }
      })
      .catch(() => {
        setAuthLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null)
        return
      }
      const u = session.user
      fetchProfile(u.id)
        .then(result => {
          const lang = result?.profile?.preferredLanguage === 'english' ? 'en' : 'es'
          setLanguage(lang)
          setUser({
            id: u.id,
            email: u.email || '',
            username: result?.username || '',
            preferredAppLanguage: lang,
            onboardingCompleted: result?.onboardingCompleted ?? false,
            profile: result?.profile || undefined,
          })
        })
        .catch(() => {
          // Profile fetch failed — user stays null, app still works
        })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (
    email: string,
    password: string,
    preferredAppLanguage: AppLanguage
  ): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    setLanguage(preferredAppLanguage)
    return null
  }

  const startSignUp = async (
    email: string,
    password: string,
    preferredAppLanguage: AppLanguage
  ): Promise<string | null> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: undefined, data: {} },
    })
    if (error) return error.message
    setLanguage(preferredAppLanguage)

    // If email confirmation is required, session will be null
    if (!data.session) {
      return '__confirm_email__'
    }

    if (data.user) {
      const username = generateUsername()
      // Create the profile row with the generated username immediately
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email || email,
        username,
        onboarding_completed: false,
      })
      setUser({
        id: data.user.id,
        email: data.user.email || email,
        username,
        preferredAppLanguage,
        onboardingCompleted: false,
      })
    }
    return null
  }

  const resetPassword = async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    })
    if (error) return error.message
    return null
  }

  const completeOnboarding = async (profile: OnboardingProfile) => {
    if (!user) return

    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      username: user.username,
      country_of_origin: profile.countryOfOrigin || null,
      immigration_status: profile.immigrationStatus || null,
      language_preference: profile.preferredLanguage,
      occupation: profile.occupations.length > 0 ? profile.occupations.join(',') : null,
      goals: profile.goals,
      onboarding_completed: true,
    })

    setUser(prev => {
      if (!prev) return null
      return { ...prev, onboardingCompleted: true, profile }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSavedResourceIds([])
    setAnalyzerHistory([])
    setChatHistory([])
    // Clear interaction log + localStorage so the next user on a
    // shared browser doesn't inherit the previous user's archetype.
    // Without this, User B's dashboard "Recommended for you" strip
    // would be seeded with User A's saves and visits.
    setInteractionsLog([])
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(INTERACTIONS_STORAGE_KEY)
      } catch {
        // Ignore — non-critical
      }
    }
  }

  const logResourceInteraction = (resource: Resource) => {
    // Map the resource's raw Supabase category (or the frontend one as
    // a fallback) into the backend algorithm's 9-category vocabulary.
    // Categories that don't map (event, social_life) return null and we
    // skip logging them — recording a signal the algorithm can't use is
    // worse than recording nothing.
    const mapped = toBackendCategory(resource.rawCategory) || toBackendCategory(resource.category)
    if (!mapped) return
    setInteractionsLog(current => {
      const next = [...current, mapped]
      return next.length > MAX_INTERACTIONS ? next.slice(-MAX_INTERACTIONS) : next
    })
  }

  const toggleSavedResource = (resource: Resource) => {
    setSavedResourceIds(current => {
      const alreadySaved = current.includes(resource.id)
      if (alreadySaved) {
        return current.filter(id => id !== resource.id)
      }
      // Only log on save (positive signal), not on unsave — unsaving
      // shouldn't erode the archetype weight the user already earned.
      logResourceInteraction(resource)
      return [...current, resource.id]
    })
  }

  const hasSavedResource = (resourceId: string) => savedResourceIds.includes(resourceId)

  const addChatMessage = (message: ChatMessage) => {
    setChatHistory(current => [...current, message])
  }

  const addAnalyzerRecord = (record: AnalyzerRecord) => {
    setAnalyzerHistory(current => [record, ...current])
  }

  const value = useMemo<AppContextValue>(
    () => ({
      language,
      setLanguage,
      user,
      authLoading,
      savedResourceIds,
      analyzerHistory,
      chatHistory,
      interactionsLog,
      signIn,
      startSignUp,
      resetPassword,
      completeOnboarding,
      signOut,
      toggleSavedResource,
      hasSavedResource,
      addChatMessage,
      addAnalyzerRecord,
      logResourceInteraction,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, user, authLoading, savedResourceIds, analyzerHistory, chatHistory, interactionsLog]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }

  return context
}
