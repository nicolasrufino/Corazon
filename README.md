# Corazón — Where to, Chicago?

All of Chicago's secrets, in one place. Next.js 16 (App Router) + Tailwind 4, deployed on Vercel.

```sh
npm install
npm run dev      # http://localhost:3000
npm test         # search + submission validation
npm run build
```

## Where things live

- `src/lib/data.ts` — lines, neighborhoods and secrets. **All current secrets are sample copy; replace with verified entries before launch.**
- `src/lib/search.ts`, `src/lib/validate.ts` — the only real logic, covered by `src/lib/lib.test.ts`.
- `src/app/submit/actions.ts` — server action that writes reader tips to Supabase `submissions`.
- `src/app/map/map-view.tsx` — MapLibre + free OpenFreeMap tiles (no key). Its web worker is copied into `public/` by `predev`/`prebuild`.
- `supabase/migrations/` — run in the Supabase SQL editor (project `vrgguurnbdtxzxtbjrvo`).

## Env vars (server-only)

See `.env.example`. Without them the site works; only the submit form shows "not connected yet".

## Deploy

Corazón lives on the Vercel account for nicolas.rufinopinto@gmail.com — the laptop's CLI is usually logged into another account, so `vercel login` first.
Hobby plan blocks deploys tied to the git author, so deploy a clean copy (see Obsidian → Accounts):

```sh
D=$(mktemp -d) && git archive HEAD | tar -x -C $D && cp -r .vercel $D/ 2>/dev/null
cd $D && vercel --prod --yes
```
