import { config } from '@/config/env'
import type { AppLanguage, ChatMessage } from '@/types/app'

/**
 * Real chat API client. Hits POST /api/ai/chat on the backend (Railway by
 * default — see VITE_API_URL). The endpoint streams plain text from Groq;
 * we await the full body and return it as a single string. Caller wraps
 * the string into a ChatMessage.
 *
 * Aborts after CHAT_TIMEOUT_MS so a hung backend can't freeze the UI.
 */

export interface ChatProfile {
  goals?: string[]
  occupation?: string
  immigration_status?: string
}

interface ChatPayload {
  message: string
  history: Array<{ role: 'user' | 'assistant'; content: string }>
  language: string
  profile?: ChatProfile
}

const CHAT_TIMEOUT_MS = 30_000
const MAX_HISTORY = 10

if (!config.apiUrl) {
  // Surfaces the misconfiguration loudly in the console at app boot
  // instead of silently posting to a relative URL that hits Vercel
  // itself with a 404.

  console.warn(
    '[chatApi] VITE_API_URL is not set. /api/ai/chat calls will fail. ' +
      'Set it in .env (e.g. https://corazon-production-bd07.up.railway.app).'
  )
}

export async function sendChatMessage(
  input: string,
  language: AppLanguage,
  history: ChatMessage[],
  profile?: ChatProfile
): Promise<string> {
  const payload: ChatPayload = {
    message: input,
    history: history.slice(-MAX_HISTORY).map(m => ({
      role: m.role,
      content: m.content,
    })),
    language,
    profile,
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS)

  try {
    const res = await fetch(`${config.apiUrl}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/plain',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`Chat API error: ${res.status} ${res.statusText}`)
    }

    return await res.text()
  } finally {
    clearTimeout(timeout)
  }
}
