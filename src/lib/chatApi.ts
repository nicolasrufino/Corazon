import { config } from '@/config/env'
import type { AppLanguage, ChatMessage } from '@/types/app'

/**
 * Real chat API client. Hits POST /api/ai/chat on the backend (Railway by
 * default — see VITE_API_URL). The endpoint streams plain text from Groq;
 * we await the full body and return it as a single string. Caller wraps
 * the string into a ChatMessage.
 */

interface ChatPayload {
  message: string
  history: Array<{ role: string; content: string }>
  language: string
  profile?: {
    goals?: string[]
    occupation?: string
    immigration_status?: string
  }
}

export async function sendChatMessage(
  input: string,
  language: AppLanguage,
  history: ChatMessage[],
  profile?: { goals?: string[]; occupation?: string; immigration_status?: string }
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
    throw new Error(`Chat API error: ${res.status} ${res.statusText}`)
  }

  // The endpoint streams text — fetch waits for the body to finish, then
  // we read the whole thing as one string.
  return await res.text()
}
