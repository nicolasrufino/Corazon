import { CheckCircle2, Clock3, Languages, Phone, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { resourceCategories } from '@/data/mockData';
import { fetchCommunityOrganizations } from '@/lib/mockApi';
import { cn } from '@/lib/utils';
import type { CommunityOrganization, ResourceCategory } from '@/types/app';

export const CommunityPage = () => {
  const { language } = useAppContext();
  const [category, setCategory] = useState<ResourceCategory | 'all'>('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'Español' | 'English'>('all');
  const [organizations, setOrganizations] = useState<CommunityOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadOrganizations = async () => {
      setIsLoading(true);
      try {
        const result = await fetchCommunityOrganizations(category, languageFilter);
        if (isMounted) {
          setOrganizations(result);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOrganizations();

    return () => {
      isMounted = false;
    };
  }, [category, languageFilter]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-7">
        <h1 className="text-3xl sm:text-4xl">
          {language === 'es' ? 'Buscador comunitario' : 'Community finder'}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {language === 'es'
            ? 'Compara organizaciones por categoría y servicios lingüísticos para elegir apoyo confiable cerca de ti.'
            : 'Compare organizations by category and language support to choose trusted help near you.'}
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/50 bg-card/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {language === 'es' ? 'Filtros rápidos' : 'Quick filters'}
        </p>

        <div className="-mx-1 overflow-x-auto pb-1">
          <div className="inline-flex min-w-full gap-2 px-1">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={cn(
                'h-11 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors duration-200',
                category === 'all' ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-primary/15',
              )}
            >
              {language === 'es' ? 'Todas las categorías' : 'All categories'}
            </button>
            {resourceCategories.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setCategory(item.key)}
                className={cn(
                  'h-11 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors duration-200',
                  category === item.key
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:bg-primary/15',
                )}
              >
                {language === 'es' ? item.labelEs : item.labelEn}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'Español', 'English'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLanguageFilter(option)}
              className={cn(
                'h-11 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors duration-200',
                languageFilter === option
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-primary/15',
              )}
            >
              {option === 'all'
                ? language === 'es'
                  ? 'Todos los idiomas'
                  : 'All languages'
                : option}
            </button>
          ))}
        </div>
      </section>

      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`org-skeleton-${index}`} className="h-56 animate-pulse rounded-2xl bg-muted/60" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {organizations.map((organization) => (
              <article
                key={organization.id}
                className="flex h-full flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 transition-colors duration-200 hover:border-primary/45"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-heading text-lg">{organization.name}</h2>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                      organization.verified ? 'bg-primary/20 text-primary' : 'bg-amber-500/20 text-amber-200',
                    )}
                  >
                    {organization.verified ? (
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    ) : (
                      <ShieldAlert className="size-3.5" aria-hidden="true" />
                    )}
                    {organization.verified
                      ? language === 'es'
                        ? 'Verificado'
                        : 'Verified'
                      : language === 'es'
                        ? 'Pendiente'
                        : 'Pending'}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">{organization.summary}</p>

                <div className="mt-auto space-y-2 text-xs text-muted-foreground">
                  <p className="inline-flex items-center gap-2">
                    <Phone className="size-3.5" aria-hidden="true" />
                    {organization.phone}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Languages className="size-3.5" aria-hidden="true" />
                    {organization.languages.join(' · ')}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    {organization.openNow
                      ? language === 'es'
                        ? 'Abierto ahora'
                        : 'Open now'
                      : language === 'es'
                        ? 'Horario limitado'
                        : 'Limited hours'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
