# Corazón — Design System & Project Guidelines

## Brand Identity
- **Name**: Corazón (Hispanic at Heart)
- **Tone**: Warm, trustworthy, culturally aware, bilingual (ES/EN), privacy-first
- **Audience**: Latino communities in Chicago — immigrants, students, families

## Color Tokens

### Brand palette (use in app pages)
| Token | Hex | Usage |
|-------|-----|-------|
| `emerald` | `#0B4A31` | Deep green accents, trust |
| `teal` | `#8BC9C0` | Secondary, calm |
| `terracotta` | `#C85A3A` | Warm highlights |
| `offwhite` | `#FAF8F4` | Light backgrounds |
| `dark` | `#1A1A1A` | Text on light |

### Landing page palette (use in landing + onboarding)
| Token | Hex | Usage |
|-------|-----|-------|
| `coral` | `#F94E4F` | CTA buttons, primary action |
| `sapphire` | `#334AB5` | Links, info accents |
| `amber` | `#FF6C00` | Warm highlights |
| `pearl` | `#F7F2E8` | Text on dark backgrounds |
| `jade` | `#808F3D` | Success, verified |
| `aquamarine` | `#70B0A6` | Secondary accent |
| `citrine` | `#FFAB0D` | Warning, attention |
| `sand` | `#DBC7A6` | Muted text on dark |
| `onyx` | `#032412` | Deep background |

### CSS custom properties (semantic)
| Var | Value | Usage |
|-----|-------|-------|
| `--background` | `#07090E` | Page background |
| `--foreground` | `#F7F2E8` | Primary text |
| `--card` | `#0F131A` | Card backgrounds |
| `--primary` | `#FF4560` | Primary actions, active states |
| `--secondary` | `#70B0A6` | Secondary elements |
| `--muted` | `#1A1F28` | Muted backgrounds |
| `--muted-foreground` | `#C8C4B5` | Muted text |
| `--accent` | `#FF8A1F` | Accent highlights |
| `--cta` | `#FF4560` | Call-to-action buttons |
| `--border` | `#262B36` | Borders |
| `--input` | `#1A1F28` | Input backgrounds |

## Typography
| Var | Font | Usage |
|-----|------|-------|
| `--font-sans` / `--font-body` / `--font-brand` | Belgrano, serif | Body text, brand name |
| `--font-display` | Playfair Display, serif | Landing page headings |

## Component Patterns
- **Inputs**: `h-11 rounded-xl border border-input bg-background px-3 text-sm`
- **Buttons (primary)**: `h-11 rounded-xl bg-[var(--cta)] text-background`
- **Buttons (outline)**: `h-11 rounded-xl border border-border`
- **Toggle buttons**: `h-11 rounded-xl border px-4 cursor-pointer` — active: `border-primary bg-primary text-primary-foreground`
- **Cards**: `rounded-2xl border border-border/60 bg-card/80 p-5`
- **Privacy callouts**: `rounded-xl border border-aquamarine/30 bg-aquamarine/5 p-4`

## Bilingual Pattern
All user-facing text must have ES and EN variants:
```tsx
{language === 'es' ? 'Texto en español' : 'English text'}
```

## Privacy Principles
- Immigration status data is NEVER shared, sold, or visible to other users
- All onboarding fields are optional
- Bold privacy statements wherever sensitive data is collected
- User controls what they share

## File Structure
- Pages: `src/pages/` — one file per route
- Components: `src/components/` — shared UI
- Landing: `src/components/landing/` — landing page specific
- State: `src/context/AppContext.tsx` — global state via React Context
- Data: Supabase (`src/lib/supabase.ts` + `src/lib/supabaseApi.ts`)
- Types: `src/types/app.ts`
- Config: `src/config/env.ts` — single source for env vars
