import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { toBackendCategory } from '@/lib/aiApi'
import { supabase } from '@/lib/supabase'
import { generateUsername } from '@/lib/username'
import type {
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
  logResourceInteraction: (resource: Resource) => void
  // Wipes all of the user's activity (posts, likes, saved items,
  // notifications, interaction log) and resets their profile row to
  // onboarding_completed=false, but keeps the auth account. Returns
  // true on success.
  deleteUserData: () => Promise<boolean>
  // Wipes the user's data like deleteUserData, then signs them out.
  // The auth record itself persists (client can't delete auth rows
  // without the service role key) — a future server endpoint should
  // complete the account-deletion flow. Returns true on success.
  deleteUserAccount: () => Promise<boolean>
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
  const [language, setLanguageState] = useState<AppLanguage>('es')
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [savedResourceIds, setSavedResourceIds] = useState<string[]>([])
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [interactionsLog, setInteractionsLog] = useState<string[]>(() => loadInteractionsLog())

  // Language setter that also syncs to profiles.language_preference
  // when a user is signed in. The DB uses 'spanish'/'english' while
  // the app uses 'es'/'en' — we map between them on write. Local
  // state always updates immediately so the UI reacts instantly; the
  // DB write is fire-and-forget (failure is logged, not surfaced).
  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang)
    if (user?.id) {
      const dbValue = lang === 'es' ? 'spanish' : 'english'
      void supabase
        .from('profiles')
        .update({ language_preference: dbValue })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) console.warn('setLanguage DB sync failed:', error)
        })
    }
  }

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
              setLanguageState(lang)
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
          setLanguageState(lang)
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
    setLanguageState(preferredAppLanguage)
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
    setLanguageState(preferredAppLanguage)

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

    // If the user changed their preferred language in the edit view,
    // reflect that in app-level language state so the nav + all
    // bilingual strings flip without requiring a page reload.
    setLanguageState(profile.preferredLanguage === 'english' ? 'en' : 'es')

    setUser(prev => {
      if (!prev) return null
      return { ...prev, onboardingCompleted: true, profile }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSavedResourceIds([])
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

  const deleteUserData = async (): Promise<boolean> => {
    // Re-check the session (not just React state) so an expired
    // session doesn't fire deletes under an anon RLS context and get
    // silently rejected. If the session is gone, bail early.
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user?.id) return false
    const uid = session.user.id

    // Fire all deletes in parallel — independent tables, no FK chain
    // that requires ordering. Supabase RLS policies should already
    // ensure these only affect the calling user's rows.
    const results = await Promise.allSettled([
      supabase.from('post_likes').delete().eq('user_id', uid),
      supabase.from('saved_items').delete().eq('user_id', uid),
      supabase.from('saved_lists').delete().eq('user_id', uid),
      supabase.from('comments').delete().eq('user_id', uid),
      supabase.from('notifications').delete().eq('user_id', uid),
      supabase.from('posts').delete().eq('user_id', uid),
      // Reset profile to the just-created state so the next sign-in
      // lands on /onboarding instead of /dashboard with stale data.
      supabase
        .from('profiles')
        .update({
          country_of_origin: null,
          immigration_status: null,
          language_preference: 'spanish',
          occupation: null,
          goals: [],
          onboarding_completed: false,
        })
        .eq('id', uid),
    ])

    // Supabase query builders RESOLVE (not reject) on SQL/RLS errors,
    // wrapping the error inside `{error}` on the resolved value.
    // Promise.allSettled's 'fulfilled' status tells us nothing about
    // whether the SQL actually succeeded — we have to peek inside
    // `r.value.error` for each result. Missing this check means a
    // silently-denied RLS delete looks identical to a clean success.
    const failures: unknown[] = []
    for (const r of results) {
      if (r.status === 'rejected') {
        failures.push(r.reason)
      } else {
        const resolved = r.value as { error?: { message?: string } | null }
        if (resolved?.error) {
          failures.push(resolved.error)
        }
      }
    }
    if (failures.length > 0) {
      console.warn(`deleteUserData: ${failures.length} operation(s) failed`, failures)
    }

    // Clear local state + localStorage regardless of individual
    // table failures — partial success is still better than leaving
    // stale data in the UI.
    setSavedResourceIds([])
    setChatHistory([])
    setInteractionsLog([])
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(INTERACTIONS_STORAGE_KEY)
      } catch {
        // Ignore
      }
    }
    // Reflect the profile reset in the in-memory user so the UI
    // redirects to /onboarding immediately without a page reload.
    setUser(prev => (prev ? { ...prev, onboardingCompleted: false, profile: undefined } : null))

    return failures.length === 0
  }

  const deleteUserAccount = async (): Promise<boolean> => {
    // Client-only flow: wipe all data, then sign out. The auth row
    // itself can't be removed from the browser (that needs the
    // service_role key). A future server endpoint should complete
    // the deletion — until then, users who re-sign-in will land on
    // onboarding with a clean slate.
    const dataOk = await deleteUserData()
    await signOut()
    return dataOk
  }

  const logResourceInteraction = (resource: Resource) => {
    // Map the resource's category into the backend algorithm's
    // 9-category vocabulary. After PR #9's taxonomy unification,
    // frontend ResourceCategory matches backend CATEGORIES 1:1 for
    // most values, so toBackendCategory mostly pass-throughs.
    // Unmapped values (e.g. 'event') return null and we skip logging.
    const mapped = toBackendCategory(resource.category)
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

  const value = useMemo<AppContextValue>(
    () => ({
      language,
      setLanguage,
      user,
      authLoading,
      savedResourceIds,
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
      logResourceInteraction,
      deleteUserData,
      deleteUserAccount,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, user, authLoading, savedResourceIds, chatHistory, interactionsLog]
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
