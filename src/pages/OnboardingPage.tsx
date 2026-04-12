import { Lock } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import type {
  ImmigrationStatus,
  Occupation,
  OnboardingProfile,
  ResourceCategory,
} from '@/types/app'

/* ─── Per-step accent color from the Coraz\u00f3n logo letters ─── */
const STEP_COLORS: Record<number, { accent: string; accentMuted: string; border: string }> = {
  1: { accent: '#ff8100', accentMuted: 'rgba(255,129,0,0.15)', border: 'rgba(255,129,0,0.35)' },
  2: { accent: '#dc2626', accentMuted: 'rgba(220,38,38,0.15)', border: 'rgba(220,38,38,0.35)' },
  3: { accent: '#00aa63', accentMuted: 'rgba(0,170,99,0.15)', border: 'rgba(0,170,99,0.35)' },
  4: { accent: '#1777d7', accentMuted: 'rgba(23,119,215,0.15)', border: 'rgba(23,119,215,0.35)' },
}

/* ─── Country data ─── */

interface CountryOption {
  code: string
  flag: string
  labelEs: string
  labelEn: string
}

const LATIN_AMERICAN: CountryOption[] = [
  { code: 'MX', flag: '\u{1F1F2}\u{1F1FD}', labelEs: 'M\u00e9xico', labelEn: 'Mexico' },
  { code: 'GT', flag: '\u{1F1EC}\u{1F1F9}', labelEs: 'Guatemala', labelEn: 'Guatemala' },
  { code: 'SV', flag: '\u{1F1F8}\u{1F1FB}', labelEs: 'El Salvador', labelEn: 'El Salvador' },
  { code: 'HN', flag: '\u{1F1ED}\u{1F1F3}', labelEs: 'Honduras', labelEn: 'Honduras' },
  { code: 'CO', flag: '\u{1F1E8}\u{1F1F4}', labelEs: 'Colombia', labelEn: 'Colombia' },
  { code: 'EC', flag: '\u{1F1EA}\u{1F1E8}', labelEs: 'Ecuador', labelEn: 'Ecuador' },
  { code: 'PE', flag: '\u{1F1F5}\u{1F1EA}', labelEs: 'Per\u00fa', labelEn: 'Peru' },
  { code: 'VE', flag: '\u{1F1FB}\u{1F1EA}', labelEs: 'Venezuela', labelEn: 'Venezuela' },
  { code: 'CU', flag: '\u{1F1E8}\u{1F1FA}', labelEs: 'Cuba', labelEn: 'Cuba' },
  {
    code: 'DO',
    flag: '\u{1F1E9}\u{1F1F4}',
    labelEs: 'Rep\u00fablica Dominicana',
    labelEn: 'Dominican Republic',
  },
  { code: 'PR', flag: '\u{1F1F5}\u{1F1F7}', labelEs: 'Puerto Rico', labelEn: 'Puerto Rico' },
  { code: 'NI', flag: '\u{1F1F3}\u{1F1EE}', labelEs: 'Nicaragua', labelEn: 'Nicaragua' },
  { code: 'CR', flag: '\u{1F1E8}\u{1F1F7}', labelEs: 'Costa Rica', labelEn: 'Costa Rica' },
  { code: 'PA', flag: '\u{1F1F5}\u{1F1E6}', labelEs: 'Panam\u00e1', labelEn: 'Panama' },
  { code: 'AR', flag: '\u{1F1E6}\u{1F1F7}', labelEs: 'Argentina', labelEn: 'Argentina' },
  { code: 'CL', flag: '\u{1F1E8}\u{1F1F1}', labelEs: 'Chile', labelEn: 'Chile' },
  { code: 'BO', flag: '\u{1F1E7}\u{1F1F4}', labelEs: 'Bolivia', labelEn: 'Bolivia' },
  { code: 'PY', flag: '\u{1F1F5}\u{1F1FE}', labelEs: 'Paraguay', labelEn: 'Paraguay' },
  { code: 'UY', flag: '\u{1F1FA}\u{1F1FE}', labelEs: 'Uruguay', labelEn: 'Uruguay' },
  { code: 'BR', flag: '\u{1F1E7}\u{1F1F7}', labelEs: 'Brasil', labelEn: 'Brazil' },
  { code: 'HT', flag: '\u{1F1ED}\u{1F1F9}', labelEs: 'Hait\u00ed', labelEn: 'Haiti' },
  { code: 'JM', flag: '\u{1F1EF}\u{1F1F2}', labelEs: 'Jamaica', labelEn: 'Jamaica' },
  {
    code: 'TT',
    flag: '\u{1F1F9}\u{1F1F9}',
    labelEs: 'Trinidad y Tobago',
    labelEn: 'Trinidad & Tobago',
  },
  { code: 'BZ', flag: '\u{1F1E7}\u{1F1FF}', labelEs: 'Belice', labelEn: 'Belize' },
  { code: 'GY', flag: '\u{1F1EC}\u{1F1FE}', labelEs: 'Guyana', labelEn: 'Guyana' },
  { code: 'SR', flag: '\u{1F1F8}\u{1F1F7}', labelEs: 'Surinam', labelEn: 'Suriname' },
]

