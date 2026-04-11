import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { LayoutShell } from '@/components/LayoutShell'
import { VoiceAssistant } from '@/components/VoiceAssistant'
import { useAppContext } from '@/context/AppContext'
import { AuthPage } from '@/pages/AuthPage'
import { CommunityPage } from '@/pages/CommunityPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { DocumentAnalyzerPage } from '@/pages/DocumentAnalyzerPage'
import { OnboardingPage } from '@/pages/OnboardingPage'

const ProtectedOnboardingRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAppContext()

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

const AuthGuardRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAppContext()

  if (!user) {
    return children
  }

  if (!user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  return <Navigate to="/" replace />
}

const AppFrame = () => {
  const { user } = useAppContext()
  const location = useLocation()
  const isAuthScreen = location.pathname === '/auth' || location.pathname === '/onboarding'

  if (isAuthScreen) {
    return (
      <div className="relative min-h-screen w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.24),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.18),transparent_42%),linear-gradient(180deg,rgba(15,15,35,0.95),rgba(15,15,35,1))]" />
        </div>

        <Routes>
          <Route
            path="/auth"
            element={
              <AuthGuardRoute>
                <AuthPage />
              </AuthGuardRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedOnboardingRoute>
                <OnboardingPage />
              </ProtectedOnboardingRoute>
            }
          />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </div>
    )
  }

  if (user && !user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <LayoutShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/analyzer" element={<DocumentAnalyzerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <VoiceAssistant />
    </LayoutShell>
  )
}

function App() {
  return <AppFrame />
}

export default App
