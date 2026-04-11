# Corazon — Brújula

A bilingual (Spanish/English) community platform for Hispanic immigrants. Provides a resource directory, AI-powered document analysis, a community forum, and an onboarding guide — all accessible in the user's preferred language.

## Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4
- **Backend**: FastAPI (Python), deployed on Railway
- **Database**: Supabase (auth + relational data), MongoDB Atlas (resources/documents)
- **AI**: OpenRouter API
- **Hosting**: Vercel (frontend), Railway (backend)

---

## Running locally

### Frontend

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Runs at `http://localhost:8000`

---

## Environment variables

Copy the example files and fill in your values:

```bash
cp .env.example .env.local            # frontend
cp backend/.env.example backend/.env  # backend
```

### Frontend (`.env.local`)

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_API_URL` | Backend URL (`http://localhost:8000` locally) |

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (server-side only) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI features |
| `FRONTEND_URL` | Frontend origin for CORS |

---

## Deploy

### Frontend — Vercel

1. Push to GitHub
2. Import the repo in Vercel
3. Set the environment variables from the Frontend table above in Vercel's project settings
4. Deploy — Vercel auto-detects Vite

### Backend — Railway

1. Create a new Railway project and connect this repo
2. Set root directory to `/backend`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add all backend environment variables in Railway's variable settings
5. Deploy — Railway runs the `Procfile` automatically
