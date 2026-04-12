# Testing — handoff for the test author

This branch (`feat/code-review-and-tests`) sets up the test infrastructure
for the voice assistant + AI backend integration that landed in PR #4.
Diego stopped to focus on algorithm work, so a teammate is picking up
test authoring.

**Read the [Code Review](./CODE_REVIEW.md) first** — it documents 17
issues found in PR #4, what's already fixed in this branch, and what's
deferred. Tests should at minimum cover the surfaces that the review
flagged as risky.

---

## What's already set up

### Frontend (Vitest)

`package.json` was updated with these dev dependencies via
`npm install -D`:

```
vitest
@vitest/ui
jsdom
@testing-library/react
@testing-library/jest-dom
@types/node
```

**You still need to:**

1. Add a `vitest.config.ts` in the project root:
   ```ts
   /// <reference types="vitest" />
   import { defineConfig } from 'vitest/config'
   import react from '@vitejs/plugin-react'
   import path from 'node:path'

   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'jsdom',
       globals: true,
       setupFiles: ['./src/test/setup.ts'],
     },
     resolve: {
       alias: { '@': path.resolve(__dirname, './src') },
     },
   })
   ```
2. Add a setup file `src/test/setup.ts`:
   ```ts
   import '@testing-library/jest-dom/vitest'
   ```
3. Add scripts to `package.json`:
   ```json
   "test": "vitest run",
   "test:watch": "vitest",
   "test:ui": "vitest --ui"
   ```
4. Verify with `npm test` — should run zero tests cleanly.

### Backend (pytest)

**You still need to:**

1. Add to `backend/requirements.txt` (or a separate `requirements-dev.txt`):
   ```
   pytest>=8.0
   pytest-asyncio
   httpx
   ```
2. Create `backend/tests/__init__.py` (empty)
3. Create `backend/tests/conftest.py`:
   ```python
   import os
   import pytest

   @pytest.fixture(autouse=True)
   def fake_env(monkeypatch):
       """Stub the env vars so module-level imports don't crash."""
       monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
       monkeypatch.setenv("SUPABASE_SERVICE_KEY", "fake-service-key")
       monkeypatch.setenv("GROQ_API_KEY", "fake-groq-key")
       monkeypatch.setenv("ELEVENLABS_API_KEY", "fake-eleven-key")
   ```
4. Add a `pytest.ini` (or `pyproject.toml [tool.pytest.ini_options]`) at
   the backend root:
   ```ini
   [pytest]
   pythonpath = .
   asyncio_mode = auto
   ```
5. Run `cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && pytest tests/`

---

## Files to test (priority order)

### 🔴 P0 — must have before merging this branch

1. **`src/lib/chatApi.ts`** — `sendChatMessage()`
   - **Payload shape**: history is sliced to last 10 messages, each entry has `{role, content}` only
   - **Profile passthrough**: when profile is `undefined`, payload omits the field
   - **Error path**: non-2xx response throws an `Error` with the status code in the message
   - **Timeout**: `AbortController` fires after 30 seconds (mock fetch with `setTimeout`)
   - Mock `fetch` with `vi.spyOn(global, 'fetch')`

2. **`src/lib/elevenlabs.ts`** — `speak()` and `stopSpeaking()`
   - **No-op on empty text**: `speak('')` and `speak('   ')` make zero fetch calls
   - **No-op on 503**: when fetch returns 503, no audio is created
   - **Race-condition fix (the C2 fix from CODE_REVIEW.md)**: rapid `speak('a')` then
     `speak('b')` → only the second clip plays. The first response is discarded.
     Use `vi.useFakeTimers()` and resolve fetches in a controlled order.
   - **Cleanup on stop**: `stopSpeaking()` after a successful play() revokes the
     blob URL and clears `currentAudio`
   - Mock `fetch`, mock `URL.createObjectURL` / `URL.revokeObjectURL`, mock
     `HTMLAudioElement.prototype.play`

3. **`backend/ai/algorithms.py`** — pure functions, easy to test
   - `build_simple_archetype('undocumented', 'es', 'unemployed')` →
     `nav_hours_yr == 152.0` (60 base × 2.4 status mult + 8 lang penalty)
   - `calculate_time_saved` with `['legal', 'food_bank']` → check the breakdown
     and total
   - `_compute_weights` → with no interactions, returns 9 categories at 1.0,
     normalized sum = 9.0
   - `build_complex_archetype` → `dominant_categories` is the top 3 by weight
   - `get_top_resources` → score = sum of category weights + 1.5 lang bonus
     + 1.5 eligibility bonus
   - `estimate_impact` → returns ML prediction when `_nav_model is not None`,
     fallback dict when it's None (force this by monkeypatching `alg._nav_model = None`)

