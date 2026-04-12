import { useAppContext } from '@/context/AppContext'

/**
 * Left-side branding panel shared by AuthPage and ForgotPasswordPage.
 * Renders as a full-height half-screen panel on lg+; hidden on mobile.
 */
const features = [
  { en: 'Verified bilingual directory', es: 'Directorio bilingüe verificado' },
  { en: 'Community voice assistant', es: 'Asistente de voz comunitario' },
  { en: 'Discovery feed', es: 'Feed de descubrimiento' },
  { en: 'Latino organization finder', es: 'Buscador de organizaciones latinas' },
  { en: 'Privacy-first profile', es: 'Perfil con privacidad primero' },
]

export const AuthSidePanel = () => {
  const { language } = useAppContext()
  const isEs = language === 'es'

  return (
    <section className="relative hidden h-full flex-col overflow-hidden lg:flex lg:w-1/2">
      {/* Photo background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/signup_photo.png)',
          filter: 'grayscale(1) brightness(0.8)',
        }}
      />
      {/* Cinematic layered overlays: deep base + warm glow + vignette */}
      <div className="absolute inset-0 bg-black/55" />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(255,138,31,0.18) 0%, transparent 55%), radial-gradient(ellipse at 70% 90%, rgba(255,69,96,0.12) 0%, transparent 60%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40"
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent"
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
        <div>
          <p
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary backdrop-blur-sm"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Corazón
          </p>
          <h1 className="mt-6 max-w-md bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-4xl leading-[1.1] text-transparent xl:text-5xl">
            {isEs ? 'Tu red de apoyo confiable' : 'Your trusted support network'}
          </h1>
          <ul className="mt-10 space-y-3 text-sm text-foreground/90">
            {features.map(f => (
              <li
                key={f.en}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 backdrop-blur-sm transition-colors duration-300 hover:border-primary/40 hover:bg-primary/5"
              >
                <span
                  aria-hidden="true"
                  className="inline-block size-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_10px_rgba(255,69,96,0.8)]"
                />
                {isEs ? f.es : f.en}
              </li>
            ))}
          </ul>
        </div>
        <p
          className="text-xs tracking-wider text-foreground/50"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          {isEs ? 'De latinos para latinos.' : 'By Latinos, for Latinos.'}
        </p>
      </div>
    </section>
  )
}
