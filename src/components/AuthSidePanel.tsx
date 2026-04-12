import { useAppContext } from '@/context/AppContext'

/**
 * Left-side branding panel shared by AuthPage and ForgotPasswordPage.
 * Renders as a full-height half-screen panel on lg+; hidden on mobile.
 */
const features = [
  { en: 'Verified bilingual directory', es: 'Directorio bilingüe verificado' },
  { en: 'Document analyzer', es: 'Analizador de documentos' },
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
          filter: 'grayscale(1) brightness(0.85)',
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.25em] text-primary"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Corazón
          </p>
          <h1 className="mt-6 text-4xl leading-tight xl:text-5xl">
            {isEs ? 'Tu red de apoyo confiable' : 'Your trusted support network'}
          </h1>
          <ul className="mt-8 space-y-4 text-sm text-foreground/80">
            {features.map(f => (
              <li key={f.en}>• {isEs ? f.es : f.en}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-foreground/40" style={{ fontFamily: 'var(--font-brand)' }}>
          {isEs ? 'De latinos para latinos.' : 'By Latinos, for Latinos.'}
        </p>
      </div>
    </section>
  )
}
