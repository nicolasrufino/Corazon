import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/config/env', () => ({
  config: { apiUrl: 'https://test-api.example.com' },
}))

describe('elevenlabs TTS', () => {
  const mockPlay = vi.fn(() => Promise.resolve())
  const mockPause = vi.fn()

  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    // Audio constructor must be a real function (not arrow) for `new Audio()`
    vi.stubGlobal(
      'Audio',

      function MockAudio(_url?: string) {
        return {
          play: mockPlay,
          pause: mockPause,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }
      }
    )
    mockPlay.mockClear()
    mockPause.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('makes zero fetch calls on empty text', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { speak } = await import('@/lib/elevenlabs')
    await speak('')
    await speak('   ')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not create audio on 503 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    const { speak } = await import('@/lib/elevenlabs')
    await speak('Hello')
    expect(URL.createObjectURL).not.toHaveBeenCalled()
    expect(mockPlay).not.toHaveBeenCalled()
  })

  it('plays audio on successful response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob(['audio'])),
      })
    )
    const { speak } = await import('@/lib/elevenlabs')
    await speak('Hello world')
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(mockPlay).toHaveBeenCalled()
  })

  it('stopSpeaking cleans up', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob(['audio'])),
      })
    )
    const { speak, stopSpeaking } = await import('@/lib/elevenlabs')
    await speak('Test')
    stopSpeaking()
    expect(mockPause).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url')
  })
})
