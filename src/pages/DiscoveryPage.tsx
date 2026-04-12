import { Bookmark, Search, Sparkles } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'

/*──────────────────────────────────────────────
  Placeholder Discovery / Explore feed.

  Pinterest-style masonry of mixed-aspect cards. Each card is a gradient
  placeholder for now — once we wire up profiles + content, swap the
  inner gradient for an <img> and let `break-inside-avoid` keep doing
  the layout work.
──────────────────────────────────────────────*/

interface Pin {
  id: number
  // CSS aspect-ratio so cards have varied heights like a real masonry feed
  aspect: string
  // Linear-gradient string for the placeholder fill
  gradient: string
  title: string
  category: string
}

const palette = {
  orange: '#ff8100',
  red: '#dc2626',
  green: '#00aa63',
  blue: '#1777d7',
  yellow: '#ffd300',
  pink: '#ffb5e2',
  amber: '#ff8a1f',
  emerald: '#34d399',
  pearl: '#f7f2e8',
  citrine: '#ffd300',
  aquamarine: '#70b0a6',
}

const pins: Pin[] = [
  {
    id: 1,
    aspect: '3 / 4',
    gradient: `linear-gradient(135deg, ${palette.orange}, ${palette.red})`,
    title: 'Family recipes',
    category: 'Food',
  },
  {
    id: 2,
    aspect: '1 / 1',
    gradient: `linear-gradient(135deg, ${palette.blue}, ${palette.aquamarine})`,
    title: 'College essay tips',
    category: 'Education',
  },
  {
    id: 3,
    aspect: '4 / 5',
    gradient: `linear-gradient(135deg, ${palette.green}, ${palette.emerald})`,
    title: 'Free legal aid',
    category: 'Legal',
  },
  {
    id: 4,
    aspect: '2 / 3',
    gradient: `linear-gradient(135deg, ${palette.pink}, ${palette.red})`,
    title: 'Mujeres en STEM',
    category: 'Career',
  },
  {
    id: 5,
    aspect: '4 / 3',
    gradient: `linear-gradient(135deg, ${palette.yellow}, ${palette.orange})`,
    title: 'Beca opportunities',
    category: 'Scholarships',
  },
  {
    id: 6,
    aspect: '3 / 4',
    gradient: `linear-gradient(135deg, ${palette.amber}, ${palette.yellow})`,
    title: 'Salsa night Chicago',
    category: 'Events',
  },
  {
    id: 7,
    aspect: '1 / 1',
    gradient: `linear-gradient(135deg, ${palette.aquamarine}, ${palette.blue})`,
    title: 'Mental health en Español',
    category: 'Wellness',
  },
  {
    id: 8,
    aspect: '2 / 3',
    gradient: `linear-gradient(135deg, ${palette.red}, ${palette.pink})`,
    title: 'First-gen guide',
    category: 'Education',
  },
  {
    id: 9,
    aspect: '4 / 5',
    gradient: `linear-gradient(135deg, ${palette.emerald}, ${palette.aquamarine})`,
    title: 'Latino-owned cafés',
    category: 'Local',
  },
  {
    id: 10,
    aspect: '3 / 4',
    gradient: `linear-gradient(135deg, ${palette.orange}, ${palette.pink})`,
    title: 'Heritage month playlist',
    category: 'Culture',
  },
  {
    id: 11,
    aspect: '1 / 1',
    gradient: `linear-gradient(135deg, ${palette.yellow}, ${palette.green})`,
    title: 'Tax help bilingüe',
    category: 'Finance',
  },
  {
    id: 12,
    aspect: '4 / 3',
    gradient: `linear-gradient(135deg, ${palette.blue}, ${palette.pink})`,
    title: 'Quinceañera DIYs',
    category: 'Family',
  },
  {
    id: 13,
    aspect: '2 / 3',
    gradient: `linear-gradient(135deg, ${palette.green}, ${palette.yellow})`,
    title: 'Voto bilingüe',
    category: 'Civics',
  },
  {
    id: 14,
    aspect: '3 / 4',
    gradient: `linear-gradient(135deg, ${palette.pink}, ${palette.amber})`,
    title: 'Latina founders',
    category: 'Career',
  },
  {
    id: 15,
    aspect: '4 / 5',
    gradient: `linear-gradient(135deg, ${palette.red}, ${palette.orange})`,
    title: 'Comida rápida',
    category: 'Food',
  },
  {
    id: 16,
    aspect: '1 / 1',
    gradient: `linear-gradient(135deg, ${palette.aquamarine}, ${palette.green})`,
    title: 'Yoga en parque',
    category: 'Wellness',
  },
  {
    id: 17,
    aspect: '3 / 4',
    gradient: `linear-gradient(135deg, ${palette.amber}, ${palette.red})`,
    title: 'Apartment hunting',
    category: 'Housing',
  },
  {
    id: 18,
    aspect: '2 / 3',
    gradient: `linear-gradient(135deg, ${palette.blue}, ${palette.green})`,
    title: 'Resume templates',
    category: 'Career',
  },
  {
    id: 19,
    aspect: '4 / 3',
    gradient: `linear-gradient(135deg, ${palette.pink}, ${palette.blue})`,
    title: 'Pueblo cuentos',
    category: 'Culture',
  },
  {
    id: 20,
    aspect: '3 / 4',
    gradient: `linear-gradient(135deg, ${palette.orange}, ${palette.yellow})`,
    title: 'Driver license guide',
    category: 'Civics',
  },
]

export const DiscoveryPage = () => {
  const { language } = useAppContext()
  const isEs = language === 'es'

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-7">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/90">
              {isEs ? 'Próximamente' : 'Coming soon'}
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl">{isEs ? 'Descubre' : 'Discovery'}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {isEs
                ? 'Inspiración bilingüe de la comunidad: recetas, becas, eventos y guías compartidas por otros latinos.'
                : 'A bilingual feed of inspiration from the community — recipes, scholarships, events, and guides shared by other Latinos.'}
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {isEs ? 'Vista previa' : 'Placeholder'}
          </span>
        </div>

        <div className="mt-6">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              disabled
              placeholder={
                isEs ? 'Buscar ideas, eventos, recetas...' : 'Search ideas, events, recipes...'
              }
              className="h-11 w-full max-w-xl cursor-not-allowed rounded-xl border border-input bg-background px-10 text-sm text-muted-foreground outline-none"
            />
          </div>
        </div>
      </section>

      {/* Pinterest-style masonry feed */}
      <section className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 xl:columns-5">
        {pins.map(pin => (
          <article
            key={pin.id}
            className="mb-3 break-inside-avoid sm:mb-4 group relative cursor-pointer"
          >
            <div
              className="relative w-full overflow-hidden rounded-2xl border border-white/5 transition-transform duration-300 group-hover:scale-[1.015]"
              style={{
                aspectRatio: pin.aspect,
                background: pin.gradient,
              }}
            >
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex w-full items-end justify-between p-4">
                  <div className="max-w-[75%]">
                    <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                      {pin.category}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">{pin.title}</p>
                  </div>
                  <button
                    type="button"
                    className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110"
                    aria-label={isEs ? 'Guardar' : 'Save'}
                  >
                    <Bookmark className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
