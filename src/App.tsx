import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppNavbar from '@/components/AppNavbar'
import { LayoutShell } from '@/components/LayoutShell'
import { VoiceAssistant } from '@/components/VoiceAssistant'
import { useAppContext } from '@/context/AppContext'
import { AuthPage } from '@/pages/AuthPage'
import { CommunityPage } from '@/pages/CommunityPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { DiscoveryPage } from '@/pages/DiscoveryPage'
import { DocumentAnalyzerPage } from '@/pages/DocumentAnalyzerPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { LandingPage } from '@/pages/LandingPage'
import { OnboardingPage } from '@/pages/OnboardingPage'

/*──────────────────────────────────────────────
  Flow:
  /              → Landing page (public)
  /auth          → Sign in / Sign up (redirects to /dashboard if already logged in)
  /forgot-password → Password reset email request
  /onboarding    → Profile setup (requires auth, redirects to /auth if not)
  /dashboard     → Resource dashboard (requires auth + onboarding)
  /community     → Community finder (requires auth + onboarding)
  /discovery     → Pinterest-style explore feed (requires auth + onboarding)
  /analyzer      → Document analyzer (requires auth + onboarding)
──────────────────────────────────────────────*/

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, authLoading } = useAppContext()

  if (authLoading) return null

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (!user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

const OnboardingRoute = ({ children }: { children: ReactNode }) => {
  const { user, authLoading } = useAppContext()

  if (authLoading) return null

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

const AuthGuardRoute = ({ children }: { children: ReactNode }) => {
  const { user, authLoading } = useAppContext()

  if (authLoading) return null

  if (!user) {
    return children
  }

  if (!user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  return <Navigate to="/dashboard" replace />
}

const AppFrame = () => {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const isAuthScreen =
    location.pathname === '/auth' ||
    location.pathname === '/onboarding' ||
    location.pathname === '/forgot-password'

  // Landing page — standalone, no app chrome
  if (isLanding) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    )
  }

  // Auth + onboarding — minimal chrome with AppNavbar
  if (isAuthScreen) {
    return (
      <div
        className="theme-auth relative min-h-screen w-full text-foreground"
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
              path="/forgot-password"
              element={
                <AuthGuardRoute>
                  <ForgotPasswordPage />
                </AuthGuardRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <OnboardingRoute>
                  <OnboardingPage />
                </OnboardingRoute>
              }
            />
          </Routes>
        </div>
      </div>
    )
  }

  // App pages — full LayoutShell with sidebar + navbar
  return (
    <LayoutShell>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discovery"
          element={
            <ProtectedRoute>
              <DiscoveryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analyzer"
          element={
            <ProtectedRoute>
              <DocumentAnalyzerPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <VoiceAssistant />
    </LayoutShell>
  )
}

function App() {
  return <AppFrame />
}

export default App
