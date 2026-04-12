import { Reply, Send, Trash2, User as UserIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { createComment, deleteComment, fetchComments, type Comment } from '@/lib/commentsApi'
import { cn } from '@/lib/utils'

function timeAgo(dateStr: string, isEs: boolean): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return isEs ? 'ahora' : 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return `${Math.floor(days / 7)}w`
}

interface CommentDrawerProps {
  postId: string
  isOpen: boolean
  onClose: () => void
  onCommentCountChange: (postId: string, delta: number) => void
}

export const CommentDrawer = ({
  postId,
  isOpen,
  onClose,
  onCommentCountChange,
}: CommentDrawerProps) => {
  const { language, user } = useAppContext()
  const isEs = language === 'es'
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    fetchComments(postId).then(data => {
      setComments(data)
      setLoading(false)
    })
  }, [isOpen, postId])

  const handleSubmit = async () => {
    if (!input.trim() || !user || submitting) return
    setSubmitting(true)

    const comment = await createComment(postId, input.trim(), replyTo?.id)
    if (comment) {
      if (replyTo) {
        // Add reply to the parent comment
        setComments(prev =>
          prev.map(c => (c.id === replyTo.id ? { ...c, replies: [...c.replies, comment] } : c))
        )
      } else {
        setComments(prev => [...prev, comment])
      }
      onCommentCountChange(postId, 1)
      setInput('')
      setReplyTo(null)
    }
    setSubmitting(false)
  }

  const handleDelete = async (commentId: string, replyCount: number) => {
    const success = await deleteComment(commentId, postId)
    if (success) {
      const totalRemoved = 1 + replyCount
      // Remove from top-level or from replies
      setComments(prev =>
        prev
          .filter(c => c.id !== commentId)
          .map(c => ({
            ...c,
            replies: c.replies.filter(r => r.id !== commentId),
          }))
      )
      onCommentCountChange(postId, -totalRemoved)
    }
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={cn('flex gap-3', isReply && 'ml-10 border-l border-border/40 pl-3')}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10">
        <UserIcon className="size-3.5" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.username}</span>
          <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at, isEs)}</span>
          {user && user.id === comment.user_id && (
            <button
              type="button"
              onClick={() => handleDelete(comment.id, comment.replies?.length || 0)}
              className="cursor-pointer text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3" />
            </button>
          )}
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{comment.content}</p>
        {!isReply && user && (
          <button
            type="button"
            onClick={() => setReplyTo({ id: comment.id, username: comment.username })}
            className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Reply className="size-3" />
            {isEs ? 'Responder' : 'Reply'}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-[60] mx-auto w-full max-w-2xl transform rounded-t-3xl border border-border bg-card transition-transform duration-300 sm:inset-x-4 sm:bottom-4 sm:rounded-3xl',
        isOpen ? 'translate-y-0' : 'translate-y-[110%]'
      )}
      role="dialog"
      aria-modal="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 p-4">
        <h3 className="font-heading text-lg">{isEs ? 'Comentarios' : 'Comments'}</h3>
        <button
          type="button"
          onClick={() => {
            onClose()
            setReplyTo(null)
          }}
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border hover:bg-primary/10"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Comments list */}
      <div className="max-h-80 space-y-4 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-muted/40" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {isEs ? 'No hay comentarios. Se el primero.' : 'No comments yet. Be the first.'}
          </p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="space-y-3">
              {renderComment(comment)}
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      {user && (
        <div className="border-t border-border/50 p-4">
          {replyTo && (
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Reply className="size-3" />
              {isEs ? 'Respondiendo a' : 'Replying to'} @{replyTo.username}
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="cursor-pointer hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void handleSubmit()
                }
              }}
              maxLength={300}
              placeholder={
                replyTo
                  ? isEs
                    ? `Responder a @${replyTo.username}...`
                    : `Reply to @${replyTo.username}...`
                  : isEs
                    ? 'Escribe un comentario...'
                    : 'Write a comment...'
              }
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!input.trim() || submitting}
              className="inline-flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-xl bg-primary px-3 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