const OTHER_COUNTRIES: CountryOption[] = [
  { code: 'US', flag: '\u{1F1FA}\u{1F1F8}', labelEs: 'Estados Unidos', labelEn: 'United States' },
  { code: 'CA', flag: '\u{1F1E8}\u{1F1E6}', labelEs: 'Canad\u00e1', labelEn: 'Canada' },
  { code: 'ES', flag: '\u{1F1EA}\u{1F1F8}', labelEs: 'Espa\u00f1a', labelEn: 'Spain' },
  { code: 'PT', flag: '\u{1F1F5}\u{1F1F9}', labelEs: 'Portugal', labelEn: 'Portugal' },
  { code: 'PH', flag: '\u{1F1F5}\u{1F1ED}', labelEs: 'Filipinas', labelEn: 'Philippines' },
  { code: 'IT', flag: '\u{1F1EE}\u{1F1F9}', labelEs: 'Italia', labelEn: 'Italy' },
]

const REGIONAL_GROUPS: CountryOption[] = [
  {
    code: 'ASIAN',
    flag: '\u{1F30F}',
    labelEs: 'Origen asi\u00e1tico',
    labelEn: 'Asian background',
  },
  {
    code: 'AFRICAN',
    flag: '\u{1F30D}',
    labelEs: 'Origen africano',
    labelEn: 'African background',
  },
  {
    code: 'EUROPEAN',
    flag: '\u{1F30E}',
    labelEs: 'Origen europeo (otro)',
    labelEn: 'European background (other)',
  },
  {
    code: 'MIDEAST',
    flag: '\u{1F30D}',
    labelEs: 'Origen medio-oriental',
    labelEn: 'Middle Eastern background',
  },
  { code: 'OTHER', flag: '\u{1F310}', labelEs: 'Otro', labelEn: 'Other' },
]

const ALL_COUNTRIES = [...LATIN_AMERICAN, ...OTHER_COUNTRIES, ...REGIONAL_GROUPS]

/* ─── Visa type options ─── */

const VISA_OPTIONS = [
  { value: 'F-1', label: 'F-1 (Estudiante / Student)' },
  { value: 'H-1B', label: 'H-1B (Trabajo / Work)' },
  { value: 'B1/B2', label: 'B1/B2 (Turista / Tourist)' },
  { value: 'U Visa', label: 'U Visa (V\u00edctima de crimen / Crime victim)' },
  { value: 'TPS', label: 'TPS (Estatus de protecci\u00f3n temporal)' },
  { value: 'J-1', label: 'J-1 (Intercambio / Exchange)' },
  { value: 'L-1', label: 'L-1 (Transferencia / Transfer)' },
  { value: 'O-1', label: 'O-1 (Habilidad extraordinaria)' },
  { value: 'other', label: 'Otra / Other' },
]

/* ─── Occupation options ─── */

const OCCUPATION_OPTIONS: Array<{ value: Occupation; labelEs: string; labelEn: string }> = [
  { value: 'student', labelEs: 'Estudiante', labelEn: 'Student' },
  { value: 'worker', labelEs: 'Trabajador(a)', labelEn: 'Worker' },
  { value: 'student_worker', labelEs: 'Estudiante + Trabajador(a)', labelEn: 'Student + Worker' },
  { value: 'job_seeker', labelEs: 'Buscando trabajo', labelEn: 'Looking for work' },
  { value: 'two_jobs', labelEs: 'Dos trabajos', labelEn: 'Two jobs' },
  { value: 'retired', labelEs: 'Retirado(a)', labelEn: 'Retired' },
  { value: 'caregiver', labelEs: 'Cuidador(a) del hogar', labelEn: 'Caregiver / Homemaker' },
  { value: 'other', labelEs: 'Otro', labelEn: 'Other' },
]

