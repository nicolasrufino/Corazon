# Code Review — feat/eddie-ai-voice-deploy (PR #4)

Reviewing the files merged via PR #4: voice assistant wiring, secure
ElevenLabs TTS proxy, and Eddie's Corazon_AI integration.

Findings are grouped by severity. Each item links to the file/line and
suggests a fix. Items marked **🔧 fixed in this branch** are addressed by
the accompanying fix commit.

---

## 🔴 CRITICAL — must fix

### C1. `chat` endpoint blocks the FastAPI event loop
**File:** `backend/routers/ai.py:131-149`
**File:** `backend/ai/chatbot.py:215-236`

`chatbot.chat()` is a synchronous function that calls Groq via the OpenAI
client (also synchronous). It is being called inside an `async def chat()`
route handler, which **blocks the entire backend event loop** for the
duration of the Groq call (typically 1-3 seconds, sometimes 10+).

While one user is mid-chat, no other user can use ANY endpoint —
`/api/ai/health`, `/api/ai/recommend`, the resource scraper proxy, the
posts feed... everything is stuck waiting for Groq.

**Fix:** wrap `ai_chat(...)` in `asyncio.to_thread(...)` so it runs in
the threadpool and the event loop stays free.

```python
import asyncio
response_text = await asyncio.to_thread(
    ai_chat,
    message=req.message,
    history=history,
    simple_archetype=archetype,
    auto_fetch=True,
)
```

🔧 **fixed in this branch.**

### C2. TTS race condition — concurrent `speak()` calls play multiple clips
**File:** `src/lib/elevenlabs.ts:14-50`

Flow inside `speak()`:
1. `stopSpeaking()` clears `currentAudio`/`currentObjectUrl`
2. `await fetch(...)` — long async pause (1-3 sec)
3. `currentAudio = audio` — set new state

