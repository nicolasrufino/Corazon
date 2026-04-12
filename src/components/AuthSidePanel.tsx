import { useAppContext } from '@/context/AppContext'

/**
 * Left-side branding panel shared by AuthPage and ForgotPasswordPage so the
 * feature list stays in sync between them.
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
    <section className="relative flex flex-col justify-between gap-6 bg-primary/15 p-6 sm:p-8">
      <div className="relative z-10">
        <p
          className="text-xs font-semibold uppercase tracking-[0.25em] text-primary"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          Corazón
        </p>
        <h1 className="mt-4 text-3xl sm:text-4xl">
          {isEs ? 'Tu red de apoyo confiable' : 'Your trusted support network'}
        </h1>
        <ul className="mt-6 space-y-3 text-sm text-foreground/90">
          {features.map(f => (
            <li key={f.en}>• {isEs ? f.es : f.en}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
