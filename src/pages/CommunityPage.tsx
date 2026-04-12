import { CheckCircle2, Globe2, MapPin, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { resourceCategories } from '@/data/mockData'
import { fetchCommunityOrganizations, type SortOption } from '@/lib/supabaseApi'
import { cn } from '@/lib/utils'
import type { CommunityOrganization, ResourceCategory } from '@/types/app'

export const CommunityPage = () => {
  const { language } = useAppContext()
  const [category, setCategory] = useState<ResourceCategory | 'all'>('all')
  const [sort, setSort] = useState<SortOption>('relevance')
  const [organizations, setOrganizations] = useState<CommunityOrganization[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadOrganizations = async () => {
      setIsLoading(true)
      try {
        const result = await fetchCommunityOrganizations(category, sort)
        if (isMounted) {
          setOrganizations(result)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOrganizations()

    return () => {
      isMounted = false
    }
  }, [category, sort])

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-7">
        <h1 className="text-3xl sm:text-4xl">
          {language === 'es' ? 'Buscador comunitario' : 'Community finder'}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {language === 'es'
            ? 'Compara organizaciones por categoría para elegir apoyo confiable cerca de ti.'
            : 'Compare organizations by category to choose trusted help near you.'}
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/50 bg-card/70 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {language === 'es' ? 'Filtros rápidos' : 'Quick filters'}
          </p>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="h-9 cursor-pointer rounded-lg border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

        <div className="-mx-1 overflow-x-auto pb-1">
          <div className="inline-flex min-w-full gap-2 px-1">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={cn(
                'h-11 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors duration-200',
                category === 'all'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-primary/15'
              )}
            >
              {language === 'es' ? 'Todas las categorías' : 'All categories'}
            </button>
            {resourceCategories.map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => setCategory(item.key)}
                className={cn(
                  'h-11 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors duration-200',
                  category === item.key
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:bg-primary/15'
                )}
              >
                {language === 'es' ? item.labelEs : item.labelEn}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`org-skeleton-${index}`}
                className="h-56 animate-pulse rounded-2xl bg-muted/60"
              />
            ))}
          </div>
        ) : organizations.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {language === 'es'
              ? 'No encontramos organizaciones con ese filtro.'
              : 'No organizations found for that filter.'}
          </div>
        ) : (
          <div className="max-h-[calc(3*240px+2*1rem)] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {organizations.map(organization => (
                <article
                  key={organization.id}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 transition-colors duration-200 hover:border-primary/45"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-heading text-lg">{organization.name}</h2>
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                        organization.verified
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : 'bg-muted/90 text-muted-foreground'
                      )}
                    >
                      {organization.verified ? (
                        <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      ) : (
                        <Globe2 className="size-3.5" aria-hidden="true" />
                      )}
                      {organization.verified
                        ? language === 'es'
                          ? 'Para latinos'
                          : 'Latino-focused'
                        : language === 'es'
                          ? 'Recurso comunitario'
                          : 'Community resource'}
                    </span>
                  </div>

                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {organization.summary}
                  </p>

                  <div className="mt-auto space-y-2 text-xs text-muted-foreground">
                    {organization.address && (
                      <p className="inline-flex items-center gap-2">
                        <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                        {organization.address}
                      </p>
                    )}
                    {organization.phone && (
                      <p className="inline-flex items-center gap-2">
                        <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                        {organization.phone}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
