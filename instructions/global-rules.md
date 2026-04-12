# Global Rules — All Branches

Every teammate must follow these rules regardless of which branch they're working on.

## Before you start

1. `git checkout main && git pull origin main` — always start from latest main
2. Create your branch: `git checkout -b feat/<branch-name>`
3. `npm install` — make sure deps are up to date
4. Read `CLAUDE.md` at the root — it has the full design system (colors, fonts, component patterns)

## Code quality

- ESLint + Prettier run automatically on every commit via Husky pre-commit hook
- Before committing, run: `npm run lint && npm run format:check`
- If lint fails, run `npm run lint:fix` then `npm run format`
- NEVER use `--no-verify` to skip hooks
- Build must pass: `npm run build`

## Commit messages

Format: `type: short description`

Types: `feat`, `fix`, `chore`, `docs`, `refactor`

End every commit message with:
```
Co-Authored-By: Claude <noreply@anthropic.com>
```

## Design system — colors

### Corazon logo letter colors (use for accents/steps)
| Letter | Color |
|--------|-------|
| c | `#ff8100` (orange) |
| heart | `#dc2626` (red) |
| r | `#00aa63` (green) |
| a | `#1777d7` (blue) |
| z | `#ffd300` (yellow) |
| o | `#ffb5e2` (pink) |
| n | `#f82d1a` (red-orange) |

### CSS variables (defined in `src/index.css`)
- `--background: #07090E` — page background
- `--foreground: #F7F2E8` — primary text (pearl)
- `--card: #0F131A` — card backgrounds
- `--primary: #FF4560` — primary actions
- `--cta: #FF4560` — call-to-action buttons
- `--border: #262B36` — borders
- `--muted-foreground: #C8C4B5` — secondary text

### Fonts
- `--font-sans` / `--font-body` / `--font-brand`: Belgrano, serif
- `--font-display`: Playfair Display, serif

## Bilingual

All user-facing text must have ES and EN:
```tsx
{language === 'es' ? 'Texto en espanol' : 'English text'}
```

## Text on colored backgrounds

- When a button or card has a filled accent color: use **black** text (`color: '#000'`)
- When not selected / dark background: use white text (default)

## Environment

- Frontend env: `src/config/env.ts` — single source for all env vars
- Supabase client: `src/lib/supabase.ts`
- Never hardcode API keys or URLs
- `.env` files are gitignored — only `.env.example` files are committed

## Supabase

- Anon key for frontend (read-only via RLS)
- Service key for backend only (never expose in frontend)
- All schema changes: write SQL in `backend/supabase/` folder AND run in Supabase SQL Editor
- Always add RLS policies

## File structure

```
src/pages/          — one file per route
src/components/     — shared UI
src/lib/            — API layers, supabase client, utils
src/config/         — env.ts
src/context/        — AppContext (global state)
src/types/          — TypeScript types
backend/            — FastAPI (Python)
backend/supabase/   — SQL schema files
```

## Push flow

1. `npm run lint && npm run build` — must both pass
2. `git add <specific files>` — never `git add .`
3. `git commit -m "type: description"` — Husky runs lint-staged
4. `git push origin feat/<branch-name>`
5. Create a PR to main when done
