import type { ReactNode } from 'react'
import { Compass, FileText, Home, LogOut, MapPinned, Menu, UserRound } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LanguageToggle } from '@/components/LanguageToggle'
import { useAppContext } from '@/context/AppContext'
import { cn } from '@/lib/utils'

interface LayoutShellProps {
  children: ReactNode
}

const navigation = [
  { to: '/', icon: Home, labelEs: 'Recursos', labelEn: 'Resources' },
  { to: '/community', icon: MapPinned, labelEs: 'Comunidad', labelEn: 'Community' },
  { to: '/analyzer', icon: FileText, labelEs: 'Analizador', labelEn: 'Analyzer' },
]

export const LayoutShell = ({ children }: LayoutShellProps) => {
  const { language, user, signOut } = useAppContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.24),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.2),transparent_42%),linear-gradient(180deg,rgba(15,15,35,0.95),rgba(15,15,35,1))]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Compass className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-heading text-lg leading-none">Brújula</p>
              <p className="text-xs text-muted-foreground">
                {language === 'es' ? 'De latinos para latinos' : 'For Latino communities'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors duration-200 hover:bg-primary/10 lg:hidden"
            onClick={() => setIsMenuOpen(current => !current)}
            aria-label={language === 'es' ? 'Abrir menú' : 'Open menu'}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageToggle />
            {user ? (
              <button
                type="button"
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors duration-200 hover:bg-destructive/15"
                onClick={signOut}
              >
                <LogOut className="size-4" aria-hidden="true" />
                {language === 'es' ? 'Cerrar sesión' : 'Sign out'}
              </button>
            ) : (
              <NavLink
                to="/auth"
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors duration-200 hover:bg-primary/15"
              >
                <UserRound className="size-4" aria-hidden="true" />
                {language === 'es' ? 'Ingresar' : 'Sign in'}
              </NavLink>
            )}
          </div>
        </div>

        {isMenuOpen ? (
          <div className="border-t border-border/60 px-4 py-4 lg:hidden">
            <div className="mb-3">
              <LanguageToggle />
            </div>
            <div className="flex flex-col gap-2">
              {navigation.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-200',
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-foreground hover:bg-primary/10'
                    )
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {language === 'es' ? item.labelEs : item.labelEn}
                </NavLink>
              ))}

              {user ? (
                <button
                  type="button"
                  className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-destructive/20"
                  onClick={signOut}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  {language === 'es' ? 'Cerrar sesión' : 'Sign out'}
                </button>
              ) : (
                <NavLink
                  to="/auth"
                  className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-primary/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserRound className="size-4" aria-hidden="true" />
                  {language === 'es' ? 'Ingresar' : 'Sign in'}
                </NavLink>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <div className="flex min-h-[calc(100vh-73px)] w-full gap-0 lg:gap-6">
        <aside className="hidden w-72 shrink-0 border-r border-border/50 px-5 py-6 lg:block">
          <div className="space-y-5 rounded-2xl border border-border/50 bg-card/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {language === 'es' ? 'Navegación' : 'Navigation'}
            </p>

            <nav className="space-y-1">
              {navigation.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-foreground hover:bg-primary/15'
                    )
                  }
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {language === 'es' ? item.labelEs : item.labelEn}
                </NavLink>
              ))}
            </nav>

            <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
              <p className="font-heading text-sm">
                {language === 'es' ? 'Privacidad primero' : 'Privacy first'}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {language === 'es'
                  ? 'No compartimos tus datos sensibles fuera de la plataforma. Tú decides qué completar en tu perfil.'
                  : 'Sensitive profile information stays in the platform. You decide what to share during onboarding.'}
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-2 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
