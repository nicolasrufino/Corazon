import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/config/env', () => ({
  config: { apiUrl: 'https://test-api.example.com' },
}))

import { sendChatMessage } from '@/lib/chatApi'
import type { ChatMessage } from '@/types/app'

describe('sendChatMessage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('response'),
      })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const makeFetch = () => globalThis.fetch as ReturnType<typeof vi.fn>

  it('sends correct payload shape', async () => {
    const history: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Hi', createdAt: '' },
      { id: '2', role: 'assistant', content: 'Hello', createdAt: '' },
    ]

    await sendChatMessage('Test', 'en', history)

    const body = JSON.parse(makeFetch().mock.calls[0][1].body)
    expect(body.message).toBe('Test')
    expect(body.language).toBe('en')
    expect(body.history).toEqual([
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello' },
    ])
  })

  it('slices history to last 10 messages', async () => {
    const history: ChatMessage[] = Array.from({ length: 15 }, (_, i) => ({
      id: String(i),
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `msg ${i}`,
      createdAt: '',
    }))

    await sendChatMessage('Hello', 'es', history)

    const body = JSON.parse(makeFetch().mock.calls[0][1].body)
    expect(body.history).toHaveLength(10)
    expect(body.history[0].content).toBe('msg 5')
  })

  it('omits profile when undefined', async () => {
    await sendChatMessage('Hello', 'en', [])
    const body = JSON.parse(makeFetch().mock.calls[0][1].body)
    expect(body.profile).toBeUndefined()
  })

  it('includes profile when provided', async () => {
    await sendChatMessage('Hello', 'en', [], { goals: ['legal'], occupation: 'student' })
    const body = JSON.parse(makeFetch().mock.calls[0][1].body)
    expect(body.profile).toEqual({ goals: ['legal'], occupation: 'student' })
  })

  it('throws on non-2xx response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'Internal Server Error' })
    )
    await expect(sendChatMessage('Hi', 'en', [])).rejects.toThrow('Chat API error: 500')
  })

  it('returns response text', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('AI says hello') })
    )
    const result = await sendChatMessage('Hi', 'en', [])
    expect(result).toBe('AI says hello')
  })
})
