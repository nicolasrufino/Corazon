import type { ReactNode } from 'react'
import { Compass, Home } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import AppNavbar from '@/components/AppNavbar'
import { useAppContext } from '@/context/AppContext'
import { cn } from '@/lib/utils'

interface LayoutShellProps {
  children: ReactNode
}

const navigation = [
  { to: '/dashboard', icon: Home, labelEs: 'Recursos', labelEn: 'Resources' },
  { to: '/discovery', icon: Compass, labelEs: 'Descubre', labelEn: 'Discovery' },
]

export const LayoutShell = ({ children }: LayoutShellProps) => {
  const { language } = useAppContext()

  return (
    <div
      className="theme-app relative min-h-screen w-full text-foreground"
      style={{ background: '#050608' }}
    >
      <AppNavbar />

      <div className="flex w-full gap-0 pt-16 sm:pt-18 lg:gap-6">
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
                        ? 'bg-primary text-primary-foreground'
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
