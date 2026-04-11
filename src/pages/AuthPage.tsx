import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';

export const AuthPage = () => {
  const { language, signIn, startSignUp } = useAppContext();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredAppLanguage, setPreferredAppLanguage] = useState<'es' | 'en'>(language);
  const [error, setError] = useState('');

  const submit = () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError(
        language === 'es'
          ? 'Por favor completa correo y contraseña.'
          : 'Please complete email and password.',
      );
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError(
        language === 'es'
          ? 'Las contraseñas no coinciden.'
          : 'Passwords do not match.',
      );
      return;
    }

    if (isSignUp) {
      startSignUp({
        email,
        password,
        preferredAppLanguage,
      });
      navigate('/onboarding');
      return;
    }

    signIn(email, preferredAppLanguage);
    navigate('/');
  };

  return (
    <div className="mx-auto grid min-h-[70vh] w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-2xl shadow-black/30 lg:grid-cols-2">
      <section className="relative flex flex-col justify-between gap-6 bg-primary/20 p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(139,92,246,0.25),rgba(167,139,250,0.08))]" />
        </div>

        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/90">Brújula</p>
          <h1 className="mt-4 text-3xl sm:text-4xl">
            {language === 'es' ? 'Tu red de apoyo confiable' : 'Your trusted support network'}
          </h1>
          <ul className="mt-6 space-y-3 text-sm text-foreground/90">
            <li>• {language === 'es' ? 'Directorio bilingüe verificado' : 'Verified bilingual directory'}</li>
            <li>• {language === 'es' ? 'Analizador de documentos' : 'Document analyzer'}</li>
            <li>• {language === 'es' ? 'Asistente de voz comunitario' : 'Community voice assistant'}</li>
          </ul>
        </div>
      </section>

      <section className="p-6 sm:p-8">
        <div className="flex gap-2 rounded-full bg-background p-1">
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`h-11 w-full cursor-pointer rounded-full text-sm font-semibold transition-colors duration-200 ${
              isSignUp ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'
            }`}
          >
            {language === 'es' ? 'Crear cuenta' : 'Create account'}
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`h-11 w-full cursor-pointer rounded-full text-sm font-semibold transition-colors duration-200 ${
              !isSignUp ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'
            }`}
          >
            {language === 'es' ? 'Iniciar sesión' : 'Sign in'}
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="auth-email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="maria@email.com"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="mb-2 block text-sm font-medium">
              {language === 'es' ? 'Contraseña' : 'Password'}
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {isSignUp ? (
            <div>
              <label htmlFor="auth-confirm" className="mb-2 block text-sm font-medium">
                {language === 'es' ? 'Confirmar contraseña' : 'Confirm password'}
              </label>
              <input
                id="auth-confirm"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="auth-language" className="mb-2 block text-sm font-medium">
              {language === 'es' ? 'Idioma de la cuenta' : 'Account language'}
            </label>
            <select
              id="auth-language"
              value={preferredAppLanguage}
              onChange={(event) => setPreferredAppLanguage(event.target.value as 'es' | 'en')}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            type="button"
            onClick={submit}
            className="h-11 w-full cursor-pointer bg-[var(--cta)] text-background hover:bg-[var(--cta)]/85"
          >
            {isSignUp
              ? language === 'es'
                ? 'Continuar a onboarding'
                : 'Continue to onboarding'
              : language === 'es'
                ? 'Entrar a Brújula'
                : 'Enter Brújula'}
          </Button>
        </div>
      </section>
    </div>
  );
};
