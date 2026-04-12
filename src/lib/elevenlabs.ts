import { config } from '@/config/env'

/**
 * Text-to-speech via the backend's secure ElevenLabs proxy.
 *
 * The API key lives ONLY on the server (ELEVENLABS_API_KEY env var on
 * Railway). The frontend never sees it, so it can't be scraped from
 * the bundle or the network tab.
 *
 * Race-safety: each call to speak() takes a fresh sequence number. If
 * a newer call starts while we're still fetching, the older response
 * is discarded (its blob URL is revoked) so we never end up playing
 * two clips simultaneously or leaking object URLs.
 *
 * If the backend returns 503 (key not configured) or anything else,
 * speak() silently no-ops so the rest of the app keeps working.
 */

const TTS_TIMEOUT_MS = 30_000

let currentAudio: HTMLAudioElement | null = null
let currentObjectUrl: string | null = null
let speakSequence = 0

export async function speak(text: string): Promise<void> {
  if (!text.trim()) return

  // Bump the sequence and capture our token. If anyone else calls
  // speak() before our fetch resolves, our token will be stale and
  // we'll bail out instead of installing our audio over theirs.
  speakSequence += 1
  const ourToken = speakSequence

  // Stop anything currently playing before starting a new clip.
  stopSpeaking()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS)

  try {
    const res = await fetch(`${config.apiUrl}/api/ai/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    })

    if (!res.ok) {
      // 503 = key not configured on backend, anything else = upstream issue.
      // Either way: silently no-op so chat experience isn't blocked.
      return
    }

    // If a newer speak() came in while we were fetching, abandon this
    // response. We don't install the audio and we never create the
    // blob URL, so nothing leaks.
    if (ourToken !== speakSequence) return

    const blob = await res.blob()

    // One more staleness check after blob() resolves (slow on big payloads).
    if (ourToken !== speakSequence) return

    const url = URL.createObjectURL(blob)
    currentObjectUrl = url
    const audio = new Audio(url)
    currentAudio = audio

    const cleanup = () => {
      if (currentObjectUrl === url) {
        URL.revokeObjectURL(url)
        currentObjectUrl = null
      }
      if (currentAudio === audio) {
        currentAudio = null
      }
    }
    audio.addEventListener('ended', cleanup)
    audio.addEventListener('error', cleanup)

    try {
      await audio.play()
    } catch (playErr) {
      // Browser autoplay policy can throw if no user gesture has happened.
      // Clean up the orphaned blob URL so we don't leak.
      cleanup()
      console.warn('TTS play() rejected:', playErr)
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') return
    console.warn('TTS failed:', err)
  } finally {
    clearTimeout(timeout)
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
