import { ArrowUpRight, Bookmark, CheckCircle2, Globe2, MapPin, PhoneCall } from 'lucide-react'
import { useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import type { Resource } from '@/types/app'

// Latino-vibe fallback art — rotates per resource for visual variety
const FALLBACK_ART = ['/PINK.jpg', '/green.jpg', '/other.png']
const pickFallback = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return FALLBACK_ART[Math.abs(hash) % FALLBACK_ART.length]
}

interface ResourceCardProps {
  resource: Resource
  onRequestAuth: () => void
}

export const ResourceCard = ({ resource, onRequestAuth }: ResourceCardProps) => {
  const { language, user, hasSavedResource, toggleSavedResource, logResourceInteraction } =
    useAppContext()
  const [imageFailed, setImageFailed] = useState(false)

  const isSaved = hasSavedResource(resource.id)

  const handleSave = () => {
    if (!user) {
      onRequestAuth()
      return
    }
    toggleSavedResource(resource)
  }

  // Click-throughs on the website link are the strongest intent signal
  // we have — the user is actively leaving to engage with the resource.
  // Log it into the interaction log regardless of auth state.
  const handleVisit = () => {
    logResourceInteraction(resource)
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0b10]/60 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#ff8100]/30 hover:shadow-[0_30px_80px_-20px_rgba(255,129,0,0.35)]">
      {/* Top amber hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#ff8100]/50 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100"
      />
      {/* Diagonal glass sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100"
      />
      {/* Amber corner glow on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
        style={{
          background:
            'radial-gradient(circle, rgba(255,129,0,0.5) 0%, rgba(255,69,96,0.25) 40%, transparent 70%)',
        }}
      />

      <div className="relative h-44 w-full overflow-hidden sm:h-48">
        {resource.imageUrl && !imageFailed ? (
          <img
            src={resource.imageUrl}
            alt={resource.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
          />
        ) : (
          <div className="relative h-full w-full overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.08]"
              style={{
                backgroundImage: `url('${pickFallback(resource.id)}')`,
                filter: 'saturate(0.85) brightness(0.75)',
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-[#050608]/30 via-[#050608]/50 to-[#050608]/70"
            />
            <div aria-hidden="true" className="absolute inset-0 backdrop-blur-[1px]" />
          </div>
        )}

        {/* Image fade to card + subtle warm tint at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10]/50 to-transparent" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#ff8100]/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        {/* Badge — amber-tinted glass for verified, neutral otherwise */}
        <span
          className={cn(
            'absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-xl',
            resource.verified
              ? 'border-[#ff8100]/40 bg-[#ff8100]/10 text-[#ffb15a] shadow-[inset_0_1px_0_0_rgba(255,181,90,0.3)]'
              : 'border-white/15 bg-black/40 text-white/70'
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
              ? 'Comunitario'
              : 'Community'}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-heading text-lg leading-tight text-white">{resource.name}</h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-white/55">{resource.description}</p>

        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resource.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/60 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-1.5 text-[11px] text-white/45">
          {resource.address && (
            <p className="inline-flex items-center gap-1.5">
              <MapPin className="size-3 shrink-0" aria-hidden="true" />
              <span className="line-clamp-1">{resource.address}</span>
            </p>
          )}
          {resource.phone && (
            <p className="inline-flex items-center gap-1.5">
              <PhoneCall className="size-3 shrink-0" aria-hidden="true" />
              {resource.phone}
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {resource.website && (
            <a
              href={resource.website}
              target="_blank"
              rel="noreferrer"
              onClick={handleVisit}
              className="relative inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-xl border border-[#ff8100]/50 bg-gradient-to-br from-[#ff8100] via-[#ff8100] to-[#f82d1a] text-sm font-semibold text-white shadow-[0_6px_20px_-6px_rgba(255,129,0,0.65),inset_0_1px_0_0_rgba(255,181,90,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-6px_rgba(255,129,0,0.85)]"
            >
              {language === 'es' ? 'Visitar' : 'Visit'}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          )}
          <button
            type="button"
            onClick={handleSave}
            className={cn(
              'inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-4 text-sm font-medium backdrop-blur-md transition-all duration-300',
              isSaved
                ? 'border-[#ff8100]/50 bg-[#ff8100]/10 text-[#ffb15a] shadow-[inset_0_1px_0_0_rgba(255,181,90,0.3)]'
                : 'border-white/15 bg-white/[0.04] text-white/75 hover:border-[#ff8100]/30 hover:bg-white/[0.08] hover:text-white'
            )}
          >
            <Bookmark className={cn('size-4', isSaved && 'fill-[#ffb15a]')} aria-hidden="true" />
            {isSaved
              ? language === 'es'
                ? 'Guardado'
                : 'Saved'
              : language === 'es'
                ? 'Guardar'
                : 'Save'}
          </button>
        </div>
      </div>
    </article>
  )
}
