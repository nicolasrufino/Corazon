import { motion } from 'framer-motion'
import { AlertCircle, Clock, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import {
  buildAiProfile,
  calculateTimeSaved,
  estimateImpact,
  isolationImpact,
  normalizeInteractionsLog,
  recommendResources,
  type ComplexArchetype,
  type ImpactResponse,
  type IsolationResponse,
  type TimeSavedResponse,
} from '@/lib/aiApi'

/**
 * /impact route — accessed via the LayoutShell sidebar "Impact" button.
 *
 * Shows four animated horizontal bar graphs that visualize the user's
 * personal time impact across the year:
 *
 *   1. SAVED   — hours/yr Corazón has helped you recover (positive,
 *                green) — from /api/ai/time-saved using the user's
 *                onboarding goals as a stand-in interactions log
 *   2. NAV     — hours/yr lost navigating bureaucratic systems
 *                (red) — from /api/ai/impact nav_hours
 *   3. POVERTY — hours/yr worked just to cover the poverty premium
 *                (orange) — from /api/ai/impact poverty_hours
 *   4. ISOLATION — hours/yr lost to social isolation (pink) — from
 *                /api/ai/discovery/isolation
 *
 * Each bar's width scales relative to the largest value in the set so
 * the visualization is always full-bleed regardless of magnitude.
 */

const PILL_COLORS = {
  saved: '#00aa63', // green — positive
  nav: '#dc2626', // red — bureaucracy waste
  poverty: '#ff8100', // orange — poverty premium
  isolation: '#ffb5e2', // pink — isolation
}

// Display labels for the backend algorithm's 9-category vocabulary.
// Used to render the archetype's dominant_categories in plain language.
const CATEGORY_LABELS: Record<string, { es: string; en: string }> = {
  job: { es: 'Empleos', en: 'Jobs' },
  internship: { es: 'Pasantías', en: 'Internships' },
  scholarship: { es: 'Becas y ayuda', en: 'Scholarships & aid' },
  food_bank: { es: 'Alimentos', en: 'Food assistance' },
  health: { es: 'Salud', en: 'Health' },
  mental_health: { es: 'Salud mental', en: 'Mental health' },
  legal: { es: 'Legal', en: 'Legal' },
  housing: { es: 'Vivienda', en: 'Housing' },
  language: { es: 'Idiomas', en: 'Language' },
}

interface BarSpec {
  key: keyof typeof PILL_COLORS
  labelEs: string
  labelEn: string
  hoursPerYear: number
  icon: typeof Clock
  positive: boolean
}

export const ImpactPage = () => {
  const { language, user, interactionsLog: liveInteractions } = useAppContext()
  const isEs = language === 'es'

  const [impact, setImpact] = useState<ImpactResponse | null>(null)
  const [timeSaved, setTimeSaved] = useState<TimeSavedResponse | null>(null)
  const [isolation, setIsolation] = useState<IsolationResponse | null>(null)
  const [archetype, setArchetype] = useState<ComplexArchetype | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Snapshot stable profile fields so the effect doesn't re-run on
  // every AppContext re-render (the `user` object gets a fresh
  // reference on every auth refresh). ImpactPage fires 4 AI calls per
  // effect run, so avoiding spurious re-runs matters.
  const userId = user?.id
  const profileGoals = user?.profile?.goals
  const profileImmigration = user?.profile?.immigrationStatus
  const profileLanguage = user?.profile?.preferredLanguage
  const profileOccupation = user?.profile?.occupations?.[0]

  // Merge onboarding goals (seed signal) with the user's live
  // interaction log from AppContext. Every save + visit accumulates
  // here and feeds the algorithm's archetype + time-saved calculation,
  // so the Impact page grows more personal over time.
  const interactionsLog = useMemo(() => {
    const seed = normalizeInteractionsLog(profileGoals ?? [])
    return [...seed, ...liveInteractions]
  }, [profileGoals, liveInteractions])

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    const aiProfile = buildAiProfile({
      immigrationStatus: profileImmigration || 'citizen',
      preferredLanguage: profileLanguage,
      occupations: profileOccupation ? [profileOccupation] : [],
    })

    setLoading(true)
    setError(null)

    Promise.all([
      estimateImpact(aiProfile),
      calculateTimeSaved(aiProfile, interactionsLog),
      isolationImpact(aiProfile),
      recommendResources(aiProfile, interactionsLog, 1),
    ])
      .then(([imp, saved, iso, rec]) => {
        if (cancelled) return
        setImpact(imp)
        setTimeSaved(saved)
        setIsolation(iso)
        setArchetype(rec.archetype)
      })
      .catch(err => {
        if (cancelled) return
        console.error('ImpactPage AI fetch failed:', err)
        setError(
          isEs
            ? 'No pudimos cargar tu impacto en este momento.'
            : "We couldn't load your impact right now."
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId, profileImmigration, profileLanguage, profileOccupation, interactionsLog, isEs])

  if (!user) return null
  if (!user.profile) {
    return (
      <div className="rounded-2xl border border-border bg-card/70 p-6 text-sm text-muted-foreground">
        {isEs
          ? 'Completa el onboarding para ver tu impacto.'
          : 'Complete onboarding to see your impact.'}
      </div>
    )
  }

  const bars: BarSpec[] = [
    {
      key: 'saved',
      labelEs: 'Horas que recuperaste',
      labelEn: 'Hours you got back',
      hoursPerYear: timeSaved?.total_saved_hrs ?? 0,
      icon: TrendingUp,
      positive: true,
    },
    {
      key: 'nav',
      labelEs: 'Horas en papeleo y trámites',
      labelEn: 'Hours on paperwork and red tape',
      hoursPerYear: impact?.nav_hours ?? 0,
      icon: TrendingDown,
      positive: false,
    },
    {
      key: 'poverty',
      labelEs: 'Horas extra trabajando para alcanzar',
      labelEn: 'Extra hours working just to keep up',
      hoursPerYear: impact?.poverty_hours ?? 0,
      icon: Clock,
      positive: false,
    },
    {
      key: 'isolation',
      labelEs: 'Horas sin saber a quién acudir',
      labelEn: 'Hours feeling alone in the system',
      hoursPerYear: isolation?.isolation_hours_yr ?? 0,
      icon: AlertCircle,
      positive: false,
    },
  ]

  // Scale each bar's width relative to the largest value so the
  // visualization is always full-bleed regardless of magnitude.
  const maxHours = Math.max(1, ...bars.map(b => b.hoursPerYear))
  const totalNegative = bars.filter(b => !b.positive).reduce((sum, b) => sum + b.hoursPerYear, 0)

  return (
    <div className="space-y-6">
      {/* Header — cinematic glass with tropical warmth */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#050608] p-5 sm:p-8">
        {/* Tropical PINK.jpg texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-screen"
          style={{
            backgroundImage: "url('/PINK.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(1px) saturate(1.1)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#050608]/72 backdrop-blur-[2px]"
        />
        {/* Green + orange ambient glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-55 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(0,170,99,0.45) 0%, rgba(255,129,0,0.2) 40%, transparent 70%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00aa63]/50 to-transparent"
        />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-gradient-to-r from-transparent to-[#00aa63]/60"
              />
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#4dd19a]">
                {isEs ? 'Tu tiempo, en números' : 'Your time, in numbers'}
              </p>
            </div>
            <h1 className="mt-2 bg-gradient-to-b from-white to-white/70 bg-clip-text text-3xl text-transparent sm:text-4xl">
              {isEs ? 'Tu impacto' : 'Your impact'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
              {isEs
                ? 'Esto es cuánto tiempo te tomaría hacer las cosas tú solo — y cuánto te estamos ayudando a recuperar. Tu tiempo importa, y queremos que veas adónde se va.'
                : "This is how much time it would take you to do this on your own — and how much we're helping you get back. Your time matters, and we want you to see where it goes."}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#ff8100]/30 bg-[#ff8100]/10 px-3 py-1.5 text-xs font-medium text-[#ffb15a] backdrop-blur-md">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {isEs ? 'Personalizado' : 'For you'}
          </span>
        </div>
      </section>

      {/* Archetype — the profile we've built from the user's real
         resource interactions. Gated on interaction_count > 0 because
         the backend's _compute_weights returns bogus top-3 categories
         (the first 3 in CATEGORIES, by tie-order) when the log is
         empty. Showing that would lie to a brand-new user. */}
      {archetype && archetype.interaction_count > 0 ? (
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0b10]/60 p-5 backdrop-blur-xl sm:p-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full opacity-50 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(23,119,215,0.45) 0%, rgba(0,170,99,0.2) 40%, transparent 70%)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1777d7]/50 to-transparent"
          />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-px w-8 bg-gradient-to-r from-transparent to-[#1777d7]/60"
                />
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#5a9ff0]">
                  {isEs ? 'Tu perfil, construido por ti' : 'Your profile, built by you'}
                </p>
              </div>
              <h2 className="mt-2 bg-gradient-to-b from-white to-white/70 bg-clip-text text-xl text-transparent sm:text-2xl">
                {isEs ? 'Lo que nos has enseñado hasta ahora' : "What you've shown us so far"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
                {isEs
                  ? 'Cada recurso que guardas o visitas nos ayuda a entender mejor lo que necesitas. Esto es lo que más te importa, basado en lo que has explorado.'
                  : "Each resource you save or visit helps us understand what you need. Here's what matters to you most, based on what you've explored."}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/60 backdrop-blur-md">
              {archetype.interaction_count}{' '}
              {isEs
                ? archetype.interaction_count === 1
                  ? 'interacción'
                  : 'interacciones'
                : archetype.interaction_count === 1
                  ? 'interaction'
                  : 'interactions'}
            </span>
          </div>
          <ul className="relative mt-5 flex flex-wrap gap-2">
            {archetype.dominant_categories.map((cat, i) => {
              const label = CATEGORY_LABELS[cat]
              const display = label ? (isEs ? label.es : label.en) : cat
              return (
                <li
                  key={cat}
                  className="inline-flex items-center gap-2 rounded-full border border-[#1777d7]/40 bg-[#1777d7]/10 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(90,159,240,0.2)]"
                >
                  <span className="font-display text-xs text-[#5a9ff0]">#{i + 1}</span>
                  {display}
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {/* Bars */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0b10]/60 p-5 backdrop-blur-xl sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff8100]/40 to-transparent"
        />
        {error ? (
          <div className="relative rounded-xl border border-[#dc2626]/30 bg-[#dc2626]/10 p-4">
            <p className="text-sm text-[#dc2626]">{error}</p>
          </div>
        ) : loading ? (
          <div className="relative space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-white/[0.04]" />
                <div className="h-10 w-full animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative space-y-7">
            {bars.map((bar, i) => {
              const widthPct = Math.max(4, (bar.hoursPerYear / maxHours) * 100)
              const color = PILL_COLORS[bar.key]
              const Icon = bar.icon
              return (
                <div key={bar.key}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex size-7 items-center justify-center rounded-lg border shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                        style={{
                          borderColor: `${color}55`,
                          background: `${color}18`,
                          color,
                        }}
                      >
                        <Icon className="size-3.5" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-medium text-white">
                        {isEs ? bar.labelEs : bar.labelEn}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-lg font-bold" style={{ color }}>
                        {bar.hoursPerYear.toFixed(0)}
                      </span>
                      <span className="ml-1 text-xs text-white/45">
                        {isEs ? 'hrs/año' : 'hrs/yr'}
                      </span>
                    </div>
                  </div>

                  {/* Bar track */}
                  <div className="relative h-10 overflow-hidden rounded-xl border border-white/[0.08] bg-black/30">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{
                        type: 'spring',
                        stiffness: 80,
                        damping: 18,
                        delay: 0.05 + i * 0.1,
                      }}
                      className="absolute inset-y-0 left-0 rounded-xl"
                      style={{
                        background: bar.positive
                          ? `linear-gradient(90deg, ${color}cc, ${color})`
                          : `linear-gradient(90deg, ${color}, ${color}aa)`,
                        boxShadow: `inset 0 0 0 1px ${color}55`,
                      }}
                    />
                  </div>
                </div>
              )
            })}

            {/* Summary callout */}
            {timeSaved && impact && isolation && (
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: isEs ? 'Lo que cuesta cada año' : 'What it costs you each year',
                    value: totalNegative.toFixed(0),
                    suffix: isEs ? 'horas' : 'hours',
                    color: '#dc2626',
                  },
                  {
                    label: isEs ? 'En 20 años, eso es' : "Over 20 years, that's",
                    value: impact.lifetime_days.toFixed(0),
                    suffix: isEs ? 'días de tu vida' : 'days of your life',
                    color: '#ff8100',
                  },
                  {
                    label: isEs ? 'Lo que ya recuperaste' : "What you've already gotten back",
                    value: (timeSaved.total_saved_hrs ?? 0).toFixed(0),
                    suffix: isEs ? 'horas' : 'hours',
                    color: PILL_COLORS.saved,
                  },
                ].map(item => (
                  <div
                    key={item.label}
                    className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-md"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-px"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${item.color}99, transparent)`,
                      }}
                    />
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/50">
                      {item.label}
                    </p>
                    <p
                      className="mt-1 font-display text-2xl font-bold"
                      style={{ color: item.color }}
                    >
                      {item.value}
                      <span className="ml-1 text-sm text-white/45">{item.suffix}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-2 text-xs text-white/40">
              {isEs
                ? 'Datos basados en estudios reales sobre familias latinas en EE.UU.'
                : 'Based on real research about Latino families in the U.S.'}
            </p>
          </div>
        )}
      </section>

      {/* Plain-language explanations of each bar — render only once data
         is loaded so the page doesn't show definitions for empty bars. */}
      {!loading && !error && impact && timeSaved && isolation ? (
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0b10]/60 p-5 backdrop-blur-xl sm:p-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00aa63]/40 to-transparent"
          />
          <h2 className="relative bg-gradient-to-b from-white to-white/70 bg-clip-text text-xl font-semibold text-transparent sm:text-2xl">
            {isEs ? '¿Qué significa todo esto?' : 'What does all this mean?'}
          </h2>
          <p className="relative mt-1 text-sm leading-relaxed text-white/55">
            {isEs
              ? 'Sabemos que los números pueden sentirse fríos. Aquí te lo explicamos como se lo contarías a un amigo.'
              : "We know numbers can feel cold. Here's what each one really means — the way you'd explain it to a friend."}
          </p>

          <ul className="relative mt-5 space-y-5">
            {[
              {
                color: PILL_COLORS.saved,
                title: isEs ? 'Horas que recuperaste' : 'Hours you got back',
                body: isEs
                  ? 'Tiempo que ya no tuviste que gastar buscando ayuda, llamando a oficinas que no responden, o esperando en filas. Cada una de estas horas la viviste como tú quisiste.'
                  : "Time you didn't have to spend hunting for help, calling offices that never pick up, or waiting in lines. Every one of these hours, you got to spend on what actually matters to you.",
              },
              {
                color: PILL_COLORS.nav,
                title: isEs ? 'Horas en papeleo y trámites' : 'Hours on paperwork and red tape',
                body: isEs
                  ? 'Lo que normalmente tendrías que dar a llenar formularios, ir y venir entre oficinas, y descifrar instrucciones que parecen escritas en otro idioma. Personas en tu misma situación lo viven todos los años.'
                  : "What you'd normally give up to fill out forms, run between offices, and decode instructions that feel like they're written in another language. People in your same situation live this every year.",
              },
              {
                color: PILL_COLORS.poverty,
                title: isEs ? 'Horas extra trabajando' : 'Extra hours working',
                body: isEs
                  ? 'Cuando no sabes a dónde ir, terminas pagando de más — en multas, en ayuda que cobra, en cosas que pudiste haber recibido gratis. Esto es el tiempo que tendrías que trabajar para cubrir esos costos.'
                  : "When you don't know where to turn, you end up paying more — fees, paid help, things you could've gotten free if you knew the right place. This is how many extra hours you'd have to work to cover those costs.",
              },
              {
                color: PILL_COLORS.isolation,
                title: isEs
                  ? 'Horas sintiéndote solo en el sistema'
                  : 'Hours feeling alone in the system',
                body: isEs
                  ? 'No tener una comunidad que te explique cómo funciona todo cuesta tiempo — y a veces, salud mental. Estas horas representan ese vacío que sentimos cuando nadie nos guía.'
                  : "Not having a community that knows the ropes costs time — and sometimes, peace of mind. These hours stand for that feeling of being on your own in a place that wasn't built for you.",
              },
            ].map(item => (
              <li key={item.title} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-3 shrink-0 rounded-full"
                  style={{
                    background: item.color,
                    boxShadow: `0 0 12px ${item.color}99`,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Closing — the emotional payoff. Anchors saved hours to family
             time so the gratitude framing lands harder than a generic "thx". */}
          <div className="relative mt-7 overflow-hidden rounded-2xl border border-[#dc2626]/30 bg-[#dc2626]/5 p-5 backdrop-blur-md">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-60 blur-2xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(220,38,38,0.5) 0%, rgba(255,129,0,0.2) 40%, transparent 70%)',
              }}
            />
            <p
              className="relative text-sm leading-relaxed text-white/90"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              {isEs
                ? 'Cada hora aquí es una hora que te devolvemos. Para que la pases con tu familia, en tu cocina, escuchando música, o simplemente respirando. Gracias por dejarnos caminar contigo. ❤️'
                : "Every hour here is an hour we're handing back to you. To spend with your family, in your kitchen, listening to music, or just breathing. Thank you for letting us walk with you. ❤️"}
            </p>
          </div>
        </section>
      ) : null}
    </div>
  )
}
