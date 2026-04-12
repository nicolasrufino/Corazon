import {
  AlertCircle,
  ArrowUpRight,
  Bookmark,
  ChartNoAxesCombined,
  Compass,
  Filter,
  Globe2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { ResourceCard } from '@/components/ResourceCard'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/context/AppContext'
import { resourceCategories } from '@/data/mockData'
import {
  buildAiProfile,
  normalizeInteractionsLog,
  recommendResources,
  type RecommendedResource,
} from '@/lib/aiApi'
import { fetchResources, type SortOption } from '@/lib/supabaseApi'
import { cn } from '@/lib/utils'
import type { Resource, ResourceCategory } from '@/types/app'

const categoryIcons: Record<ResourceCategory, typeof ShieldCheck> = {
  health: Sparkles,
  mental_health: AlertCircle,
  legal: ShieldCheck,
  housing: MapPin,
  food_bank: Compass,
  scholarship: ChartNoAxesCombined,
  job: Sparkles,
  event: MapPin,
  language: ChartNoAxesCombined,
}

export const DashboardPage = () => {
  const { language, savedResourceIds, user, interactionsLog } = useAppContext()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'all'>('all')
  const [sort, setSort] = useState<SortOption>('relevance')
  const [latinoOnly, setLatinoOnly] = useState(false)
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [recommended, setRecommended] = useState<RecommendedResource[]>([])
  const [recommendLoading, setRecommendLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Snapshot stable profile fields so the recommend effect doesn't
  // re-run on every AppContext re-render (the `user` object gets a
  // fresh reference on every auth refresh).
  const userId = user?.id
  const profileGoals = user?.profile?.goals
  const profileImmigration = user?.profile?.immigrationStatus
  const profileLanguage = user?.profile?.preferredLanguage
  const profileOccupation = user?.profile?.occupations?.[0]

  // Merge onboarding goals (seed signal) with the live interaction
  // log so the recommend endpoint has real signal to score against.
  const recommendLog = useMemo(() => {
    const seed = normalizeInteractionsLog(profileGoals ?? [])
    return [...seed, ...interactionsLog]
  }, [profileGoals, interactionsLog])

  // AI-powered "Recommended for you" — re-fetches 600ms after any
  // change to the interaction log so saving or visiting a resource
  // updates the recs without hammering the endpoint.
  useEffect(() => {
    if (!userId || !profileImmigration) return
    let cancelled = false
    const timeout = setTimeout(() => {
      if (cancelled) return
      setRecommendLoading(true)
      const aiProfile = buildAiProfile({
        immigrationStatus: profileImmigration,
        preferredLanguage: profileLanguage,
        occupations: profileOccupation ? [profileOccupation] : [],
      })
      recommendResources(aiProfile, recommendLog, 5)
        .then(res => {
          if (!cancelled) setRecommended(res.resources || [])
        })
        .catch(err => {
          console.warn('recommendResources failed:', err)
          if (!cancelled) setRecommended([])
        })
        .finally(() => {
          if (!cancelled) setRecommendLoading(false)
        })
    }, 600)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [userId, profileImmigration, profileLanguage, profileOccupation, recommendLog])

  // Debounce search input — 300ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  useEffect(() => {
    let isMounted = true

    const loadResources = async () => {
      setIsLoading(true)
      try {
        const result = await fetchResources({
          search: debouncedSearch,
          category: activeCategory,
          sort,
          latinoOnly,
        })
        if (isMounted) {
          setResources(result)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadResources()

    return () => {
      isMounted = false
    }
  }, [debouncedSearch, activeCategory, sort, latinoOnly])

  const metrics = useMemo(
    () => [
      {
        label: language === 'es' ? 'Recursos guardados' : 'Saved resources',
        value: user ? savedResourceIds.length : 0,
        Icon: Bookmark,
        color: '#dc2626', // heart red — what you love
        glow: 'rgba(220,38,38,0.55)',
      },
      {
        label: language === 'es' ? 'Para latinos' : 'Latino-focused',
        value: resources.filter(resource => resource.verified).length,
        Icon: Globe2,
        color: '#00aa63', // brand green — verified
        glow: 'rgba(0,170,99,0.5)',
      },
      {
        label: language === 'es' ? 'Total recursos' : 'Total resources',
        value: resources.length,
        Icon: Compass,
        color: '#1777d7', // brand blue — discovery
        glow: 'rgba(23,119,215,0.5)',
      },
    ],
    [language, resources, savedResourceIds.length, user]
  )

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#050608] px-5 pb-56 pt-14 shadow-[0_40px_120px_-40px_rgba(255,129,0,0.35)] sm:px-10 sm:pb-64 sm:pt-20 lg:px-14 lg:pb-72 lg:pt-24">
        {/* Latino tropical texture — PINK.jpg monstera pattern, heavily darkened + blurred */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-screen"
          style={{
            backgroundImage: "url('/PINK.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px) saturate(1.1)',
          }}
        />
        {/* Glass darkening layer — pulls the texture back and makes text pop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#050608]/75 backdrop-blur-[2px]"
        />
        {/* Landing-palette horizon — warm core, brand-color hints at edges */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[55%] aspect-square w-[220%] -translate-x-1/2 rounded-full sm:w-[180%] lg:top-[50%] lg:w-[160%]"
          style={{
            background:
              'radial-gradient(circle at center, rgba(255,129,0,0.58) 0%, rgba(220,38,38,0.3) 18%, rgba(248,45,26,0.15) 34%, transparent 58%)',
          }}
        />
        {/* Side glows — subtle brand color hints */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 bottom-[20%] h-[380px] w-[380px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(23,119,215,0.55) 0%, transparent 70%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 bottom-[15%] h-[360px] w-[360px] rounded-full opacity-25 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(0,170,99,0.55) 0%, transparent 70%)',
          }}
        />
        {/* Crisp rim highlight along the horizon arc */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[55%] aspect-square w-[220%] -translate-x-1/2 rounded-full sm:w-[180%] lg:top-[50%] lg:w-[160%]"
          style={{
            boxShadow: '0 -1px 0 0 rgba(255,181,90,0.75), 0 -30px 100px -10px rgba(255,129,0,0.5)',
          }}
        />
        {/* Starfield dots — landing-style subtle */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(1px 1px at 18% 24%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 82% 12%, rgba(255,255,255,0.35), transparent), radial-gradient(1px 1px at 64% 30%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 30% 18%, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 92% 28%, rgba(255,255,255,0.35), transparent)',
          }}
        />
        {/* Top hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff8100]/40 to-transparent"
        />

        {/* Content — centered, responsive */}
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#ff8100]/30 bg-[#ff8100]/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#ffb15a] backdrop-blur-md">
            <Sparkles className="size-3" aria-hidden="true" />
            {language === 'es' ? 'Tu camino empieza aquí' : 'Your path starts here'}
          </p>
          <h1 className="mt-6 bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-[2.25rem] leading-[1.05] text-transparent sm:text-5xl lg:text-[4.5rem]">
            {language === 'es'
              ? 'Encuentra apoyo confiable para tu familia'
              : 'Find trusted support for your family'}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-base">
            {language === 'es'
              ? 'Corazón reúne recursos comunitarios, legales y de salud en un espacio claro, bilingüe y pensado para tu tranquilidad.'
              : 'Corazón brings legal, healthcare, and community resources together in one bilingual space designed for clarity and trust.'}
          </p>

          <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3">
            {metrics.map(metric => {
              const MetricIcon = metric.Icon
              return (
                <article
                  key={metric.label}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0b10]/60 p-5 text-left backdrop-blur-xl transition-all duration-500 hover:-translate-y-1"
                  style={
                    {
                      ['--metric-color' as string]: metric.color,
                    } as CSSProperties
                  }
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${metric.color}66`
                    e.currentTarget.style.boxShadow = `0 0 40px -10px ${metric.glow}`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = ''
                    e.currentTarget.style.boxShadow = ''
                  }}
                >
                  {/* Per-color inner glow at bottom */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-80"
                    style={{
                      background: `radial-gradient(circle, ${metric.color}99 0%, ${metric.color}33 40%, transparent 70%)`,
                    }}
                  />
                  {/* Top hairline in metric color */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${metric.color}99, transparent)`,
                    }}
                  />
                  {/* Diagonal glass sheen */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent"
                  />

                  <div className="relative flex items-start justify-between gap-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
                      {metric.label}
                    </p>
                    {/* Framed icon badge tinted with metric color */}
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl border shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                      style={{
                        borderColor: `${metric.color}55`,
                        background: `${metric.color}1a`,
                        color: metric.color,
                      }}
                    >
                      <MetricIcon className="size-4" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="relative mt-4 bg-gradient-to-b from-white to-white/50 bg-clip-text font-heading text-5xl leading-none text-transparent">
                    {metric.value}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* AI-powered recommended resources — uses /api/ai/recommend */}
      {user?.profile && (recommendLoading || recommended.length > 0) ? (
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0b10]/60 p-5 backdrop-blur-xl sm:p-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full opacity-60 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(255,129,0,0.45) 0%, rgba(255,69,96,0.2) 40%, transparent 70%)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff8100]/50 to-transparent"
          />
          <div className="relative mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-[#ff8100]/30 bg-[#ff8100]/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ffb15a]">
                <Sparkles className="size-3" aria-hidden="true" />
                {language === 'es' ? 'Recomendado para ti' : 'Recommended for you'}
              </p>
              <h2 className="mt-3 bg-gradient-to-b from-white to-white/70 bg-clip-text text-xl text-transparent sm:text-2xl">
                {language === 'es'
                  ? 'Estos recursos coinciden con tu perfil'
                  : 'These resources match your profile'}
              </h2>
            </div>
            <span className="hidden text-[11px] text-white/40 sm:inline">
              {language === 'es' ? 'Modelo de IA de Corazón' : 'Powered by Corazón AI'}
            </span>
          </div>

          {recommendLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/40" />
              ))}
            </div>
          ) : (
            <ul className="relative space-y-2.5">
              {recommended.map((rec, i) => {
                const name = rec.title || rec.name || rec.organization || `Recurso ${i + 1}`
                const desc = rec.description || ''
                const category = rec.category || (rec.categories && rec.categories[0]) || ''
                const url = rec.url || ''
                const inner = (
                  <article className="relative flex items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#ff8100]/30 bg-[#ff8100]/10 shadow-[inset_0_1px_0_0_rgba(255,181,90,0.25)]">
                      <Sparkles className="size-4 text-[#ffb15a]" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-white">{name}</p>
                        {category ? (
                          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
                            {category}
                          </span>
                        ) : null}
                      </div>
                      {desc ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/50">
                          {desc}
                        </p>
                      ) : null}
                    </div>
                    {url ? (
                      <ArrowUpRight
                        className="size-4 shrink-0 text-white/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#ffb15a]"
                        aria-hidden="true"
                      />
                    ) : null}
                  </article>
                )

                return (
                  <li key={rec.id || `${name}-${i}`}>
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 backdrop-blur-md transition-all duration-300 hover:border-[#ff8100]/40 hover:bg-white/[0.05] hover:shadow-[0_0_30px_-10px_rgba(255,129,0,0.4)]"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 backdrop-blur-md">
                        {inner}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0b10]/60 p-4 backdrop-blur-xl sm:flex-row sm:items-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff8100]/50 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(255,129,0,0.35) 0%, transparent 70%)',
            }}
          />
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#ffb15a]/70" />
            <label htmlFor="resource-search" className="sr-only">
              {language === 'es' ? 'Buscar recursos' : 'Search resources'}
            </label>
            <input
              id="resource-search"
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={
                language === 'es'
                  ? 'Busca por clínica, ayuda legal, clases de inglés...'
                  : 'Search by clinic, legal aid, English classes...'
              }
              className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-3 text-sm text-white placeholder:text-white/35 outline-none backdrop-blur-md transition-all duration-300 focus-visible:border-[#ff8100]/50 focus-visible:bg-black/50 focus-visible:shadow-[0_0_30px_-10px_rgba(255,129,0,0.5)]"
            />
          </div>

          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="relative inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/80 backdrop-blur-md transition-all duration-300 hover:border-[#ff8100]/40 hover:bg-white/[0.08] hover:text-white"
          >
            <Filter className="size-4" aria-hidden="true" />
            {language === 'es' ? 'Limpiar filtros' : 'Reset filters'}
          </button>
        </div>

        <div className="-mx-1 overflow-x-auto pb-2">
          <div className="inline-flex min-w-full gap-2 px-1">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={cn(
                'h-10 shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-4 text-sm font-medium backdrop-blur-md transition-all duration-300',
                activeCategory === 'all'
                  ? 'border-[#ff8100]/55 bg-[#ff8100]/15 text-white shadow-[0_0_30px_-8px_rgba(255,129,0,0.7),inset_0_1px_0_0_rgba(255,181,90,0.35)]'
                  : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-[#ff8100]/30 hover:bg-white/[0.06] hover:text-white'
              )}
            >
              {language === 'es' ? 'Todos' : 'All'}
            </button>

            {resourceCategories.map(category => {
              const Icon = categoryIcons[category.key]
              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setActiveCategory(category.key)}
                  className={cn(
                    'inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium backdrop-blur-md transition-all duration-300',
                    activeCategory === category.key
                      ? 'border-[#ff8100]/55 bg-[#ff8100]/15 text-white shadow-[0_0_30px_-8px_rgba(255,129,0,0.7),inset_0_1px_0_0_rgba(255,181,90,0.35)]'
                      : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-[#ff8100]/30 hover:bg-white/[0.06] hover:text-white'
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {language === 'es' ? category.labelEs : category.labelEn}
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setLatinoOnly(!latinoOnly)}
          className={cn(
            'inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border px-4 text-xs font-medium backdrop-blur-md transition-all duration-300',
            latinoOnly
              ? 'border-[#ff8100]/50 bg-[#ff8100]/12 text-[#ffb15a] shadow-[0_0_25px_-10px_rgba(255,129,0,0.6)]'
              : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-[#ff8100]/30 hover:bg-white/[0.05] hover:text-white/90'
          )}
        >
          <span
            className={cn(
              'size-1.5 rounded-full transition-colors',
              latinoOnly ? 'bg-[#ffb15a] shadow-[0_0_8px_rgba(255,181,90,0.8)]' : 'bg-white/30'
            )}
          />
          {language === 'es' ? 'Solo para latinos' : 'Latino-focused only'}
        </button>
      </section>

      {!user ? (
        <section className="relative overflow-hidden rounded-2xl border border-[#ff8100]/25 bg-[#0a0b10]/60 p-5 backdrop-blur-xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full opacity-60 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(255,129,0,0.5) 0%, rgba(255,69,96,0.25) 40%, transparent 70%)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff8100]/50 to-transparent"
          />
          <p className="relative text-sm leading-relaxed text-white/85">
            {language === 'es'
              ? 'Explora libremente como invitado. Inicia sesión para guardar recursos, subir documentos y conservar tu historial de voz.'
              : 'Browse freely as a guest. Sign in to save resources, upload documents, and keep your voice chat history.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="relative mt-4 inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#ff8100]/50 bg-gradient-to-br from-[#ff8100] via-[#ff8100] to-[#f82d1a] px-5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(255,129,0,0.7),inset_0_1px_0_0_rgba(255,181,90,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_40px_-10px_rgba(255,129,0,0.9)]"
          >
            {language === 'es' ? 'Crear cuenta gratis' : 'Create free account'}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </button>
        </section>
      ) : null}

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-gradient-to-r from-transparent to-[#ff8100]/60"
              />
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#ffb15a]">
                {language === 'es' ? 'Directorio' : 'Directory'}
              </p>
            </div>
            <h2 className="mt-2 bg-gradient-to-b from-white to-white/70 bg-clip-text text-2xl text-transparent sm:text-3xl">
              {language === 'es' ? 'Recursos para ti' : 'Resources for you'}
            </h2>
            <p className="mt-1 text-sm text-white/50">
              {language === 'es'
                ? 'Explora servicios verificados por categoría.'
                : 'Explore verified services by category.'}
            </p>
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="h-11 cursor-pointer rounded-xl border border-white/10 bg-[#0a0b10]/60 px-3 text-sm text-white/80 backdrop-blur-md outline-none transition-all duration-300 focus-visible:border-[#ff8100]/50 focus-visible:shadow-[0_0_25px_-10px_rgba(255,129,0,0.6)]"
          >
            <option value="relevance">
              {language === 'es' ? 'Más relevantes' : 'Most relevant'}
            </option>
            <option value="latino_first">
              {language === 'es' ? 'Para latinos primero' : 'Latino-focused first'}
            </option>
            <option value="recent">{language === 'es' ? 'Más recientes' : 'Most recent'}</option>
            <option value="az">{language === 'es' ? 'A → Z' : 'A → Z'}</option>
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-[420px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]"
              />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0b10]/60 p-8 text-center backdrop-blur-xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff8100]/40 to-transparent"
            />
            <p className="text-sm text-white/60">
              {language === 'es'
                ? 'No encontramos resultados con ese filtro. Prueba otra búsqueda.'
                : 'No results found for that filter. Try a different search.'}
            </p>
          </div>
        ) : (
          <div className="max-h-[calc(3*460px+2*1rem)] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map(resource => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onRequestAuth={() => navigate('/auth')}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
