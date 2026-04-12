import {
  AlertCircle,
  ChartNoAxesCombined,
  Compass,
  Filter,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ResourceCard } from '@/components/ResourceCard'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/context/AppContext'
import { resourceCategories } from '@/data/mockData'
import { fetchResources, type SortOption } from '@/lib/supabaseApi'
import { cn } from '@/lib/utils'
import type { Resource, ResourceCategory } from '@/types/app'

const categoryIcons: Record<ResourceCategory, typeof ShieldCheck> = {
  legal: ShieldCheck,
  healthcare: Sparkles,
  immigration: Compass,
  education: ChartNoAxesCombined,
  community: MapPin,
  social_life: Sparkles,
  financial_aid: AlertCircle,
  language_learning: ChartNoAxesCombined,
  business: Sparkles,
}

export const DashboardPage = () => {
  const { language, savedResourceIds, user } = useAppContext()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'all'>('all')
  const [sort, setSort] = useState<SortOption>('relevance')
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
  }, [debouncedSearch, activeCategory, sort])

  const metrics = useMemo(
    () => [
      {
        label: language === 'es' ? 'Recursos guardados' : 'Saved resources',
        value: user ? savedResourceIds.length : 0,
      },
      {
        label: language === 'es' ? 'Para latinos' : 'Latino-focused',
        value: resources.filter(resource => resource.verified).length,
      },
      {
        label: language === 'es' ? 'Total recursos' : 'Total resources',
        value: resources.length,
      },
    ],
    [language, resources, savedResourceIds.length, user]
  )

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-7 lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/90">
          {language === 'es' ? 'Tu camino empieza aquí' : 'Your path starts here'}
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl">
          {language === 'es'
            ? 'Encuentra apoyo confiable para tu familia'
            : 'Find trusted support for your family'}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {language === 'es'
            ? 'Corazón reúne recursos comunitarios, legales y de salud en un espacio claro, bilingüe y pensado para tu tranquilidad.'
            : 'Corazón brings legal, healthcare, and community resources together in one bilingual space designed for clarity and trust.'}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {metrics.map(metric => (
            <article
              key={metric.label}
              className="rounded-2xl border border-border/50 bg-background/80 p-4 transition-colors duration-200 hover:border-primary/40"
            >
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="mt-2 font-heading text-3xl text-primary">{metric.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/70 p-4 sm:flex-row sm:items-center">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
              className="h-11 w-full rounded-xl border border-input bg-background px-10 text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 cursor-pointer"
            onClick={() => setActiveCategory('all')}
          >
            <Filter className="size-4" aria-hidden="true" />
            {language === 'es' ? 'Limpiar filtros' : 'Reset filters'}
          </Button>
        </div>

        <div className="-mx-1 overflow-x-auto pb-2">
          <div className="inline-flex min-w-full gap-2 px-1">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={cn(
                'h-11 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors duration-200',
                activeCategory === 'all'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:bg-primary/15'
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
                    'inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-200',
                    activeCategory === category.key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card hover:bg-primary/15'
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {language === 'es' ? category.labelEs : category.labelEn}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {!user ? (
        <section className="rounded-2xl border border-amber-300/30 bg-amber-400/10 p-4">
          <p className="text-sm text-foreground/95">
            {language === 'es'
              ? 'Explora libremente como invitado. Inicia sesión para guardar recursos, subir documentos y conservar tu historial de voz.'
              : 'Browse freely as a guest. Sign in to save resources, upload documents, and keep your voice chat history.'}
          </p>
          <Button
            type="button"
            className="mt-3 h-11 cursor-pointer bg-[var(--cta)] text-background hover:bg-[var(--cta)]/85"
            onClick={() => navigate('/auth')}
          >
            {language === 'es' ? 'Crear cuenta gratis' : 'Create free account'}
          </Button>
        </section>
      ) : null}

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl">
              {language === 'es' ? 'Recursos para ti' : 'Resources for you'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {language === 'es'
                ? 'Explora servicios verificados por categoría.'
                : 'Explore verified services by category.'}
            </p>
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="h-11 cursor-pointer rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                className="h-[420px] animate-pulse rounded-2xl bg-muted/60"
              />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {language === 'es'
              ? 'No encontramos resultados con ese filtro. Prueba otra búsqueda.'
              : 'No results found for that filter. Try a different search.'}
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
