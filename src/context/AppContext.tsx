import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'
import type {
  AnalyzerRecord,
  AppLanguage,
  ChatMessage,
  OnboardingProfile,
  Resource,
  User,
} from '@/types/app'

interface AuthDraft {
  email: string
  password: string
  preferredAppLanguage: AppLanguage
}

interface AppContextValue {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  user: User | null
  authDraft: AuthDraft | null
  savedResourceIds: string[]
  analyzerHistory: AnalyzerRecord[]
  chatHistory: ChatMessage[]
  signIn: (email: string, preferredAppLanguage: AppLanguage) => void
  startSignUp: (draft: AuthDraft) => void
  completeOnboarding: (profile: OnboardingProfile) => void
  signOut: () => void
  toggleSavedResource: (resource: Resource) => void
  hasSavedResource: (resourceId: string) => boolean
  addChatMessage: (message: ChatMessage) => void
  addAnalyzerRecord: (record: AnalyzerRecord) => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<AppLanguage>('es')
  const [user, setUser] = useState<User | null>(null)
  const [authDraft, setAuthDraft] = useState<AuthDraft | null>(null)
  const [savedResourceIds, setSavedResourceIds] = useState<string[]>([])
  const [analyzerHistory, setAnalyzerHistory] = useState<AnalyzerRecord[]>([])
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  const signIn = (email: string, preferredAppLanguage: AppLanguage) => {
    setUser({
      id: `user-${Date.now()}`,
      email,
      preferredAppLanguage,
      onboardingCompleted: true,
    })
    setLanguage(preferredAppLanguage)
  }

  const startSignUp = (draft: AuthDraft) => {
    setAuthDraft(draft)
    setLanguage(draft.preferredAppLanguage)
    setUser({
      id: `pending-${Date.now()}`,
      email: draft.email,
      preferredAppLanguage: draft.preferredAppLanguage,
      onboardingCompleted: false,
    })
  }

  const completeOnboarding = (profile: OnboardingProfile) => {
    setUser(currentUser => {
      if (!currentUser) {
        return null
      }

      return {
        ...currentUser,
        onboardingCompleted: true,
        profile,
      }
    })
    setAuthDraft(null)
  }

  const signOut = () => {
    setUser(null)
    setSavedResourceIds([])
    setAnalyzerHistory([])
    setChatHistory([])
    setAuthDraft(null)
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
      authDraft,
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
    [language, user, authDraft, savedResourceIds, analyzerHistory, chatHistory]
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
