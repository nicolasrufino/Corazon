import { useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import type {
  ImmigrationStatus,
  Occupation,
  OnboardingProfile,
  ResourceCategory,
  UiLanguagePreference,
} from '@/types/app'

/* ─── Country data ─── */

interface CountryOption {
  code: string
  flag: string
  labelEs: string
  labelEn: string
}

const LATIN_AMERICAN: CountryOption[] = [
  { code: 'MX', flag: '🇲🇽', labelEs: 'México', labelEn: 'Mexico' },
  { code: 'GT', flag: '🇬🇹', labelEs: 'Guatemala', labelEn: 'Guatemala' },
  { code: 'SV', flag: '🇸🇻', labelEs: 'El Salvador', labelEn: 'El Salvador' },
  { code: 'HN', flag: '🇭🇳', labelEs: 'Honduras', labelEn: 'Honduras' },
  { code: 'CO', flag: '🇨🇴', labelEs: 'Colombia', labelEn: 'Colombia' },
  { code: 'EC', flag: '🇪🇨', labelEs: 'Ecuador', labelEn: 'Ecuador' },
  { code: 'PE', flag: '🇵🇪', labelEs: 'Perú', labelEn: 'Peru' },
  { code: 'VE', flag: '🇻🇪', labelEs: 'Venezuela', labelEn: 'Venezuela' },
  { code: 'CU', flag: '🇨🇺', labelEs: 'Cuba', labelEn: 'Cuba' },
  { code: 'DO', flag: '🇩🇴', labelEs: 'República Dominicana', labelEn: 'Dominican Republic' },
  { code: 'PR', flag: '🇵🇷', labelEs: 'Puerto Rico', labelEn: 'Puerto Rico' },
  { code: 'NI', flag: '🇳🇮', labelEs: 'Nicaragua', labelEn: 'Nicaragua' },
  { code: 'CR', flag: '🇨🇷', labelEs: 'Costa Rica', labelEn: 'Costa Rica' },
  { code: 'PA', flag: '🇵🇦', labelEs: 'Panamá', labelEn: 'Panama' },
  { code: 'AR', flag: '🇦🇷', labelEs: 'Argentina', labelEn: 'Argentina' },
  { code: 'CL', flag: '🇨🇱', labelEs: 'Chile', labelEn: 'Chile' },
  { code: 'BO', flag: '🇧🇴', labelEs: 'Bolivia', labelEn: 'Bolivia' },
  { code: 'PY', flag: '🇵🇾', labelEs: 'Paraguay', labelEn: 'Paraguay' },
  { code: 'UY', flag: '🇺🇾', labelEs: 'Uruguay', labelEn: 'Uruguay' },
  { code: 'BR', flag: '🇧🇷', labelEs: 'Brasil', labelEn: 'Brazil' },
  { code: 'HT', flag: '🇭🇹', labelEs: 'Haití', labelEn: 'Haiti' },
  { code: 'JM', flag: '🇯🇲', labelEs: 'Jamaica', labelEn: 'Jamaica' },
  { code: 'TT', flag: '🇹🇹', labelEs: 'Trinidad y Tobago', labelEn: 'Trinidad & Tobago' },
  { code: 'BZ', flag: '🇧🇿', labelEs: 'Belice', labelEn: 'Belize' },
  { code: 'GY', flag: '🇬🇾', labelEs: 'Guyana', labelEn: 'Guyana' },
  { code: 'SR', flag: '🇸🇷', labelEs: 'Surinam', labelEn: 'Suriname' },
]

const OTHER_COUNTRIES: CountryOption[] = [
  { code: 'US', flag: '🇺🇸', labelEs: 'Estados Unidos', labelEn: 'United States' },
  { code: 'CA', flag: '🇨🇦', labelEs: 'Canadá', labelEn: 'Canada' },
  { code: 'ES', flag: '🇪🇸', labelEs: 'España', labelEn: 'Spain' },
  { code: 'PT', flag: '🇵🇹', labelEs: 'Portugal', labelEn: 'Portugal' },
  { code: 'PH', flag: '🇵🇭', labelEs: 'Filipinas', labelEn: 'Philippines' },
  { code: 'IT', flag: '🇮🇹', labelEs: 'Italia', labelEn: 'Italy' },
]

const REGIONAL_GROUPS: CountryOption[] = [
  { code: 'ASIAN', flag: '🌏', labelEs: 'Origen asiático', labelEn: 'Asian background' },
  { code: 'AFRICAN', flag: '🌍', labelEs: 'Origen africano', labelEn: 'African background' },
  {
    code: 'EUROPEAN',
    flag: '🌎',
    labelEs: 'Origen europeo (otro)',
    labelEn: 'European background (other)',
  },
  {
    code: 'MIDEAST',
    flag: '🌍',
    labelEs: 'Origen medio-oriental',
    labelEn: 'Middle Eastern background',
  },
  { code: 'OTHER', flag: '🌐', labelEs: 'Otro', labelEn: 'Other' },
]

const ALL_COUNTRIES = [...LATIN_AMERICAN, ...OTHER_COUNTRIES, ...REGIONAL_GROUPS]

/* ─── Occupation options ─── */

const OCCUPATION_OPTIONS: Array<{ value: Occupation; labelEs: string; labelEn: string }> = [
  { value: 'student', labelEs: '🎓 Estudiante', labelEn: '🎓 Student' },
  { value: 'worker', labelEs: '💼 Trabajador(a)', labelEn: '💼 Worker' },
  {
    value: 'student_worker',
    labelEs: '📚💼 Estudiante + Trabajador(a)',
    labelEn: '📚💼 Student + Worker',
  },
  { value: 'job_seeker', labelEs: '🔍 Buscando trabajo', labelEn: '🔍 Looking for work' },
  { value: 'two_jobs', labelEs: '⚡ Dos trabajos', labelEn: '⚡ Two jobs' },
  { value: 'retired', labelEs: '🏡 Retirado(a)', labelEn: '🏡 Retired' },
  {
    value: 'caregiver',
    labelEs: '🤲 Cuidador(a) del hogar',
    labelEn: '🤲 Caregiver / Homemaker',
  },
  { value: 'other', labelEs: '✦ Otro', labelEn: '✦ Other' },
]

/* ─── Goal options ─── */

const GOAL_OPTIONS: Array<{ value: ResourceCategory; labelEs: string; labelEn: string }> = [
  {
    value: 'healthcare',
    labelEs: '🏥 Encontrar un doctor o clínica',
    labelEn: '🏥 Find a doctor or clinic',
  },
  { value: 'legal', labelEs: '⚖️ Obtener ayuda legal', labelEn: '⚖️ Get legal help' },
  {
    value: 'immigration',
    labelEs: '🛂 Navegar mi situación migratoria',
    labelEn: '🛂 Navigate my immigration situation',
  },
  {
    value: 'community',
    labelEs: '🤝 Conectar con mi comunidad',
    labelEn: '🤝 Connect with my community',
  },
  {
    value: 'business',
    labelEs: '🚀 Empezar o crecer un negocio',
    labelEn: '🚀 Start or grow a business',
  },
  {
    value: 'education',
    labelEs: '🎓 Encontrar becas o educación',
    labelEn: '🎓 Find education or scholarships',
  },
  {
    value: 'language_learning',
    labelEs: '🗣️ Aprender inglés',
    labelEn: '🗣️ Learn English',
  },
  {
    value: 'financial_aid',
    labelEs: '💰 Conseguir ayuda financiera',
    labelEn: '💰 Get financial help',
  },
  {
    value: 'social_life',
    labelEs: '🎉 Conocer gente y eventos',
    labelEn: '🎉 Meet people and find events',
  },
]

/* ─── Step titles ─── */

const STEP_TITLES: Array<{ es: string; en: string }> = [
  { es: '¿De dónde eres?', en: 'Where are you from?' },
  { es: 'Tu situación migratoria', en: 'Your immigration status' },
  { es: '¿En qué idioma prefieres?', en: 'What language do you prefer?' },
  { es: '¿A qué te dedicas?', en: 'What do you do?' },
  { es: '¿Qué quieres lograr?', en: 'What do you want to accomplish?' },
]

const STEP_SUBTITLES: Array<{ es: string; en: string }> = [
  {
    es: 'Esto nos ayuda a mostrarte recursos de tu comunidad.',
    en: 'This helps us show you resources from your community.',
  },
  {
    es: 'Solo si te sientes cómodo(a). Nunca es obligatorio.',
    en: 'Only if you feel comfortable. Never required.',
  },
  {
    es: 'Puedes cambiarlo en cualquier momento.',
    en: 'You can change this anytime.',
  },
  {
    es: 'Esto nos ayuda a mostrarte becas, programas laborales o recursos profesionales.',
    en: 'This helps us show you scholarships, job programs, or professional resources.',
  },
  {
    es: 'Selecciona todo lo que aplique. Te mostraremos recursos relevantes.',
    en: "Select everything that applies. We'll show you relevant resources.",
  },
]

const TOTAL_STEPS = 5

/* ─── Component ─── */

export const OnboardingPage = () => {
  const { completeOnboarding, language, user } = useAppContext()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [countryOfOrigin, setCountryOfOrigin] = useState('')
  const [countrySearch, setCountrySearch] = useState('')
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [immigrationStatus, setImmigrationStatus] = useState<ImmigrationStatus | ''>('')
  const [visaType, setVisaType] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState<UiLanguagePreference>('both')
  const [occupation, setOccupation] = useState<Occupation | ''>('')
  const [goals, setGoals] = useState<ResourceCategory[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return ALL_COUNTRIES
    const q = countrySearch.toLowerCase()
    return ALL_COUNTRIES.filter(
      c =>
        c.labelEs.toLowerCase().includes(q) ||
        c.labelEn.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    )
  }, [countrySearch])

  const title = STEP_TITLES[step - 1]
  const subtitle = STEP_SUBTITLES[step - 1]

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  const nextStep = () => setStep(current => Math.min(TOTAL_STEPS, current + 1))
  const previousStep = () => setStep(current => Math.max(1, current - 1))

  const toggleGoal = (goal: ResourceCategory) => {
    setGoals(current =>
      current.includes(goal) ? current.filter(item => item !== goal) : [...current, goal]
    )
  }

  const selectCountry = (option: CountryOption) => {
    const label = language === 'es' ? option.labelEs : option.labelEn
    setCountryOfOrigin(label)
    setCountrySearch('')
    setCountryDropdownOpen(false)
  }

  const finishOnboarding = async () => {
    const profile: OnboardingProfile = {
      countryOfOrigin: countryOfOrigin || undefined,
      immigrationStatus: immigrationStatus || undefined,
      visaType: immigrationStatus === 'visa_holder' ? visaType || undefined : undefined,
      preferredLanguage,
      occupation: occupation || undefined,
      goals,
    }

    await completeOnboarding(profile)
    navigate('/dashboard')
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-3xl border border-border/60 bg-card/80 p-5 sm:p-8">
      {/* Intro banner — only on step 1 */}
      {step === 1 && (
        <div className="mb-6 rounded-xl border border-aquamarine/20 bg-aquamarine/5 p-4">
          <p className="text-sm leading-relaxed text-pearl/90">
            {language === 'es'
              ? '✦ Todo aquí es opcional. Tu información es 100% privada. Puedes saltar cualquier paso.'
              : '✦ Everything here is optional. Your information is 100% private. Skip anything you want.'}
          </p>
        </div>
      )}

      {/* Step title */}
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {language === 'es' ? `Paso ${step} de ${TOTAL_STEPS}` : `Step ${step} of ${TOTAL_STEPS}`}
      </p>
      <h1 className="mt-3 text-3xl sm:text-4xl">{language === 'es' ? title.es : title.en}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {language === 'es' ? subtitle.es : subtitle.en}
      </p>

      {/* Progress bar */}
      <div className="mt-6 flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className={cn('h-2 flex-1 rounded-full', i < step ? 'bg-primary' : 'bg-muted')}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Step content */}
      <div className="mt-6 space-y-4">
        {/* Step 1: Country of origin */}
        {step === 1 && (
          <div className="relative">
            <label htmlFor="country-search" className="mb-2 block text-sm font-medium">
              {language === 'es' ? 'País o región de origen' : 'Country or region of origin'}
            </label>

            {countryOfOrigin ? (
              <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 p-3">
                <span className="text-2xl">
                  {ALL_COUNTRIES.find(
                    c => c.labelEs === countryOfOrigin || c.labelEn === countryOfOrigin
                  )?.flag || '🌎'}
                </span>
                <span className="flex-1 text-sm font-medium">{countryOfOrigin}</span>
                <button
                  type="button"
                  onClick={() => {
                    setCountryOfOrigin('')
                    setTimeout(() => searchInputRef.current?.focus(), 50)
                  }}
                  className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                >
                  {language === 'es' ? 'Cambiar' : 'Change'}
                </button>
              </div>
            ) : (
              <>
                <input
                  ref={searchInputRef}
                  id="country-search"
                  type="text"
                  value={countrySearch}
                  onChange={e => {
                    setCountrySearch(e.target.value)
                    setCountryDropdownOpen(true)
                  }}
                  onFocus={() => setCountryDropdownOpen(true)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && filteredCountries.length > 0) {
                      e.preventDefault()
                      selectCountry(filteredCountries[0])
                    }
                  }}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder={language === 'es' ? 'Escribe para buscar...' : 'Type to search...'}
                  autoComplete="off"
                />
                {countryDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
                    {filteredCountries.length === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground">
                        {language === 'es' ? 'No encontrado' : 'Not found'}
                      </p>
                    ) : (
                      filteredCountries.map(option => (
                        <button
                          key={option.code}
                          type="button"
                          onClick={() => selectCountry(option)}
                          className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-primary/10"
                        >
                          <span className="text-lg">{option.flag}</span>
                          <span>{language === 'es' ? option.labelEs : option.labelEn}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 2: Immigration status */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Privacy statement */}
            <div className="rounded-xl border border-aquamarine/30 bg-aquamarine/5 p-4">
              <p className="text-sm font-semibold text-pearl">
                {language === 'es'
                  ? '🔒 Tu información es 100% privada.'
                  : '🔒 Your information is 100% private.'}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-pearl/70">
                {language === 'es'
                  ? 'Nunca se comparte, se vende, ni es visible para nadie. Solo la usamos para mostrarte los recursos más relevantes para tu situación.'
                  : 'It is never shared, sold, or visible to anyone. We only use it to show you the most relevant resources for your situation.'}
              </p>
            </div>

            <div>
              <label htmlFor="status" className="mb-2 block text-sm font-medium">
                {language === 'es' ? 'Estatus migratorio' : 'Immigration status'}
              </label>
              <select
                id="status"
                value={immigrationStatus}
                onChange={event => setImmigrationStatus(event.target.value as ImmigrationStatus)}
                className="h-11 w-full cursor-pointer rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">
                  {language === 'es' ? 'Prefiero no decir' : 'Prefer not to say'}
                </option>
                <option value="citizen">{language === 'es' ? 'Ciudadano(a)' : 'Citizen'}</option>
                <option value="permanent_resident">
                  {language === 'es' ? 'Residente permanente' : 'Permanent resident'}
                </option>
                <option value="daca">DACA</option>
                <option value="visa_holder">
                  {language === 'es' ? 'Titular de visa' : 'Visa holder'}
                </option>
                <option value="undocumented">
                  {language === 'es' ? 'Indocumentado(a)' : 'Undocumented'}
                </option>
                <option value="prefer_not_to_say">
                  {language === 'es' ? 'Otro / Prefiero no decir' : 'Other / Prefer not to say'}
                </option>
              </select>
            </div>

            {immigrationStatus === 'visa_holder' && (
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
                  placeholder="B1/B2, U Visa, H-1B, F-1, etc."
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Language preference */}
        {step === 3 && (
          <div>
            <p className="mb-3 text-sm font-medium">
              {language === 'es' ? 'Idioma preferido para la app' : 'Preferred app language'}
            </p>
            <div className="flex flex-wrap gap-3">
              {(
                [
                  { value: 'spanish', label: '🇪🇸 Español' },
                  { value: 'english', label: '🇺🇸 English' },
                  {
                    value: 'both',
                    label: language === 'es' ? '🌎 Ambos' : '🌎 Both',
                  },
                ] as const
              ).map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPreferredLanguage(option.value)}
                  className={cn(
                    'h-12 flex-1 cursor-pointer rounded-xl border px-4 text-sm font-medium transition-colors duration-200',
                    preferredLanguage === option.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-primary/10'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Occupation */}
        {step === 4 && (
          <div>
            <p className="mb-3 text-sm font-medium">
              {language === 'es' ? 'Selecciona lo que aplique' : 'Select what applies'}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {OCCUPATION_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setOccupation(option.value)}
                  className={cn(
                    'h-12 cursor-pointer rounded-xl border px-4 text-left text-sm font-medium transition-colors duration-200',
                    occupation === option.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-primary/10'
                  )}
                >
                  {language === 'es' ? option.labelEs : option.labelEn}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Goals */}
        {step === 5 && (
          <div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {GOAL_OPTIONS.map(goal => {
                const isSelected = goals.includes(goal.value)
                return (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => toggleGoal(goal.value)}
                    className={cn(
                      'h-12 cursor-pointer rounded-xl border px-4 text-left text-sm font-medium transition-colors duration-200',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:bg-primary/10'
                    )}
                  >
                    {language === 'es' ? goal.labelEs : goal.labelEn}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 cursor-pointer"
            onClick={previousStep}
            disabled={step === 1}
          >
            {language === 'es' ? 'Atrás' : 'Back'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11 cursor-pointer text-muted-foreground"
            onClick={step < TOTAL_STEPS ? nextStep : finishOnboarding}
          >
            {language === 'es' ? 'Saltar' : 'Skip'}
          </Button>
        </div>

        {step < TOTAL_STEPS ? (
          <Button type="button" className="h-11 cursor-pointer" onClick={nextStep}>
            {language === 'es' ? 'Siguiente' : 'Next'}
          </Button>
        ) : (
          <Button
            type="button"
            className="h-11 cursor-pointer bg-[var(--cta)] text-background hover:bg-[var(--cta)]/85"
            onClick={finishOnboarding}
          >
            {language === 'es' ? 'Empezar a explorar' : 'Start exploring'}
          </Button>
        )}
      </div>
    </div>
  )
}
