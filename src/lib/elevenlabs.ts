import { config } from '@/config/env'

/**
 * Text-to-speech via the backend's secure ElevenLabs proxy.
 *
 * The API key lives ONLY on the server (ELEVENLABS_API_KEY env var on
 * Railway / DigitalOcean). The frontend never sees it, so it can't be
 * scraped from the bundle or the network tab.
 *
 * If the backend returns 503 (key not configured) or anything else,
 * speak() silently no-ops so the rest of the app keeps working.
 */

let currentAudio: HTMLAudioElement | null = null
let currentObjectUrl: string | null = null

export async function speak(text: string): Promise<void> {
  if (!text.trim()) return

  // Stop anything that's currently playing before starting a new clip.
  stopSpeaking()

  try {
    const res = await fetch(`${config.apiUrl}/api/ai/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    if (!res.ok) {
      // 503 = key not configured on backend, anything else = upstream issue.
      // Either way: silently no-op so the chat experience isn't blocked.
      return
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    currentObjectUrl = url
    const audio = new Audio(url)
    currentAudio = audio

    audio.addEventListener('ended', () => {
      if (currentObjectUrl === url) {
        URL.revokeObjectURL(url)
        currentObjectUrl = null
      }
      if (currentAudio === audio) {
        currentAudio = null
      }
    })

    await audio.play()
  } catch (err) {
    console.warn('TTS failed:', err)
  }
}

export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl)
    currentObjectUrl = null
  }
}
