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
