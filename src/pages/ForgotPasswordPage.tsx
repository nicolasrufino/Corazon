import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthSidePanel } from '@/components/AuthSidePanel'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/context/AppContext'

export const ForgotPasswordPage = () => {
  const { language, resetPassword } = useAppContext()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const isEs = language === 'es'

  const submit = async (event?: FormEvent) => {
    event?.preventDefault()
    setError('')
    setInfo('')

    if (!email.trim()) {
      setError(isEs ? 'Por favor ingresa tu correo.' : 'Please enter your email.')
      return
    }

    setLoading(true)
    const err = await resetPassword(email.trim())
    setLoading(false)

    if (err) {
      setError(err)
      return
    }

    setInfo(
      isEs
        ? 'Revisa tu correo para las instrucciones de restablecimiento.'
        : 'Check your email for reset instructions.'
    )
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-border/60 bg-card/80 lg:grid-cols-2">
      <AuthSidePanel />

      <section className="p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl">
          {isEs ? 'Restablece tu contraseña' : 'Reset your Password'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isEs
            ? 'Ingresa tu correo y te enviaremos instrucciones para restablecerla.'
            : 'Enter your Email and we will send reset instructions'}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="reset-email" className="mb-2 block text-sm font-medium">
              Email:
            </label>
            <input
              id="reset-email"
              type="email"
              autoFocus
              value={email}
              onChange={event => setEmail(event.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="maria@email.com"
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : null}

          {info ? (
            <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 p-3">
              <p className="text-sm text-blue-200">{info}</p>
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full cursor-pointer bg-[var(--cta)] text-background hover:bg-[var(--cta)]/85 disabled:opacity-50"
          >
            {loading
              ? isEs
                ? 'Enviando...'
                : 'Sending...'
              : isEs
                ? 'Enviar enlace'
                : 'Send Reset Link'}
          </Button>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="text-sm text-white underline decoration-white underline-offset-4 transition-opacity hover:opacity-80"
            >
              {isEs ? 'Volver al inicio de sesión' : 'Back to sign in'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
