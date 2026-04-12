import { Bookmark, CheckCircle2, Globe2, Heart, MapPin, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import type { Resource } from '@/types/app'

interface ResourceCardProps {
  resource: Resource
  onRequestAuth: () => void
}

export const ResourceCard = ({ resource, onRequestAuth }: ResourceCardProps) => {
  const { language, user, hasSavedResource, toggleSavedResource } = useAppContext()

  const isSaved = hasSavedResource(resource.id)

  const handleSave = () => {
    if (!user) {
      onRequestAuth()
      return
    }
    toggleSavedResource(resource)
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45">
      <div className="relative h-48 w-full overflow-hidden">
        {resource.imageUrl ? (
          <img
            src={resource.imageUrl}
            alt={resource.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/40">
            <Heart className="size-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <span
          className={cn(
            'absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
            resource.verified
              ? 'bg-emerald-500/20 text-emerald-200'
              : 'bg-muted/90 text-muted-foreground'
          )}
        >
          {resource.verified ? (
            <CheckCircle2 className="size-3" aria-hidden="true" />
          ) : (
            <Globe2 className="size-3" aria-hidden="true" />
          )}
          {resource.verified
            ? language === 'es'
              ? 'Para latinos'
              : 'Latino-focused'
            : language === 'es'
              ? 'Recurso comunitario'
              : 'Community resource'}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <h3 className="font-heading text-lg leading-tight">{resource.name}</h3>

        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {resource.description}
        </p>

        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {resource.tags.map(tag => (
              <span
                key={tag}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs',
                  tag === 'Latino-focused'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : 'border-border/80 bg-background/60 text-foreground/90'
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-2 text-xs text-muted-foreground">
          {resource.address && (
            <p className="inline-flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {resource.address}
            </p>
          )}
          {resource.phone && (
            <p className="inline-flex items-center gap-2">
              <PhoneCall className="size-3.5 shrink-0" aria-hidden="true" />
              {resource.phone}
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {resource.website && (
            <Button
              type="button"
              className="h-11 cursor-pointer bg-[var(--cta)] text-background hover:bg-[var(--cta)]/85"
              asChild
            >
              <a href={resource.website} target="_blank" rel="noreferrer">
                {language === 'es' ? 'Visitar' : 'Visit'}
              </a>
            </Button>
          )}
          <Button
            type="button"
            variant={isSaved ? 'default' : 'outline'}
            className="h-11 cursor-pointer"
            onClick={handleSave}
          >
            <Bookmark className="size-4" aria-hidden="true" />
            {isSaved
              ? language === 'es'
                ? 'Guardado'
                : 'Saved'
              : language === 'es'
                ? 'Guardar'
                : 'Save'}
          </Button>
        </div>
      </div>
    </article>
  )
}
