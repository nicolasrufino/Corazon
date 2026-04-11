import { Bookmark, CheckCircle2, Clock3, Globe2, MapPin, PhoneCall, ShieldAlert, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import type { Resource } from '@/types/app';

interface ResourceCardProps {
  resource: Resource;
  onRequestAuth: () => void;
}

export const ResourceCard = ({ resource, onRequestAuth }: ResourceCardProps) => {
  const { language, user, hasSavedResource, toggleSavedResource } = useAppContext();

  const isSaved = hasSavedResource(resource.id);

  const handleSave = () => {
    if (!user) {
      onRequestAuth();
      return;
    }
    toggleSavedResource(resource);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-lg shadow-black/15 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45">
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={resource.imageUrl}
          alt={resource.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <span
          className={cn(
            'absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
            resource.openNow ? 'bg-emerald-500/20 text-emerald-200' : 'bg-muted/90 text-muted-foreground',
          )}
        >
          <Clock3 className="size-3" aria-hidden="true" />
          {resource.openNow
            ? language === 'es'
              ? 'Abierto ahora'
              : 'Open now'
            : language === 'es'
              ? 'Horario limitado'
              : 'Limited hours'}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-lg leading-tight">{resource.name}</h3>
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
              resource.verified ? 'bg-primary/20 text-primary' : 'bg-amber-500/20 text-amber-200',
            )}
          >
            {resource.verified ? (
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
            ) : (
              <ShieldAlert className="size-3.5" aria-hidden="true" />
            )}
            {resource.verified
              ? language === 'es'
                ? 'Verificado'
                : 'Verified'
              : language === 'es'
                ? 'Pendiente'
                : 'Pending'}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{resource.description}</p>

        <div className="flex flex-wrap gap-2">
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/80 bg-background/60 px-2.5 py-1 text-xs text-foreground/90"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="inline-flex items-center gap-2">
            <Star className="size-3.5 text-amber-300" aria-hidden="true" />
            {resource.rating} / 5 · {resource.distanceLabel}
          </p>
          <p className="inline-flex items-center gap-2">
            <MapPin className="size-3.5" aria-hidden="true" />
            {resource.address}
          </p>
          <p className="inline-flex items-center gap-2">
            <PhoneCall className="size-3.5" aria-hidden="true" />
            {resource.phone}
          </p>
          <p className="inline-flex items-center gap-2">
            <Globe2 className="size-3.5" aria-hidden="true" />
            {resource.languages.join(' · ')}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Button
            type="button"
            className="h-11 cursor-pointer bg-[var(--cta)] text-background hover:bg-[var(--cta)]/85"
            asChild
          >
            <a href={resource.website} target="_blank" rel="noreferrer">
              {language === 'es' ? 'Visitar' : 'Visit'}
            </a>
          </Button>
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
  );
};
