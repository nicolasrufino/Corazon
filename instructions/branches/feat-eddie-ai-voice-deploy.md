# Branch: feat/eddie-ai-voice-deploy

**Assignee:** Eddie → handoff to teammate
**Branch name:** `feat/eddie-ai-voice-deploy`
**What:** Wire VoiceAssistant to real backend, add ElevenLabs TTS, integrate Corazon_AI models, set up DigitalOcean deploy
**Status:** Tracks 1–3 COMPLETE. Tracks 4–5 still needed.

---

## Claude Code prompt (for teammate continuing this branch)

```
Read the files instructions/global-rules.md and instructions/branches/feat-eddie-ai-voice-deploy.md in order. Tracks 1, 2, and 3 are already done — start from Track 4. Follow every step exactly. Ask me before making any decision not covered in these instructions. After each major step, run npm run lint && npm run build to verify nothing is broken.
```

---

## What was completed this session

### ✅ TRACK 1: VoiceAssistant wired to real backend

**Files changed:**
- `src/lib/chatApi.ts` ← NEW — calls `POST /api/ai/chat`, reads full streamed text response
- `src/components/VoiceAssistant.tsx` — replaced mock with real backend + STT + TTS toggle
- `src/types/speech.d.ts` ← NEW — TypeScript declarations for `SpeechRecognitionEvent` and `Window`

**What it does now:**
- Sends messages to `${config.apiUrl}/api/ai/chat` with full conversation history + user profile (goals, occupation)
- Shows bilingual error message in chat if API call fails
- Mic button now runs Web Speech API (`window.SpeechRecognition || window.webkitSpeechRecognition`)
  - Language-aware: `es-MX` or `en-US` based on current app language
  - Pulses red with `ring-2 ring-red-500 animate-pulse` while listening
  - Transcript populates the input field, user sends manually

### ✅ TRACK 2: ElevenLabs TTS

**Files changed:**
- `src/lib/elevenlabs.ts` ← NEW — Rachel voice (ID: `21m00Tcm4TlvDq8ikWAM`), no-ops gracefully if key missing
- `src/config/env.ts` — added `elevenlabsApiKey: import.meta.env.VITE_ELEVENLABS_API_KEY`
- `.env.example` — added `VITE_ELEVENLABS_API_KEY=`
- `VoiceAssistant.tsx` — Volume2/VolumeX toggle button next to close, calls `speak(responseText)` after each AI reply

**Still needs:**
- Add `VITE_ELEVENLABS_API_KEY` to your local `.env.local` (get key from elevenlabs.io)
- Add `VITE_ELEVENLABS_API_KEY` to Vercel → Settings → Environment Variables → redeploy

### ✅ TRACK 3: Corazon_AI algorithms integrated

**Files changed:**
- `backend/routers/recommend.py` ← NEW — full algorithmic scoring engine
- `backend/routers/ai.py` — removed Groq-based recommend endpoint + cleaned unused `json` import
- `backend/main.py` — registered `recommend.router` under `/api/ai`

**What the new recommend does:**
Ports Eddie's multiplier system from `edug-0/ai-layer:Corazon_AI/algorithms.py` into pure Python
(no `.pkl` models needed — Railway runs it as-is):
- Seeds scores from user's stated `goals` (ResourceCategory[])
- Applies `_STATUS_CATEGORY_BOOST`: undocumented 2.4× legal/immigration, DACA 1.8×, etc.
- Applies `_LANGUAGE_CATEGORY_BOOST`: `es` → +1.8× language_learning, +1.3× community
- Applies `_OCCUPATION_CATEGORY_BOOST`: job_seeker → +1.6× financial_aid, student → +1.6× education, etc.
- Returns top 3 categories with bilingual message
- Categories with zero stated-goal base can still surface if combined boost ≥ 2.0

**Note on .pkl ML models:** The trained scikit-learn models (`time_model.pkl`, `personalization_model.pkl`) live on `edug-0/ai-layer:Corazon_AI/models/`. They are NOT integrated here because they require joblib + scikit-learn + the model files co-located on the server. If the team wants to deploy those, the path is:
1. Copy `Corazon_AI/models/` → `backend/models/`
2. Add `joblib`, `scikit-learn`, `pandas`, `numpy` to `backend/requirements.txt`
3. Wrap `estimate_impact()` from `algorithms.py` into a new `/api/ai/impact` endpoint

---

## Current state of key files

### `src/components/VoiceAssistant.tsx`
- Imports: `sendChatMessage` from `chatApi`, `speak` from `elevenlabs`
- State: `isOpen`, `message`, `isResponding`, `isListening`, `ttsEnabled`
- `sendMessage()` → hits real backend, creates `assistantMessage`, calls `speak()` if TTS on
- `startListening()` → Web Speech API, populates input field
- Header buttons: TTS toggle (Volume2/VolumeX) + close (X)
- Input row: text input + mic button (red pulse when listening) + send button

### `backend/routers/ai.py`
- `POST /api/ai/chat` — Groq streaming, bilingual system prompt, last 10 messages of history
- `GET /api/ai/health` — health check
- `/recommend` removed (now owned by `recommend.py`)

