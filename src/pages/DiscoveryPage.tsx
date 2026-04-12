import { Heart, MessageCircle, Plus, Send, User as UserIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/context/AppContext'
import { createPost, fetchPosts, toggleLike, type Post, type PostCategory } from '@/lib/postsApi'
import { cn } from '@/lib/utils'

const CATEGORIES: Array<{ value: PostCategory | 'all'; labelEs: string; labelEn: string }> = [
  { value: 'all', labelEs: 'Todo', labelEn: 'All' },
  { value: 'general', labelEs: 'General', labelEn: 'General' },
  { value: 'question', labelEs: 'Preguntas', labelEn: 'Questions' },
  { value: 'resource', labelEs: 'Recursos', labelEn: 'Resources' },
  { value: 'event', labelEs: 'Eventos', labelEn: 'Events' },
  { value: 'story', labelEs: 'Historias', labelEn: 'Stories' },
]

const POST_CATEGORIES: Array<{ value: PostCategory; labelEs: string; labelEn: string }> = [
  { value: 'general', labelEs: 'General', labelEn: 'General' },
  { value: 'question', labelEs: 'Pregunta', labelEn: 'Question' },
  { value: 'resource', labelEs: 'Recurso', labelEn: 'Resource' },
  { value: 'event', labelEs: 'Evento', labelEn: 'Event' },
  { value: 'story', labelEs: 'Historia', labelEn: 'Story' },
]

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

export const DiscoveryPage = () => {
  const { language, user } = useAppContext()
  const isEs = language === 'es'
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<PostCategory | 'all'>('all')
  const [composing, setComposing] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState<PostCategory>('general')
  const [submitting, setSubmitting] = useState(false)

  const loadPosts = async () => {
    setLoading(true)
    const data = await fetchPosts(category)
    setPosts(data)
    setLoading(false)
  }

  useEffect(() => {
    void loadPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const handleSubmit = async () => {
    if (!newContent.trim()) return
    setSubmitting(true)
    const post = await createPost(newContent.trim(), newCategory)
    if (post) {
      setPosts(prev => [post, ...prev])
      setNewContent('')
      setComposing(false)
    }
    setSubmitting(false)
  }

  const handleLike = async (postId: string) => {
    const liked = await toggleLike(postId)
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, liked_by_me: liked, likes_count: p.likes_count + (liked ? 1 : -1) }
          : p
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl">{isEs ? 'Descubre' : 'Discover'}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {isEs
                ? 'Comparte y conecta con la comunidad. Preguntas, recursos, eventos e historias.'
                : 'Share and connect with the community. Questions, resources, events, and stories.'}
            </p>
          </div>
          <Button
            type="button"
            className="h-11 cursor-pointer gap-2 text-black"
            style={{ background: '#ff8100' }}
            onClick={() => setComposing(true)}
          >
            <Plus className="size-4" />
            {isEs ? 'Publicar' : 'Post'}
          </Button>
        </div>

        {/* Category filters */}
        <div className="mt-5 flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={cn(
                'h-9 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors',
                category === cat.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-primary/10'
              )}
            >
              {isEs ? cat.labelEs : cat.labelEn}
            </button>
          ))}
        </div>
      </section>

      {/* Compose modal */}
      {composing && (
        <section className="rounded-2xl border border-border/50 bg-card/80 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <UserIcon className="size-4" />
              </div>
              <span className="text-sm font-medium">{user?.username || 'User'}</span>
            </div>
            <button
              type="button"
              onClick={() => setComposing(false)}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            maxLength={500}
            rows={4}
            className="mt-4 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={
              isEs ? 'Comparte algo con la comunidad...' : 'Share something with the community...'
            }
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {POST_CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setNewCategory(cat.value)}
                  className={cn(
                    'h-8 cursor-pointer rounded-full border px-3 text-xs font-medium transition-colors',
                    newCategory === cat.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-primary/10'
                  )}
                >
                  {isEs ? cat.labelEs : cat.labelEn}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{newContent.length}/500</span>
              <Button
                type="button"
                className="h-9 cursor-pointer gap-2 text-black"
                style={{ background: '#ff8100' }}
                onClick={handleSubmit}
                disabled={submitting || !newContent.trim()}
              >
                <Send className="size-3.5" />
                {submitting ? (isEs ? 'Publicando...' : 'Posting...') : isEs ? 'Publicar' : 'Post'}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Feed */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card/70 p-8 text-center">
          <MessageCircle className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            {isEs
              ? 'No hay publicaciones todav\u00eda. Se el primero en compartir algo.'
              : 'No posts yet. Be the first to share something.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <article
              key={post.id}
              className="rounded-2xl border border-border/50 bg-card/70 p-5 transition-colors hover:border-border"
            >
              {/* Post header */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10">
                  <UserIcon className="size-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{post.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {timeAgo(post.created_at, isEs)}
                    <span className="mx-1.5">&middot;</span>
                    {post.category}
                  </p>
                </div>
              </div>

              {/* Content */}
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

              {/* Image */}
              {post.image_url && (
                <div className="mt-3 overflow-hidden rounded-xl">
                  <img
                    src={post.image_url}
                    alt=""
                    className="w-full object-cover"
                    style={{ maxHeight: 400 }}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleLike(post.id)}
                  className={cn(
                    'flex cursor-pointer items-center gap-1.5 text-sm transition-colors',
                    post.liked_by_me ? 'text-red-400' : 'text-muted-foreground hover:text-red-400'
                  )}
                >
                  <Heart className="size-4" fill={post.liked_by_me ? 'currentColor' : 'none'} />
                  {post.likes_count > 0 && post.likes_count}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
