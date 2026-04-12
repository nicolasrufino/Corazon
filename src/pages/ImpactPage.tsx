import { motion } from 'framer-motion'
import { AlertCircle, Clock, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import {
  buildAiProfile,
  calculateTimeSaved,
  estimateImpact,
  isolationImpact,
  type ImpactResponse,
  type IsolationResponse,
  type TimeSavedResponse,
} from '@/lib/aiApi'
import type { ResourceCategory } from '@/types/app'

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

interface BarSpec {
  key: keyof typeof PILL_COLORS
  labelEs: string
  labelEn: string
  hoursPerYear: number
  icon: typeof Clock
  positive: boolean
}

export const ImpactPage = () => {
  const { language, user } = useAppContext()
  const isEs = language === 'es'

  const [impact, setImpact] = useState<ImpactResponse | null>(null)
  const [timeSaved, setTimeSaved] = useState<TimeSavedResponse | null>(null)
  const [isolation, setIsolation] = useState<IsolationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use the user's onboarding goals as a stand-in interactions_log so
  // the demo shows non-zero "time saved" before any saved-resources
  // tracking is wired up. Each goal counts as one interaction.
  const interactionsLog = useMemo<ResourceCategory[]>(() => user?.profile?.goals ?? [], [user])

  useEffect(() => {
    if (!user?.profile) return
    let cancelled = false

    const aiProfile = buildAiProfile(user.profile)

    setLoading(true)
    setError(null)

    Promise.all([
      estimateImpact(aiProfile),
      calculateTimeSaved(aiProfile, interactionsLog as string[]),
      isolationImpact(aiProfile),
    ])
      .then(([imp, saved, iso]) => {
        if (cancelled) return
        setImpact(imp)
        setTimeSaved(saved)
        setIsolation(iso)
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
  }, [user, interactionsLog, isEs])

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
      labelEs: 'Tiempo ahorrado',
      labelEn: 'Time saved',
      hoursPerYear: timeSaved?.total_saved_hrs ?? 0,
      icon: TrendingUp,
      positive: true,
    },
    {
      key: 'nav',
      labelEs: 'Tiempo perdido en burocracia',
      labelEn: 'Time wasted on bureaucracy',
      hoursPerYear: impact?.nav_hours ?? 0,
      icon: TrendingDown,
      positive: false,
    },
    {
      key: 'poverty',
      labelEs: 'Costo del "impuesto de pobreza"',
      labelEn: 'Poverty premium tax',
      hoursPerYear: impact?.poverty_hours ?? 0,
      icon: Clock,
      positive: false,
    },
    {
      key: 'isolation',
      labelEs: 'Tiempo perdido por aislamiento',
      labelEn: 'Time lost to isolation',
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
      {/* Header */}
      <section className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/90">
              {isEs ? 'Tu impacto personal' : 'Your personal impact'}
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl">{isEs ? 'Impacto' : 'Impact'}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {isEs
                ? 'Una vista cuantitativa de cómo el sistema afecta tu tiempo cada año, y cuánto te ayuda Corazón a recuperar.'
                : 'A quantitative view of how the system costs you time each year — and how much Corazón helps you reclaim.'}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            ML
          </span>
        </div>
      </section>

      {/* Bars */}
      <section className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-7">
        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : loading ? (
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-muted/40" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-muted/40" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-7">
            {bars.map((bar, i) => {
              const widthPct = Math.max(4, (bar.hoursPerYear / maxHours) * 100)
              const color = PILL_COLORS[bar.key]
              const Icon = bar.icon
              return (
                <div key={bar.key}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex size-6 items-center justify-center rounded-md"
                        style={{ background: `${color}22`, color }}
                      >
                        <Icon className="size-3.5" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-medium">
                        {isEs ? bar.labelEs : bar.labelEn}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-lg font-bold" style={{ color }}>
                        {bar.hoursPerYear.toFixed(0)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {isEs ? 'hrs/año' : 'hrs/yr'}
                      </span>
                    </div>
                  </div>

                  {/* Bar track */}
                  <div className="relative h-10 overflow-hidden rounded-xl border border-border/40 bg-background/40">
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
                <div className="rounded-xl border border-border/40 bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {isEs ? 'Pérdida total/año' : 'Total annual loss'}
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-destructive">
                    {totalNegative.toFixed(0)}
                    <span className="ml-1 text-sm text-muted-foreground">
                      {isEs ? 'hrs' : 'hrs'}
                    </span>
                  </p>
                </div>
                <div className="rounded-xl border border-border/40 bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {isEs ? 'Días de vida (proy. 20 años)' : 'Lifetime days (20 yr proj.)'}
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-accent">
                    {impact.lifetime_days.toFixed(0)}
                    <span className="ml-1 text-sm text-muted-foreground">
                      {isEs ? 'días' : 'days'}
                    </span>
                  </p>
                </div>
                <div className="rounded-xl border border-border/40 bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {isEs ? 'Recuperado por Corazón' : 'Reclaimed via Corazón'}
                  </p>
                  <p
                    className="mt-1 font-display text-2xl font-bold"
                    style={{ color: PILL_COLORS.saved }}
                  >
                    {(timeSaved.total_saved_hrs ?? 0).toFixed(0)}
                    <span className="ml-1 text-sm text-muted-foreground">
                      {isEs ? 'hrs' : 'hrs'}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <p className="mt-2 text-xs text-muted-foreground">
              {isEs
                ? 'Fuente: BLS Q2 2024 + modelo entrenado de Corazon AI.'
                : 'Source: BLS Q2 2024 + trained Corazon AI model.'}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