If the user rapid-fires two messages (say the chat is fast and TTS hasn't
finished), the second `speak()` runs `stopSpeaking()` while
`currentAudio` is still `null` (the first fetch hasn't returned). Both
fetches proceed, both audio elements are created, and depending on which
fetch resolves first, either:
- Both clips play simultaneously (cacophony)
- An object URL leaks (never revoked)
- The "current" audio handle points at a stale element

**Fix:** track an in-flight token. Each `speak()` call captures a local
token; when its fetch resolves, it checks the global token still matches
before installing the new audio. Older inflight calls are abandoned and
their blob URLs revoked.

🔧 **fixed in this branch.**

### C3. `/api/ai/tts` has no auth and no rate limiting
**File:** `backend/routers/ai.py:267-322`

Anyone with the URL can hit `/api/ai/tts` and burn the ElevenLabs free
quota. There's no Supabase JWT check, no rate limit, no IP throttling.

A drive-by attacker scraping the frontend bundle would find
`${apiUrl}/api/ai/tts` and could write a script that POSTs every second
until the monthly quota is gone.

**Fix options (pick one):**
- **Quick:** add a simple per-IP rate limiter (e.g. `slowapi` middleware,
  10 requests/min)
- **Better:** require a Supabase JWT in the `Authorization` header,
  validate via the `supabase` Python client (already a dep), reject
  anonymous traffic
- **Both:** rate-limit + JWT for defense in depth

🟡 **Documented but not fixed in this branch** — the cleanest fix is JWT
validation, which requires a small `verify_supabase_jwt` helper. Flagged
for follow-up.

---

## 🟠 HIGH — should fix

### H1. Backend exception handlers leak internal details to the client
**File:** `backend/routers/ai.py:131, 158, 178, 197, 219, 245`

Every endpoint does:
```python
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
```

`str(e)` can leak:
- Internal file paths (`File "/app/backend/ai/chatbot.py"`)
- Library tracebacks
- Sometimes API response bodies that included secrets

**Fix:** log the full exception server-side, return a generic detail to
the client.

```python
except Exception:
    logger.exception("ai.chat failed")
    raise HTTPException(status_code=500, detail="Internal error")
```

🔧 **fixed in this branch.**

### H2. `chatApi.ts` has no fetch timeout
**File:** `src/lib/chatApi.ts:30-50`

If the backend hangs (Groq takes 60+ seconds, Railway is migrating, etc.),
the user's voice assistant spinner spins forever. There is no
`AbortController` and no timeout.

**Fix:** wrap the fetch in a 30-second `AbortController` timeout.

🔧 **fixed in this branch.**

### H3. STT not stopped when the dialog closes
**File:** `src/components/VoiceAssistant.tsx:42-50`

```ts
useEffect(() => {
  if (!isOpen) {
    stopSpeaking()  // ← only TTS gets cleaned up
  }
}, [isOpen])
```

If the user clicks the mic, starts speaking, then closes the dialog
mid-sentence, the `SpeechRecognition` instance keeps listening in the
background. It will eventually timeout but in the meantime the browser's
mic permission dot stays on, which is creepy.

**Fix:** also call `stopListening()` in the cleanup.

🔧 **fixed in this branch.**

### H4. `chatApi.ts` accepts an empty `apiUrl` silently
**File:** `src/lib/chatApi.ts:38`

If `VITE_API_URL` isn't set, `config.apiUrl` is `undefined`. The fetch
URL becomes `"undefined/api/ai/chat"` which is a relative URL that hits
Vercel itself with a 404. The user sees "Couldn't reach the assistant"
but the real cause (missing env var) is buried in console.

**Fix:** assert at module load that `config.apiUrl` is set; throw a
helpful error if it isn't.

🔧 **fixed in this branch.**

---

## 🟡 MEDIUM — nice to fix

### M1. `_CLIENT` in `chatbot.py` initialized at import time with bare env var
**File:** `backend/ai/chatbot.py:14-17`

```python
_CLIENT = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)
```

`os.getenv` returns `None` if the var is missing. The `OpenAI` client
accepts that and stores `None`, then fails on the first request with a
confusing "missing API key" deep in the SDK. A startup-time check would
fail fast with a clear message.

**Fix:** lazy-init the client inside `chat()` and raise on missing key.
Defer to follow-up.

### M2. `/api/ai/tts` voice_id is passed straight to the URL
**File:** `backend/routers/ai.py:288, 297`

```python
voice_id = req.voice_id or _DEFAULT_VOICE_ID
...
f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
```

A malicious caller could pass `voice_id="../../../some-other-endpoint"`
and trick the backend into POSTing to a different ElevenLabs URL. This
is mitigated by the `xi-api-key` only being valid for ElevenLabs, but
still — should validate against an allowlist or regex.

**Fix:** `re.match(r"^[A-Za-z0-9_-]{10,40}$", voice_id)`.

🔧 **fixed in this branch.**

### M3. `chatApi.ts` types are too loose
**File:** `src/lib/chatApi.ts:5-12`

`role: string` should be `'user' | 'assistant'`. The duplicated profile
shape between the parameter and the payload should be a single
exported type.

🔧 **fixed in this branch.**

### M4. `recognition.lang` only set on initial start
**File:** `src/components/VoiceAssistant.tsx:121`

If the user toggles the app language while STT is mid-listening, the
recognition keeps the old `lang` until the next `startListening()`.
Edge case but worth a comment.

**Decision:** leave as-is. Documented inline.

### M5. No `maxLength` on the chat input
**File:** `src/components/VoiceAssistant.tsx:269`

Backend accepts arbitrary message length. Frontend should cap (e.g.
1000 chars) to prevent accidental megabyte messages.

🔧 **fixed in this branch.**

---

## 🟢 LOW — observations

### L1. `_compute_weights` magic numbers
**File:** `backend/ai/algorithms.py:225-247`

`+0.3` increment, cap at `3.0`, normalize to `9.0`. Hardcoded magic
numbers that should at minimum be named constants. Acceptable for the
demo.

### L2. `chatbot.chat()` returns error string inline
**File:** `backend/ai/chatbot.py:235-236`

```python
except Exception as e:
    return f"[Corazón encountered an error: {e}]"
```

This error message gets displayed to the user as a chat bubble. Should
raise instead so the route handler can convert to a proper HTTP error.

**Decision:** leave for now (would change the contract). Documented.

### L3. `/api/ai/recommend` calls `get_all_resources()` every time
**File:** `backend/routers/ai.py:163`

Full table scan + sort in Python on every call. Should cache or
paginate. Not a hot path right now.

### L4. `personalization_model.pkl` committed but never loaded
**File:** `backend/ai/algorithms.py`

Only `time_model.pkl` gets loaded. The personalization model is on
disk but no code references it. Could be a future feature, or dead
weight (~880KB).

**Decision:** leave; it's small and Eddie may use it in a follow-up.

### L5. CORS allows `https://*.vercel.app`
**File:** `backend/main.py:11-15`

Wildcards on Vercel URLs is fine for dev/staging but in prod you may
want to lock down to your specific Vercel project.

**Decision:** leave for hackathon. Flag for prod hardening.

---

## Summary

| Severity | Count | Fixed in this branch |
|---|---|---|
| 🔴 CRITICAL | 3 | 2 (C1, C2) |
| 🟠 HIGH | 4 | 4 (H1, H2, H3, H4) |
| 🟡 MEDIUM | 5 | 3 (M2, M3, M5) |
| 🟢 LOW | 5 | 0 |
| **TOTAL** | **17** | **9** |

The two unfixed CRITICAL/HIGH items (C3 TTS auth, M1 lazy client) are
flagged for a follow-up branch because they need a small but distinct
helper module (Supabase JWT verification) that warrants its own review.

Tests added in this branch cover the algorithms layer (`build_simple_archetype`,
`calculate_time_saved`, `estimate_impact` fallback, `get_top_resources`)
and the frontend `chatApi.ts` payload shape + error handling, since
those are the surfaces most likely to break silently.
