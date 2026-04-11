import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/context/AppContext'
import type {
  ImmigrationStatus,
  Occupation,
  OnboardingProfile,
  ResourceCategory,
  UiLanguagePreference,
} from '@/types/app'

const steps = [1, 2, 3, 4, 5] as const

const goalOptions: Array<{ value: ResourceCategory; labelEs: string; labelEn: string }> = [
  { value: 'healthcare', labelEs: 'Salud', labelEn: 'Health' },
  { value: 'legal', labelEs: 'Legal', labelEn: 'Legal' },
  { value: 'immigration', labelEs: 'Inmigración', labelEn: 'Immigration' },
  { value: 'community', labelEs: 'Comunidad', labelEn: 'Community' },
  { value: 'business', labelEs: 'Negocios', labelEn: 'Business' },
  { value: 'education', labelEs: 'Educación', labelEn: 'Education' },
  { value: 'social_life', labelEs: 'Vida social', labelEn: 'Social life' },
  { value: 'language_learning', labelEs: 'Aprender inglés', labelEn: 'Language learning' },
  { value: 'financial_aid', labelEs: 'Ayuda financiera', labelEn: 'Financial aid' },
]

export const OnboardingPage = () => {
  const { completeOnboarding, language, user } = useAppContext()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [countryOfOrigin, setCountryOfOrigin] = useState('')
  const [immigrationStatus, setImmigrationStatus] = useState<ImmigrationStatus | ''>('')
  const [visaType, setVisaType] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState<UiLanguagePreference>('spanish')
  const [occupation, setOccupation] = useState<Occupation | ''>('')
  const [goals, setGoals] = useState<ResourceCategory[]>([])

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  const nextStep = () => setStep(current => Math.min(5, current + 1))
  const previousStep = () => setStep(current => Math.max(1, current - 1))

  const toggleGoal = (goal: ResourceCategory) => {
    setGoals(current =>
      current.includes(goal) ? current.filter(item => item !== goal) : [...current, goal]
    )
  }

  const finishOnboarding = () => {
    const profile: OnboardingProfile = {
      countryOfOrigin: countryOfOrigin || undefined,
      immigrationStatus: immigrationStatus || undefined,
      visaType: immigrationStatus === 'visa_holder' ? visaType || undefined : undefined,
      preferredLanguage,
      occupation: occupation || undefined,
      goals,
    }

    completeOnboarding(profile)
    navigate('/')
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-3xl border border-border/60 bg-card/80 p-5 shadow-2xl shadow-black/30 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {language === 'es' ? 'Onboarding personalizado' : 'Personalized onboarding'}
      </p>
      <h1 className="mt-3 text-3xl sm:text-4xl">
        {language === 'es' ? 'Cuéntanos un poco sobre ti' : 'Tell us a little about yourself'}
      </h1>

      <div className="mt-6 flex items-center gap-2">
        {steps.map(item => (
          <span
            key={item}
            className={`h-2 flex-1 rounded-full ${item <= step ? 'bg-primary' : 'bg-muted'}`}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {step === 1 ? (
          <div>
            <label htmlFor="country" className="mb-2 block text-sm font-medium">
              {language === 'es' ? 'País de origen (opcional)' : 'Country of origin (optional)'}
            </label>
            <input
              id="country"
              type="text"
              value={countryOfOrigin}
              onChange={event => setCountryOfOrigin(event.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={language === 'es' ? 'Ej. México' : 'e.g. Mexico'}
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <div>
              <label htmlFor="status" className="mb-2 block text-sm font-medium">
                {language === 'es'
                  ? 'Estatus migratorio (opcional)'
                  : 'Immigration status (optional)'}
              </label>
              <select
                id="status"
                value={immigrationStatus}
                onChange={event => setImmigrationStatus(event.target.value as ImmigrationStatus)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">{language === 'es' ? 'Seleccionar' : 'Select'}</option>
                <option value="citizen">{language === 'es' ? 'Ciudadano' : 'Citizen'}</option>
                <option value="permanent_resident">
                  {language === 'es' ? 'Residente permanente' : 'Permanent resident'}
                </option>
                <option value="daca">DACA</option>
                <option value="visa_holder">{language === 'es' ? 'Visa' : 'Visa holder'}</option>
                <option value="undocumented">
                  {language === 'es' ? 'Indocumentado' : 'Undocumented'}
                </option>
                <option value="prefer_not_to_say">
                  {language === 'es' ? 'Prefiero no decir' : 'Prefer not to say'}
                </option>
              </select>
            </div>

            {immigrationStatus === 'visa_holder' ? (
              <div>
                <label htmlFor="visa-type" className="mb-2 block text-sm font-medium">
                  {language === 'es' ? '¿Qué tipo de visa?' : 'Which visa type?'}
                </label>
                <input
                  id="visa-type"
                  type="text"
                  value={visaType}
                  onChange={event => setVisaType(event.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="B1/B2, U Visa, etc."
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <label htmlFor="pref-language" className="mb-2 block text-sm font-medium">
              {language === 'es'
                ? 'Preferencia de idioma (requerido)'
                : 'Language preference (required)'}
            </label>
            <select
              id="pref-language"
              value={preferredLanguage}
              onChange={event => setPreferredLanguage(event.target.value as UiLanguagePreference)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="spanish">Español</option>
              <option value="english">English</option>
              <option value="both">{language === 'es' ? 'Ambos' : 'Both'}</option>
            </select>
          </div>
        ) : null}

        {step === 4 ? (
          <div>
            <label htmlFor="occupation" className="mb-2 block text-sm font-medium">
              {language === 'es' ? 'Ocupación principal (opcional)' : 'Main occupation (optional)'}
            </label>
            <select
              id="occupation"
              value={occupation}
              onChange={event => setOccupation(event.target.value as Occupation)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">{language === 'es' ? 'Seleccionar' : 'Select'}</option>
              <option value="student">{language === 'es' ? 'Estudiante' : 'Student'}</option>
              <option value="worker">{language === 'es' ? 'Trabajador(a)' : 'Worker'}</option>
              <option value="job_seeker">
                {language === 'es' ? 'Buscando trabajo' : 'Looking for a job'}
              </option>
              <option value="other">{language === 'es' ? 'Otro' : 'Other'}</option>
            </select>
          </div>
        ) : null}

        {step === 5 ? (
          <div>
            <p className="mb-3 text-sm font-medium">
              {language === 'es' ? 'Tus metas (opcional)' : 'Your goals (optional)'}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {goalOptions.map(goal => {
                const isSelected = goals.includes(goal.value)
                return (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => toggleGoal(goal.value)}
                    className={`h-11 cursor-pointer rounded-xl border px-3 text-left text-sm font-medium transition-colors duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:bg-primary/10'
                    }`}
                  >
                    {language === 'es' ? goal.labelEs : goal.labelEn}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="h-11 cursor-pointer"
          onClick={previousStep}
          disabled={step === 1}
        >
          {language === 'es' ? 'Atrás' : 'Back'}
        </Button>

        {step < 5 ? (
          <Button type="button" className="h-11 cursor-pointer" onClick={nextStep}>
            {language === 'es' ? 'Siguiente' : 'Next'}
          </Button>
        ) : (
          <Button
            type="button"
            className="h-11 cursor-pointer bg-[var(--cta)] text-background hover:bg-[var(--cta)]/85"
            onClick={finishOnboarding}
          >
            {language === 'es' ? 'Finalizar perfil' : 'Finish profile'}
          </Button>
        )}
      </div>
    </div>
  )
}