### `backend/routers/recommend.py`
- `POST /api/ai/recommend` — algorithmic scoring, no LLM call, pure Python

---

## ⏳ TRACK 4: DigitalOcean deploy (still needed)

### Why
- $200 free credits for new accounts
- DigitalOcean prize at hackathon (retro wireless mouse)
- Can run alongside Railway as backup, or replace it

### Steps

1. Go to digitalocean.com → sign up → get $200 free credits
2. Go to App Platform → Create App → connect GitHub
3. Select the `nicolasrufino/Corazon` repo
4. Set source directory to `backend`
5. It should auto-detect the Dockerfile
6. Add environment variables:
   - `GROQ_API_KEY` — same as Railway
   - `SUPABASE_URL` — `https://vrgguurnbdtxzxtbjrvo.supabase.co`
   - `SUPABASE_SERVICE_KEY` — (get from keys/keys.md)
   - `FRONTEND_URL` — your Vercel URL
   - `PORT` — 8080 (DigitalOcean default)
7. Deploy → get the app URL (something like `corazon-xxxxx.ondigitalocean.app`)

### Update frontend to use DigitalOcean

In Vercel env vars, update:
```
VITE_API_URL=https://corazon-xxxxx.ondigitalocean.app
```

Redeploy Vercel. Keep Railway as backup — don't delete it.

---

## ⏳ TRACK 5: Pitch deck (still needed)

### Create in Canva — 5 slides

**Slide 1 — Title**
- "Corazon — Hispanic at Heart"
- Tagline: "AI-powered bilingual resources for Latino communities"
- WildHacks 2026

**Slide 2 — The Problem**
- 62M Hispanics in the US, many face language barriers
- Hard to find trusted resources (legal, health, immigration)
- Official documents are confusing, intimidating
- No single bilingual platform that understands their situation

**Slide 3 — What Corazon Does**
- Personalized resource dashboard (1300+ Chicago orgs)
- AI voice assistant (speaks back in natural voice)
- Document analyzer (upload → plain-language explanation)
- Community discover feed (anonymous posts, random usernames)
- Bilingual everything — Spanish/English toggle

**Slide 4 — Tech Stack**
- React + Vite + Tailwind (Vercel)
- FastAPI + Groq Llama 3 (Railway/DigitalOcean)
- Supabase (auth + database)
- ElevenLabs (text-to-speech)
- Web Speech API (speech-to-text)
- Eddie's algorithmic recommendation engine (status/language/occupation multipliers)
- Python scrapers (1300+ real Chicago resources)

**Slide 5 — The Team**
- Eddie — AI/ML lead
- Nicolas — Frontend + full-stack
- Diego — Backend + data
- "Built with love for our community. De latinos para latinos."

### Demo script (2 min)
1. Show landing page → "Join" → sign up → onboarding (country, language)
2. Dashboard → search for "legal aid" → show resource cards
3. Voice assistant → ask "Where can I get legal help?" → AI responds with voice
4. Document analyzer → upload a sample letter → show explanation
5. Discovery feed → create a post → like someone else's post

---

## Final checklist before submitting

- [ ] `npm run lint` — 0 errors
- [ ] `npm run build` — passes
- [ ] `VITE_ELEVENLABS_API_KEY` set in Vercel env vars + redeployed
- [ ] Vercel live URL works end to end
- [ ] Backend health check returns `{"status": "ok"}`
- [ ] Voice assistant gets real AI responses from Groq
- [ ] TTS speaks the response out loud (ElevenLabs Rachel voice)
- [ ] STT: mic button → speak → transcript fills input
- [ ] `/api/ai/recommend` returns categories driven by algorithms (not Groq)
- [ ] DigitalOcean deployed (Track 4)
- [ ] `VITE_API_URL` updated in Vercel to point to DigitalOcean
- [ ] Pitch deck in Canva, exported as PDF backup
- [ ] Demo rehearsed at least once

---

## Environment variables

### Vercel (frontend)
```
VITE_SUPABASE_URL=https://vrgguurnbdtxzxtbjrvo.supabase.co
VITE_SUPABASE_ANON_KEY=(in keys/keys.md)
VITE_API_URL=https://corazon-production-bd07.up.railway.app  ← update to DO when ready
VITE_ELEVENLABS_API_KEY=(from elevenlabs.io)  ← ADD THIS
```

### Railway/DigitalOcean (backend)
```
GROQ_API_KEY=(in keys/keys.md)
SUPABASE_URL=https://vrgguurnbdtxzxtbjrvo.supabase.co
SUPABASE_SERVICE_KEY=(in keys/keys.md)
FRONTEND_URL=(your Vercel URL)
```

---

## Push flow

```bash
git add <specific files>
git commit -m "feat: description"
git push origin feat/eddie-ai-voice-deploy
```

When all tracks are done, create a PR to main. PR description should list:
- ✅ VoiceAssistant wired to real Groq backend
- ✅ ElevenLabs TTS (Rachel voice, toggle button)
- ✅ Web Speech API speech-to-text (language-aware, pulsing mic)
- ✅ Algorithmic recommend endpoint (Eddie's status/language/occupation scoring)
- ⬜ DigitalOcean deploy
