# Branch: feat/eddie-ai-voice-deploy

**Assignee:** Eddie
**Branch name:** `feat/eddie-ai-voice-deploy`
**What:** Wire VoiceAssistant to real backend, add ElevenLabs TTS, integrate Corazon_AI models, set up DigitalOcean deploy
**Time estimate:** ~2-3 hours total across all tasks

---

## Claude Code prompt

Paste this into Claude Code to get started:

```
Read the files instructions/global-rules.md and instructions/branches/feat-eddie-ai-voice-deploy.md in order. Follow every step exactly. I also have a Corazon_AI folder on the edug-0/ai-layer branch with ML models and algorithms — check that branch for context on my models. Ask me before making any decision not covered in these instructions. After each major step, run npm run lint && npm run build to verify nothing is broken.
```

---

## Context: What exists right now

### Backend (Railway — LIVE at corazon-production-bd07.up.railway.app)
- `backend/routers/ai.py` has 3 endpoints using Groq llama3-8b-8192:
  - `POST /api/ai/chat` — streaming chat with bilingual prompts, conversation history
  - `POST /api/ai/recommend` — returns top 3 resource categories from user profile
  - `GET /api/ai/health` — health check
- Backend env vars on Railway: `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `FRONTEND_URL`

### VoiceAssistant.tsx (frontend — BROKEN)
- Currently imports `sendVoiceChatMessage` from `src/lib/mockApi.ts`
- This returns FAKE hardcoded responses — not connected to the backend at all
- Has Web Speech API mic button but speech-to-text is NOT wired up yet
- No ElevenLabs TTS

### Eddie's AI models (on edug-0/ai-layer branch)
- `Corazon_AI/algorithms.py` — personalization + time-based recommendation algorithms
- `Corazon_AI/chatbot.py` — chatbot with Supabase resource search
- `Corazon_AI/train_models.py` — ML model training
- `Corazon_AI/models/` — pre-trained .pkl models
- `Corazon_AI/api.py` — FastAPI endpoints for the AI layer
- `Corazon_AI/database.py` — Supabase connection for resource queries

### Design system
- Read `CLAUDE.md` at root for colors, fonts, component patterns
- All text must be bilingual (ES/EN)
- Use Corazon logo colors for accents

---

## TRACK 1: Wire VoiceAssistant to real backend (45 min)

### 1a. Create the real chat API client

Create `src/lib/chatApi.ts`:
```ts
import { config } from '@/config/env'
import type { AppLanguage, ChatMessage } from '@/types/app'

interface ChatPayload {
  message: string
  history: Array<{ role: string; content: string }>
  language: string
  profile?: {
    goals?: string[]
    occupation?: string
  }
}

