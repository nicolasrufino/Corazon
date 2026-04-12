import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppNavbar from '@/components/AppNavbar'
import { LayoutShell } from '@/components/LayoutShell'
import { VoiceAssistant } from '@/components/VoiceAssistant'
import { useAppContext } from '@/context/AppContext'
import { AuthPage } from '@/pages/AuthPage'
import { CommunityPage } from '@/pages/CommunityPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { DocumentAnalyzerPage } from '@/pages/DocumentAnalyzerPage'
import { LandingPage } from '@/pages/LandingPage'
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
  const isLanding = location.pathname === '/landing'
  const isAuthScreen = location.pathname === '/auth' || location.pathname === '/onboarding'

  if (isLanding) {
    return (
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    )
  }

  if (isAuthScreen) {
    return (
      <div
        className="relative min-h-screen w-full text-foreground"
        style={{ background: '#050608' }}
      >
        <AppNavbar />

        <div className="flex min-h-screen w-full items-center justify-center px-4 pt-24 pb-12 sm:px-6 lg:px-8">
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