/* ─── Goal options ─── */

const GOAL_OPTIONS: Array<{ value: ResourceCategory; labelEs: string; labelEn: string }> = [
  {
    value: 'health',
    labelEs: 'Encontrar un doctor o cl\u00ednica',
    labelEn: 'Find a doctor or clinic',
  },
  { value: 'mental_health', labelEs: 'Apoyo en salud mental', labelEn: 'Mental health support' },
  { value: 'legal', labelEs: 'Obtener ayuda legal', labelEn: 'Get legal help' },
  { value: 'housing', labelEs: 'Encontrar vivienda', labelEn: 'Find housing' },
  { value: 'food_bank', labelEs: 'Acceder a alimentos', labelEn: 'Access food resources' },
  { value: 'scholarship', labelEs: 'Encontrar becas', labelEn: 'Find scholarships' },
  { value: 'job', labelEs: 'Encontrar trabajo', labelEn: 'Find a job' },
  { value: 'event', labelEs: 'Conocer gente y eventos', labelEn: 'Meet people and find events' },
  { value: 'language', labelEs: 'Aprender ingl\u00e9s', labelEn: 'Learn English' },
]

/* ─── Step config ─── */
// Order: 1=Country, 2=Immigration, 3=Occupation, 4=Goals

const STEP_TITLES: Array<{ es: string; en: string }> = [
  { es: '\u00bfDe d\u00f3nde eres?', en: 'Where are you from?' },
  { es: 'Tu situaci\u00f3n migratoria', en: 'Your immigration status' },
  { es: '\u00bfA qu\u00e9 te dedicas?', en: 'What do you do?' },
  { es: '\u00bfQu\u00e9 quieres lograr?', en: 'What do you want to accomplish?' },
]