export async function sendChatMessage(
  input: string,
  language: AppLanguage,
  history: ChatMessage[],
  profile?: { goals?: string[]; occupation?: string }
): Promise<string> {
  const payload: ChatPayload = {
    message: input,
    history: history.slice(-10).map(m => ({ role: m.role, content: m.content })),
    language,
    profile,
  }

  const res = await fetch(`${config.apiUrl}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Chat API error: ${res.status}`)
  }

  // The endpoint streams text — read the full response
  const text = await res.text()
  return text
}
```

### 1b. Update VoiceAssistant.tsx

Replace the mock import and wire to real backend:

1. Replace `import { sendVoiceChatMessage } from '@/lib/mockApi'` with `import { sendChatMessage } from '@/lib/chatApi'`
2. In `sendMessage()`, replace:
   ```ts
   const response = await sendVoiceChatMessage(trimmed, language)
   addChatMessage(response)
   ```
   with:
   ```ts
   const responseText = await sendChatMessage(
     trimmed,
     language,
     chatHistory,
     user?.profile ? { goals: user.profile.goals, occupation: user.profile.occupations?.[0] } : undefined
   )
   const assistantMessage: ChatMessage = {
     id: `assistant-${Date.now()}`,
     role: 'assistant',
     content: responseText,
     createdAt: new Date().toISOString(),
   }
   addChatMessage(assistantMessage)
   ```
3. Add error handling — if the API call fails, show an error message in the chat

### 1c. Add Web Speech API (speech-to-text)

The mic button exists but doesn't do speech recognition. Add it:

1. Add state: `const [isListening, setIsListening] = useState(false)`
2. Create a `startListening()` function:
   ```ts
   const startListening = () => {
     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
     if (!SpeechRecognition) return

     const recognition = new SpeechRecognition()
     recognition.lang = language === 'es' ? 'es-MX' : 'en-US'
     recognition.interimResults = false

     recognition.onresult = (event) => {
       const transcript = event.results[0][0].transcript
       setMessage(transcript)
     }

     recognition.onend = () => setIsListening(false)
     recognition.onerror = () => setIsListening(false)

     setIsListening(true)
     recognition.start()
   }
   ```
3. Wire the mic button to toggle `startListening()`
4. Show a pulsing animation when listening (red ring around mic button)
5. Add TypeScript declarations if needed:
   ```ts
   // Add to src/types/speech.d.ts
   interface Window {
     SpeechRecognition: typeof SpeechRecognition
     webkitSpeechRecognition: typeof SpeechRecognition
   }
   ```

### 1d. Test
- Open the voice assistant
- Type a message → should get a real response from Groq via the backend
- Click mic → speak → transcript appears in input → send → real response
- Verify bilingual: switch to ES, ask in Spanish, get Spanish response

---

## TRACK 2: Add ElevenLabs TTS (30 min)

### 2a. Get the API key
Go to elevenlabs.io → sign up (free: 10,000 chars/month) → API Keys → create key.
Save it in `keys/keys.md` under a new section.

### 2b. Add env vars

Add to `.env.local`:
```
VITE_ELEVENLABS_API_KEY=your_key_here
```

Add to `.env.example`:
```
VITE_ELEVENLABS_API_KEY=
```

Add to `src/config/env.ts`:
```ts
elevenlabsApiKey: import.meta.env.VITE_ELEVENLABS_API_KEY as string,
```

### 2c. Create the TTS utility

Create `src/lib/elevenlabs.ts`:
```ts
import { config } from '@/config/env'

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // Rachel — warm, clear, natural

export async function speak(text: string): Promise<void> {
  if (!config.elevenlabsApiKey) return

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': config.elevenlabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  )

  if (!res.ok) return

  const blob = await res.blob()
  const audio = new Audio(URL.createObjectURL(blob))
  await audio.play()
}

