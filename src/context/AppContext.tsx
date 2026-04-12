import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type {
  AnalyzerRecord,
  AppLanguage,
  ChatMessage,
  OnboardingProfile,
  Resource,
  User,
} from '@/types/app'

interface AppContextValue {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  user: User | null
  authLoading: boolean
  savedResourceIds: string[]
  analyzerHistory: AnalyzerRecord[]
  chatHistory: ChatMessage[]
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
  completeOnboarding: (profile: OnboardingProfile) => Promise<void>
  signOut: () => Promise<void>
  toggleSavedResource: (resource: Resource) => void
  hasSavedResource: (resourceId: string) => boolean
  addChatMessage: (message: ChatMessage) => void
  addAnalyzerRecord: (record: AnalyzerRecord) => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

async function fetchProfile(userId: string): Promise<OnboardingProfile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (!data) return null
  return {
    countryOfOrigin: data.country_of_origin || undefined,
    immigrationStatus: data.immigration_status || undefined,
    preferredLanguage: data.language_preference || 'both',
    occupation: data.occupation || undefined,
    goals: data.goals || [],
  }
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<AppLanguage>('es')
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [savedResourceIds, setSavedResourceIds] = useState<string[]>([])
  const [analyzerHistory, setAnalyzerHistory] = useState<AnalyzerRecord[]>([])
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  // Restore session on mount + subscribe to auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user
        fetchProfile(u.id).then(profile => {
          setUser({
            id: u.id,
            email: u.email || '',
            preferredAppLanguage: language,
            onboardingCompleted: !!profile,
            profile: profile || undefined,
          })
          setAuthLoading(false)
        })
      } else {
        setAuthLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null)
        return
      }
      const u = session.user
      fetchProfile(u.id).then(profile => {
        setUser({
          id: u.id,
          email: u.email || '',
          preferredAppLanguage: language,
          onboardingCompleted: !!profile,
          profile: profile || undefined,
        })
      })
    })

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return error.message
    setLanguage(preferredAppLanguage)
    // If Supabase requires email confirmation, user won't have a session yet
    // but we still set local state so they can proceed to onboarding
    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email || email,
        preferredAppLanguage,
        onboardingCompleted: false,
      })
    }
    return null
  }

  const completeOnboarding = async (profile: OnboardingProfile) => {
    if (!user) return

    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      country_of_origin: profile.countryOfOrigin || null,
      immigration_status: profile.immigrationStatus || null,
      language_preference: profile.preferredLanguage,
      occupation: profile.occupation || null,
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
  }

  const toggleSavedResource = (resource: Resource) => {
    setSavedResourceIds(current => {
      if (current.includes(resource.id)) {
        return current.filter(id => id !== resource.id)
      }
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
      signIn,
      startSignUp,
      completeOnboarding,
      signOut,
      toggleSavedResource,
      hasSavedResource,
      addChatMessage,
      addAnalyzerRecord,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, user, authLoading, savedResourceIds, analyzerHistory, chatHistory]
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
