import { config } from '@/config/env'

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // Rachel — warm, clear, natural

export async function speak(text: string): Promise<void> {
  if (!config.elevenlabsApiKey) return

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
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
  })

  if (!res.ok) return

  const blob = await res.blob()
  const audio = new Audio(URL.createObjectURL(blob))
  await audio.play()
}

export function stopSpeaking(): void {
  document.querySelectorAll('audio').forEach(a => {
    a.pause()
    a.remove()
  })
}
