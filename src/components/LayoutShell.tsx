import type { CSSProperties, ReactNode } from 'react'
import {
  BarChart3,
  Compass,
  ExternalLink,
  Home,
  MessageCircle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import AppNavbar from '@/components/AppNavbar'
import { useAppContext } from '@/context/AppContext'
import { cn } from '@/lib/utils'

interface LayoutShellProps {
  children: ReactNode
}

const navigation = [
  {
    to: '/dashboard',
    icon: Home,
    labelEs: 'Recursos',
    labelEn: 'Resources',
    color: '#ff8100',
  },
  {
    to: '/discovery',
    icon: Compass,
    labelEs: 'Descubre',
    labelEn: 'Discovery',
    color: '#1777d7',
  },
  {
    to: '/impact',
    icon: BarChart3,
    labelEs: 'Impacto',
    labelEn: 'Impact',
    color: '#00aa63',
  },
]

const openChatAssistant = () => {
  // Dispatched at window scope; VoiceAssistant listens for this event
  // and opens its dialog. Avoids lifting state into AppContext.
  window.dispatchEvent(new CustomEvent('corazon:open-chat'))
}

export const LayoutShell = ({ children }: LayoutShellProps) => {
  const { language } = useAppContext()

  return (
    <div
      className="theme-app relative min-h-screen w-full text-foreground"
      style={{ background: '#050608' }}
    >
      <AppNavbar />

      <div className="flex w-full gap-0 pt-16 sm:pt-18 lg:gap-6">
        <aside className="relative hidden w-72 shrink-0 px-5 py-6 lg:block">
          <div className="sticky top-24 flex max-h-[calc(100vh-7rem)] flex-col gap-4">
            {/* Cinematic ambient glow behind the sidebar */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-20 top-0 h-[420px] w-[420px] rounded-full opacity-60 blur-3xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,138,31,0.18) 0%, rgba(255,69,96,0.08) 40%, transparent 70%)',
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-5 inset-y-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent"
            />

            {/* Navigation card */}
            <div className="relative space-y-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0b10]/60 p-4 backdrop-blur-xl">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff8100]/60 to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-50 blur-2xl"
                style={{
                  background: 'radial-gradient(circle, rgba(255,129,0,0.35) 0%, transparent 70%)',
                }}
              />

              <div className="relative flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-px w-6 bg-gradient-to-r from-transparent to-[#ff8100]/60"
                />
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#ffb15a]">
                  {language === 'es' ? 'Navegación' : 'Navigation'}
                </p>
              </div>

              <nav className="relative space-y-1">
                {navigation.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="group/nav relative inline-flex h-11 w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl px-2.5 text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/[0.04] hover:text-white [&.active]:text-white"
                    style={
                      {
                        ['--nav-color' as string]: item.color,
                      } as CSSProperties
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 rounded-xl"
                            style={{
                              background: `${item.color}14`,
                              boxShadow: `inset 0 0 0 1px ${item.color}66, 0 0 25px -8px ${item.color}99`,
                            }}
                          />
                        )}
                        <span
                          className="relative flex size-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-300"
                          style={
                            isActive
                              ? {
                                  borderColor: `${item.color}88`,
                                  background: `${item.color}22`,
                                  color: item.color,
                                  boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.15)',
                                }
                              : {
                                  borderColor: 'rgba(255,255,255,0.1)',
                                  background: 'rgba(255,255,255,0.03)',
                                  color: 'rgba(255,255,255,0.6)',
                                }
                          }
                          onMouseEnter={e => {
                            if (isActive) return
                            e.currentTarget.style.borderColor = `${item.color}55`
                            e.currentTarget.style.color = item.color
                          }}
                          onMouseLeave={e => {
                            if (isActive) return
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                            e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                          }}
                        >
                          <item.icon className="size-4" aria-hidden="true" />
                        </span>
                        <span className="relative">
                          {language === 'es' ? item.labelEs : item.labelEn}
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}

                {/* Chat — opens the floating Corazón assistant via a
                   custom window event listened to by VoiceAssistant.
                   Uses the pink Corazón brand letter color. */}
                <button
                  type="button"
                  onClick={openChatAssistant}
                  className="group/nav inline-flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/[0.04] hover:text-white"
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/60 transition-all duration-300"
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#ffb5e288'
                      e.currentTarget.style.color = '#ffb5e2'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                    }}
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                  </span>
                  {language === 'es' ? 'Chat' : 'Chat'}
                </button>
              </nav>
            </div>

            {/* Privacy callout — separate card, pinned to bottom */}
            <div className="relative mt-auto overflow-hidden rounded-2xl border border-white/10 bg-[#0a0b10]/60 p-4 backdrop-blur-xl">
              {/* Tropical PINK.jpg texture — very subtle warmth */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-screen"
                style={{
                  backgroundImage: "url('/PINK.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(1px)',
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff8100]/50 to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-60 blur-2xl"
                style={{
                  background: 'radial-gradient(circle, rgba(255,129,0,0.4) 0%, transparent 70%)',
                }}
              />
              <div className="relative flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#ff8100]/40 bg-gradient-to-br from-[#ff8100]/20 to-[#f82d1a]/10 shadow-[inset_0_1px_0_0_rgba(255,181,90,0.3)]">
                  <ShieldCheck className="size-4 text-[#ffb15a]" aria-hidden="true" />
                </span>
                <p className="font-heading text-sm text-white">
                  {language === 'es' ? 'Privacidad primero' : 'Privacy first'}
                </p>
              </div>
              <p className="relative mt-2.5 text-[11px] leading-relaxed text-white/55">
                {language === 'es'
                  ? 'No compartimos tus datos sensibles fuera de la plataforma. Tú decides qué completar en tu perfil.'
                  : 'Sensitive profile information stays in the platform. You decide what to share during onboarding.'}
              </p>
            </div>

            {/* Know Your Rights — ICE safety info */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0b10]/60 p-4 backdrop-blur-xl">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f82d1a]/60 to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-8 -bottom-8 h-24 w-24 rounded-full opacity-60 blur-2xl"
                style={{
                  background: 'radial-gradient(circle, rgba(248,45,26,0.45) 0%, transparent 70%)',
                }}
              />
              <div className="relative flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#f82d1a]/40 bg-gradient-to-br from-[#f82d1a]/20 to-[#ff8100]/10 shadow-[inset_0_1px_0_0_rgba(255,181,90,0.3)]">
                  <ShieldAlert className="size-4 text-[#ff8100]" aria-hidden="true" />
                </span>
                <p className="font-heading text-sm text-white">
                  {language === 'es' ? 'Conoce tus derechos · ICE' : 'Know your rights · ICE'}
                </p>
              </div>
              <p className="relative mt-2 text-[11px] leading-relaxed text-white/55">
                {language === 'es'
                  ? 'Protégete a ti y a tu familia si ICE llega a tu puerta.'
                  : 'Protect yourself and your family if ICE comes to your door.'}
              </p>
              <ul className="relative mt-2.5 space-y-1.5 text-[11px] leading-relaxed text-white/55">
                <li className="flex gap-1.5">
                  <span className="text-[#ff8100]">•</span>
                  {language === 'es'
                    ? 'No abras la puerta sin una orden firmada por un juez.'
                    : "Don't open the door without a warrant signed by a judge."}
                </li>
                <li className="flex gap-1.5">
                  <span className="text-[#ff8100]">•</span>
                  {language === 'es'
                    ? 'Tienes derecho a permanecer en silencio.'
                    : 'You have the right to remain silent.'}
                </li>
                <li className="flex gap-1.5">
                  <span className="text-[#ff8100]">•</span>
                  {language === 'es'
                    ? 'No firmes nada sin hablar con un abogado.'
                    : "Don't sign anything without a lawyer."}
                </li>
              </ul>
              <div className="relative mt-3 flex flex-col gap-1.5 border-t border-[#ff8100]/15 pt-2.5">
                <a
                  href="https://www.ilrc.org/red-cards-tarjetas-rojas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#ffb15a] transition-colors hover:text-[#ff8100]"
                >
                  <ExternalLink className="size-3" aria-hidden="true" />
                  {language === 'es' ? 'Tarjetas rojas (ILRC)' : 'Red Cards (ILRC)'}
                </a>
                <a
                  href="https://www.aclu.org/know-your-rights/immigrants-rights"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#ffb15a] transition-colors hover:text-[#ff8100]"
                >
                  <ExternalLink className="size-3" aria-hidden="true" />
                  {language === 'es'
                    ? 'Derechos de inmigrantes (ACLU)'
                    : "Immigrants' rights (ACLU)"}
                </a>
                <a
                  href="https://unitedwedream.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#ffb15a] transition-colors hover:text-[#ff8100]"
                >
                  <ExternalLink className="size-3" aria-hidden="true" />
                  United We Dream
                </a>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-2 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