export function stopSpeaking(): void {
  // Stop any currently playing audio
  document.querySelectorAll('audio').forEach(a => {
    a.pause()
    a.remove()
  })
}
```

### 2d. Wire into VoiceAssistant.tsx

1. Import: `import { speak } from '@/lib/elevenlabs'`
2. Add state: `const [ttsEnabled, setTtsEnabled] = useState(true)`
3. After adding the assistant message to chat, call:
   ```ts
   if (ttsEnabled) {
     speak(responseText)
   }
   ```
4. Add a speaker icon button (Volume2 / VolumeX from lucide-react) next to the close button that toggles `ttsEnabled`
5. Style: when TTS is on, icon is white. When off, icon is muted with a line through it.

### 2e. Add to Vercel env vars
Add `VITE_ELEVENLABS_API_KEY` in Vercel dashboard → Settings → Environment Variables

---

## TRACK 3: Integrate Corazon_AI models (1 hr)

This is where Eddie brings in his own algorithms from the `edug-0/ai-layer` branch.

### 3a. Decide with your Claude instance

Your `Corazon_AI/` folder has:
- `algorithms.py` — personalization + time-based recommendation
- `chatbot.py` — chatbot with Supabase resource search
- `train_models.py` + pre-trained `.pkl` models
- `api.py` — FastAPI endpoints

**Talk to your Claude about:**
1. Which algorithms should be integrated into `backend/routers/ai.py`?
2. Should `Corazon_AI/chatbot.py` replace the current Groq chatbot, or augment it?
3. Can the .pkl models be loaded in the Railway/DigitalOcean backend?
4. What endpoints from `Corazon_AI/api.py` should be merged into the main backend?

### 3b. Integration approach

The recommended approach:
1. Copy relevant functions from `Corazon_AI/algorithms.py` into `backend/routers/ai.py` or a new `backend/routers/recommend.py`
2. If using .pkl models: copy them to `backend/models/` and load them at startup
3. Add any new dependencies to `backend/requirements.txt`
4. The chatbot should use Groq for generation BUT use Eddie's algorithms for resource ranking/personalization
5. Update the `POST /api/ai/recommend` endpoint to use the real ML model instead of just asking Groq

### 3c. Test the integration
- Hit `POST /api/ai/recommend` with a user profile → should return personalized results
- Hit `POST /api/ai/chat` → should use resource context from the algorithms
- Check Railway/DigitalOcean deploy logs for import errors

---

## TRACK 4: DigitalOcean deploy (30 min)

### 4a. Why DigitalOcean
- $200 free credits for new accounts
- DigitalOcean prize at hackathon (retro wireless mouse)
- Can run alongside Railway as backup, or replace it

### 4b. Setup steps

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

### 4c. Update frontend to use DigitalOcean

In Vercel env vars, update:
```
VITE_API_URL=https://corazon-xxxxx.ondigitalocean.app
```

Redeploy Vercel. The frontend now talks to DigitalOcean instead of Railway.

### 4d. Keep Railway as backup
Don't delete Railway — if DigitalOcean has issues, you can switch `VITE_API_URL` back to `corazon-production-bd07.up.railway.app` in Vercel.

---

## TRACK 5: Pitch deck (30 min)

### 5a. Create in Canva — 5 slides

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
- ML recommendation models (Eddie's algorithms)
- Python scrapers (1300+ real Chicago resources)

**Slide 5 — The Team**
- Eddie — AI/ML lead
- Nicolas — Frontend + full-stack
- Diego — Backend + data
- "Built with love for our community. De latinos para latinos."

### 5b. Demo script (2 min)
1. Show landing page → "Join" → sign up → onboarding (country, language)
2. Dashboard → search for "legal aid" → show resource cards
3. Voice assistant → ask "Where can I get legal help?" → AI responds with voice
4. Document analyzer → upload a sample letter → show explanation
5. Discovery feed → create a post → like someone else's post

---

## Final checklist before submitting

1. `npm run lint` — 0 errors
2. `npm run build` — passes
3. Vercel live URL works end to end
4. Backend health check returns `{"status": "ok"}`
5. Voice assistant gets real AI responses
6. TTS speaks the response out loud
7. All env vars set in Vercel + Railway/DigitalOcean
8. Pitch deck in Canva, exported as PDF backup
9. Demo rehearsed at least once

---

## Environment variables Eddie needs

### Vercel (frontend)
```
VITE_SUPABASE_URL=https://vrgguurnbdtxzxtbjrvo.supabase.co
VITE_SUPABASE_ANON_KEY=(in keys/keys.md)
VITE_API_URL=https://corazon-production-bd07.up.railway.app (or DigitalOcean URL)
VITE_ELEVENLABS_API_KEY=(from elevenlabs.io)
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

Work on branch `feat/eddie-ai-voice-deploy`. After each track:

```bash
git add <specific files>
git commit -m "feat: description of what was done"
git push origin feat/eddie-ai-voice-deploy
```

When all tracks are done, create a PR to main. In the PR description list:
- VoiceAssistant wired to real backend
- ElevenLabs TTS added
- Web Speech API speech-to-text added
- Corazon_AI models integrated (describe which ones)
- DigitalOcean deploy (if done)