4. **`backend/routers/ai.py`** — route registration + handler smoke tests
   - All 8 routes register: `/chat`, `/recommend`, `/impact`, `/time-saved`,
     `/discovery/recommend`, `/discovery/isolation`, `/tts`, `/health`
   - `/health` returns `{"status":"ok",...}`
   - `/tts` rejects an invalid `voice_id` (e.g. `"../etc/passwd"`) with 400
   - `/tts` returns 503 when `ELEVENLABS_API_KEY` env is unset (delete the env
     var inside the test)
   - Use `fastapi.testclient.TestClient` and stub `ai.chatbot.chat` /
     `algorithms.get_top_resources` to avoid hitting Groq + Supabase.

### 🟠 P1 — should have

5. **`src/components/VoiceAssistant.tsx`** — React Testing Library smoke test
   - Renders without crashing
   - Clicking the FAB opens the dialog
   - Typing in the input + Enter calls `sendChatMessage` (mocked)
   - Closing the dialog calls `stopSpeaking()` AND stops the recognizer
     (mock the speech recognition)
   - The mic button shows the pulsing red ring when `isListening === true`

6. **`backend/ai/discovery_algorithms.py`**
   - `get_age_bucket(20)` → `'youth'`
   - `build_discovery_archetype` → `dominant_tags` populated correctly
   - `calculate_isolation_impact` for an undocumented Spanish-speaker →
     check that the multipliers stack

### 🟢 P2 — nice to have

7. **`src/components/landing/i18n.tsx`** — `LangProvider` syncs to AppContext
8. **`backend/ai/chatbot.py`** — `format_history()` filters out invalid entries
9. **End-to-end smoke**: stand up FastAPI in-process via `TestClient`, call
   `/api/ai/chat` with a stubbed `ai_chat` and assert the response shape

---

## What is explicitly NOT tested in this branch

These are deferred to a follow-up — see Code Review §C3 and §M1:

- **TTS auth/rate-limit** — `/api/ai/tts` has no Supabase JWT verification or
  per-IP throttling. The fix needs a `verify_supabase_jwt` helper module that
  warrants its own review. Tests for that should go in the same follow-up
  branch.
- **`chatbot.py` lazy client init** — currently instantiates at module-import
  time with `os.getenv("GROQ_API_KEY")`. Tests should monkey-patch `_CLIENT`
  rather than the env var.

---

## Commands cheat sheet

```bash
# Frontend
npm test                    # run all vitest tests once
npm run test:watch          # watch mode
npm run test:ui             # browser UI

# Backend
cd backend
source .venv/bin/activate
pytest tests/               # run all pytest tests
pytest tests/test_algorithms.py::test_build_simple_archetype  # one test
pytest -x                   # stop on first failure
pytest --cov=ai --cov=routers tests/  # with coverage (needs pytest-cov)

# Always before pushing
npm run lint
npm run build
cd backend && pytest
```

---

## Claude prompt for the test author

Paste this into Claude Code from the project root to bootstrap:

```
Read CODE_REVIEW.md and TESTING.md in order. Then:

1. Switch to feat/code-review-and-tests (already exists locally).
2. Create vitest.config.ts and src/test/setup.ts per the TESTING.md "What's
   already set up" section.
3. Add the test scripts to package.json.
4. Set up backend/tests/ with conftest.py and pytest.ini per TESTING.md.
5. Write the P0 tests in this order:
   a. backend/tests/test_algorithms.py — pure functions, no mocks needed
   b. backend/tests/test_ai_router.py — TestClient + stubs for chatbot/groq/supabase
   c. src/lib/chatApi.test.ts — fetch mocked, payload shape + error path + timeout
   d. src/lib/elevenlabs.test.ts — fetch mocked, race condition test (the C2 fix)
6. Run npm run lint && npm run build && cd backend && pytest after each test
   file lands. Fix any failures before moving on.
7. After all P0 tests pass, do P1.
8. Don't touch main, don't push to main, work only on feat/code-review-and-tests.
9. Ask before making any decision not covered in CODE_REVIEW.md or TESTING.md.

Goal: 100% of P0 tests passing, npm run lint clean, npm run build clean,
pytest clean, then commit + push the branch and open a PR.
```

---

## Status of this handoff

| Item | Status |
|---|---|
| Vitest deps installed in package.json | ✅ |
| `vitest.config.ts` | ❌ — teammate creates |
| `src/test/setup.ts` | ❌ — teammate creates |
| Frontend test scripts in package.json | ❌ — teammate adds |
| Backend `pytest` deps in requirements.txt | ❌ — teammate adds |
| `backend/tests/` folder + `conftest.py` | ❌ — teammate creates |
| `backend/pytest.ini` | ❌ — teammate creates |
| Any actual test files | ❌ — teammate writes |
| Code Review fixes (C1, C2, H1, H2, H3, H4, M2, M3, M5) | ✅ — already in this branch |
| Algorithm work pulled in (training pipeline + time_model.pkl) | ✅ — already in this branch |