const STEP_SUBTITLES: Array<{ es: string; en: string }> = [
  {
    es: 'Esto nos ayuda a mostrarte recursos de tu comunidad.',
    en: 'This helps us show you resources from your community.',
  },
  {
    es: 'Solo si te sientes c\u00f3modo(a). Nunca es obligatorio.',
    en: 'Only if you feel comfortable. Never required.',
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

const TOTAL_STEPS = 4

/* ─── Component ─── */

export const OnboardingPage = () => {
  const { completeOnboarding, language, user } = useAppContext()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [countryOfOrigin, setCountryOfOrigin] = useState('')
  const [countrySearch, setCountrySearch] = useState('')
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const [immigrationStatus, setImmigrationStatus] = useState<ImmigrationStatus | ''>('')
  const [visaType, setVisaType] = useState('')
  const [occupation, setOccupation] = useState<Occupation | ''>('')
  const [otherOccupation, setOtherOccupation] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [goals, setGoals] = useState<ResourceCategory[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

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
  const colors = STEP_COLORS[step]

  // Close country dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    setHighlightIndex(0)
  }

  const finishOnboarding = async () => {
    // Don't write "Not specified" sentinels — store undefined so
    // downstream code (Impact page, recommend algorithm, profile
    // display) can tell missing data from intentional data. AppContext
    // .completeOnboarding coerces undefined → null for the Supabase
    // upsert, so the DB row still has clean NULL columns.
    const profile: OnboardingProfile = {
      countryOfOrigin: countryOfOrigin || undefined,
      immigrationStatus: immigrationStatus || 'prefer_not_to_say',
      visaType: immigrationStatus === 'visa_holder' ? visaType || undefined : undefined,
      preferredLanguage: language === 'es' ? 'spanish' : 'english',
      occupations: occupation ? [occupation] : ['other'],
      goals: goals.length > 0 ? goals : ['health'],
    }
    await completeOnboarding(profile)
    navigate('/dashboard')
  }

  const handleCountryKeyDown = (e: React.KeyboardEvent) => {
    if (!countryDropdownOpen || filteredCountries.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex(i => Math.min(i + 1, filteredCountries.length - 1))
      setTimeout(() => {
        listRef.current?.children[
          Math.min(highlightIndex + 1, filteredCountries.length - 1)
        ]?.scrollIntoView({ block: 'nearest' })
      }, 0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex(i => Math.max(i - 1, 0))
      setTimeout(() => {
        listRef.current?.children[Math.max(highlightIndex - 1, 0)]?.scrollIntoView({
          block: 'nearest',
        })
      }, 0)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      selectCountry(filteredCountries[highlightIndex])
    } else if (e.key === 'Escape') {
      setCountryDropdownOpen(false)
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center overflow-y-auto p-4 sm:p-6">
      <div
        className="mx-auto w-full max-w-3xl rounded-3xl border bg-card/80 p-5 sm:p-8"
        style={{ borderColor: colors.border }}
      >
        {/* Intro banner — only on step 1 */}
        {step === 1 && (
          <div
            className="mb-6 rounded-xl p-4"
            style={{
              background: colors.accentMuted,
              borderLeft: `3px solid ${colors.accent}`,
            }}
          >
            <p className="text-sm leading-relaxed text-pearl/90">
              {language === 'es'
                ? 'Todo aqu\u00ed es opcional. Tu informaci\u00f3n es 100% privada. Puedes saltar todo el onboarding.'
                : 'Everything here is optional. Your information is 100% private. You can skip the entire onboarding.'}
            </p>
          </div>
        )}

        {/* Step title */}
        <h1 className="text-3xl sm:text-4xl" style={{ color: colors.accent }}>
          {language === 'es' ? title.es : title.en}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {language === 'es' ? subtitle.es : subtitle.en}
        </p>

        {/* Progress bar */}
        <div className="mt-6 flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className="h-2 flex-1 rounded-full"
              style={{ background: i < step ? colors.accent : 'var(--muted)' }}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Step content */}
        <div className="mt-6 space-y-4">
          {/* Step 1: Country */}
          {step === 1 && (
            <div className="relative" ref={dropdownRef}>
              <label htmlFor="country-search" className="mb-2 block text-sm font-medium">
                {language === 'es'
                  ? 'Pa\u00eds o regi\u00f3n de origen'
                  : 'Country or region of origin'}
              </label>

              {countryOfOrigin ? (
                <div
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{
                    background: colors.accentMuted,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <span className="text-2xl">
                    {ALL_COUNTRIES.find(
                      c => c.labelEs === countryOfOrigin || c.labelEn === countryOfOrigin
                    )?.flag || ''}
                  </span>
                  <span className="flex-1 text-sm font-medium">{countryOfOrigin}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCountryOfOrigin('')
                      setHighlightIndex(0)
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
                      setHighlightIndex(0)
                    }}
                    onFocus={() => setCountryDropdownOpen(true)}
                    onKeyDown={handleCountryKeyDown}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2"
                    style={{ '--tw-ring-color': colors.accent } as React.CSSProperties}
                    placeholder={language === 'es' ? 'Escribe para buscar...' : 'Type to search...'}
                    autoComplete="off"
                  />
                  {countryDropdownOpen && (
                    <div
                      ref={listRef}
                      className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-card shadow-xl"
                    >
                      {filteredCountries.length === 0 ? (
                        <p className="p-3 text-sm text-muted-foreground">
                          {language === 'es' ? 'No encontrado' : 'Not found'}
                        </p>
                      ) : (
                        filteredCountries.map((option, idx) => (
                          <button
                            key={option.code}
                            type="button"
                            onClick={() => selectCountry(option)}
                            className={cn(
                              'flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                              idx === highlightIndex ? 'bg-white/10' : 'hover:bg-white/5'
                            )}
                            style={
                              idx === highlightIndex
                                ? { background: colors.accentMuted }
                                : undefined
                            }
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
              <div
                className="flex items-start gap-3 rounded-xl p-4"
                style={{
                  background: colors.accentMuted,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <Lock className="mt-0.5 size-5 shrink-0" style={{ color: colors.accent }} />
                <div>
                  <p className="text-sm font-semibold text-pearl">
                    {language === 'es'
                      ? 'Tu informaci\u00f3n es 100% privada.'
                      : 'Your information is 100% private.'}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-pearl/70">
                    {language === 'es'
                      ? 'Nunca se comparte, se vende, ni es visible para nadie. Solo la usamos para mostrarte los recursos m\u00e1s relevantes para tu situaci\u00f3n.'
                      : 'It is never shared, sold, or visible to anyone. We only use it to show you the most relevant resources for your situation.'}
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="status" className="mb-2 block text-sm font-medium">
                  {language === 'es' ? 'Estatus migratorio' : 'Immigration status'}
                </label>
                <select
                  id="status"
                  value={immigrationStatus}
                  onChange={event => setImmigrationStatus(event.target.value as ImmigrationStatus)}
                  className="h-11 w-full cursor-pointer rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2"
                  style={{ '--tw-ring-color': colors.accent } as React.CSSProperties}
                >
                  <option value="">
                    {language === 'es' ? 'Prefiero no decir' : 'Prefer not to say'}
                  </option>
                  <option value="citizen">{language === 'es' ? 'Ciudadano(a)' : 'Citizen'}</option>
                  <option value="permanent_resident">
                    {language === 'es'
                      ? 'Residente permanente (Green Card)'
                      : 'Permanent resident (Green Card)'}
                  </option>
                  <option value="daca">DACA</option>
                  <option value="visa_holder">
                    {language === 'es' ? 'Tengo visa' : 'Visa holder'}
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
                    {language === 'es'
                      ? '\u00bfQu\u00e9 tipo de visa tienes?'
                      : 'What type of visa do you have?'}
                  </label>
                  <select
                    id="visa-type"
                    value={visaType}
                    onChange={event => setVisaType(event.target.value)}
                    className="h-11 w-full cursor-pointer rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2"
                    style={{ '--tw-ring-color': colors.accent } as React.CSSProperties}
                  >
                    <option value="">{language === 'es' ? 'Seleccionar' : 'Select'}</option>
                    {VISA_OPTIONS.map(v => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Occupation — single select */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {OCCUPATION_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setOccupation(option.value)}
                    className="h-12 cursor-pointer rounded-xl border px-4 text-left text-sm font-medium transition-all duration-200"
                    style={
                      occupation === option.value
                        ? {
                            background: colors.accent,
                            borderColor: colors.accent,
                            color: '#000',
                          }
                        : { borderColor: 'var(--border)' }
                    }
                  >
                    {language === 'es' ? option.labelEs : option.labelEn}
                  </button>
                ))}
              </div>
              {occupation === 'other' && (
                <input
                  type="text"
                  value={otherOccupation}
                  onChange={e => setOtherOccupation(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2"
                  style={{ '--tw-ring-color': colors.accent } as React.CSSProperties}
                  placeholder={
                    language === 'es'
                      ? 'Describe tu ocupaci\u00f3n...'
                      : 'Describe your occupation...'
                  }
                />
              )}
            </div>
          )}

          {/* Step 4: Goals — multi select */}
          {step === 4 && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {GOAL_OPTIONS.map(goal => {
                const isSelected = goals.includes(goal.value)
                return (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => toggleGoal(goal.value)}
                    className="h-12 cursor-pointer rounded-xl border px-4 text-left text-sm font-medium transition-all duration-200"
                    style={
                      isSelected
                        ? {
                            background: colors.accent,
                            borderColor: colors.accent,
                            color: '#000',
                          }
                        : { borderColor: 'var(--border)' }
                    }
                  >
                    {language === 'es' ? goal.labelEs : goal.labelEn}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Navigation — Back + Next/Finish */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            type="button"
            className="h-11 cursor-pointer border text-black"
            style={{
              background: step > 1 ? colors.accent : 'transparent',
              borderColor: step > 1 ? colors.accent : 'var(--border)',
              color: step > 1 ? '#000' : 'var(--foreground)',
              opacity: step === 1 ? 0.4 : 1,
            }}
            onClick={previousStep}
            disabled={step === 1}
          >
            {language === 'es' ? 'Atr\u00e1s' : 'Back'}
          </Button>

          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              className="h-11 cursor-pointer text-black"
              style={{ background: colors.accent }}
              onClick={nextStep}
            >
              {language === 'es' ? 'Siguiente' : 'Next'}
            </Button>
          ) : (
            <Button
              type="button"
              className="h-11 cursor-pointer text-black"
              style={{ background: colors.accent }}
              onClick={finishOnboarding}
            >
              {language === 'es' ? 'Empezar a explorar' : 'Start exploring'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
