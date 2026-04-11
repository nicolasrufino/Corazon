import { Mic, SendHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { sendVoiceChatMessage } from '@/lib/mockApi'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types/app'

export const VoiceAssistant = () => {
  const { addChatMessage, chatHistory, language, user } = useAppContext()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isResponding, setIsResponding] = useState(false)

  const visibleHistory = useMemo(() => {
    if (!user) {
      return chatHistory.slice(-4)
    }
    return chatHistory
  }, [chatHistory, user])

  const sendMessage = async () => {
    const trimmed = message.trim()

    if (!trimmed || isResponding) {
      return
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }

    addChatMessage(userMessage)
    setMessage('')
    setIsResponding(true)

    try {
      const response = await sendVoiceChatMessage(trimmed, language)
      addChatMessage(response)
    } finally {
      setIsResponding(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/45 transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={language === 'es' ? 'Abrir asistente de voz' : 'Open voice assistant'}
      >
        <Mic className="size-6" aria-hidden="true" />
      </button>

      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-[60] mx-auto w-full max-w-2xl transform rounded-t-3xl border border-border bg-card p-4 shadow-2xl shadow-black/40 transition-transform duration-300 sm:inset-x-4 sm:bottom-4 sm:rounded-3xl',
          isOpen ? 'translate-y-0' : 'translate-y-[110%]'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={language === 'es' ? 'Asistente de voz' : 'Voice assistant'}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg">
              {language === 'es' ? 'Asistente Brújula' : 'Brújula Assistant'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {language === 'es'
                ? 'Respuestas informativas con enfoque comunitario.'
                : 'Informational guidance with a community-first lens.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-background transition-colors duration-200 hover:bg-primary/10"
            aria-label={language === 'es' ? 'Cerrar asistente' : 'Close assistant'}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mb-4 max-h-72 space-y-3 overflow-y-auto rounded-2xl border border-border/60 bg-background/70 p-3">
          {visibleHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {language === 'es'
                ? 'Pregunta por recursos, próximos pasos o cómo preparar una cita.'
                : 'Ask about resources, next steps, or how to prepare for an appointment.'}
            </p>
          ) : (
            visibleHistory.map(entry => (
              <div
                key={entry.id}
                className={cn('max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed', {
                  'ml-auto bg-primary text-primary-foreground': entry.role === 'user',
                  'bg-muted text-foreground': entry.role === 'assistant',
                })}
              >
                {entry.content}
              </div>
            ))
          )}

          {isResponding ? (
            <div
              className="inline-flex items-center gap-1 rounded-2xl bg-muted px-3 py-2"
              aria-live="polite"
            >
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          ) : null}
        </div>

        {!user ? (
          <p className="mb-3 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs text-muted-foreground">
            {language === 'es'
              ? 'Como invitado puedes chatear, pero el historial no se guarda. Inicia sesión para mantener tus conversaciones.'
              : 'Guests can chat, but history is not persisted. Sign in to keep conversation history.'}
          </p>
        ) : null}

        <div className="flex items-center gap-2">
          <label htmlFor="voice-message" className="sr-only">
            {language === 'es' ? 'Mensaje' : 'Message'}
          </label>
          <input
            id="voice-message"
            type="text"
            value={message}
            onChange={event => setMessage(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void sendMessage()
              }
            }}
            placeholder={
              language === 'es'
                ? 'Ej. ¿Qué necesito para una consulta legal?'
                : 'e.g. What do I need for a legal consult?'
            }
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={() => {
              void sendMessage()
            }}
            disabled={!message.trim() || isResponding}
            className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-3 text-primary-foreground transition-colors duration-200 hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={language === 'es' ? 'Enviar mensaje' : 'Send message'}
          >
            <SendHorizontal className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  )
}
