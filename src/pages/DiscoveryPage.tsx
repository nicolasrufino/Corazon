import {
  Bookmark,
  Heart,
  ImagePlus,
  MessageCircle,
  Plus,
  Send,
  User as UserIcon,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { CommentDrawer } from '@/components/CommentDrawer'
import { useAppContext } from '@/context/AppContext'
import { uploadImage } from '@/lib/cloudinary'
import { saveItem, unsaveItem } from '@/lib/savedApi'
import { createPost, fetchPosts, toggleLike, type Post, type PostCategory } from '@/lib/postsApi'
import { cn } from '@/lib/utils'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB

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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [commentPostId, setCommentPostId] = useState<string | null>(null)
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetCompose = () => {
    setNewContent('')
    setComposing(false)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
    setImageError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setImageError(null)
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError(isEs ? 'La imagen debe ser menor a 5MB.' : 'Image must be smaller than 5MB.')
      event.target.value = ''
      return
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
    setImageError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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
    setImageError(null)

    let imageUrl: string | undefined
    if (imageFile) {
      setUploading(true)
      const url = await uploadImage(imageFile)
      setUploading(false)
      if (!url) {
        setImageError(
          isEs
            ? 'No se pudo subir la imagen. Intenta de nuevo.'
            : 'Could not upload image. Try again.'
        )
        setSubmitting(false)
        return
      }
      imageUrl = url
    }

    const post = await createPost(newContent.trim(), newCategory, imageUrl)
    if (post) {
      setPosts(prev => [post, ...prev])
      resetCompose()
    }
    setSubmitting(false)
  }

  const handleLike = async (postId: string) => {
    if (!user) return
    const liked = await toggleLike(postId)
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? {
              ...p,
              liked_by_me: liked,
              likes_count: Math.max(0, p.likes_count + (liked ? 1 : -1)),
            }
          : p
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header — cinematic glass with tropical texture + warm glow */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#050608] p-5 sm:p-8">
        {/* Tropical green.jpg texture — subtle Latino warmth */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-screen"
          style={{
            backgroundImage: "url('/green.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(1px) saturate(1.1)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#050608]/70 backdrop-blur-[2px]"
        />
        {/* Warm corner glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(23,119,215,0.4) 0%, rgba(0,170,99,0.2) 40%, transparent 70%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1777d7]/50 to-transparent"
        />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-gradient-to-r from-transparent to-[#1777d7]/60"
              />
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#5a9ff0]">
                {isEs ? 'Comunidad' : 'Community'}
              </p>
            </div>
            <h1 className="mt-2 bg-gradient-to-b from-white to-white/70 bg-clip-text text-3xl text-transparent sm:text-4xl">
              {isEs ? 'Descubre' : 'Discover'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
              {isEs
                ? 'Comparte y conecta con la comunidad. Preguntas, recursos, eventos e historias.'
                : 'Share and connect with the community. Questions, resources, events, and stories.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="relative inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-[#ff8100]/50 bg-gradient-to-br from-[#ff8100] via-[#ff8100] to-[#f82d1a] px-5 text-sm font-semibold text-white shadow-[0_6px_20px_-6px_rgba(255,129,0,0.65),inset_0_1px_0_0_rgba(255,181,90,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-6px_rgba(255,129,0,0.85)]"
          >
            <Plus className="size-4" />
            {isEs ? 'Publicar' : 'Post'}
          </button>
        </div>

        {/* Category filters — glass pills matching dashboard */}
        <div className="relative mt-5 flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={cn(
                'h-9 cursor-pointer whitespace-nowrap rounded-full border px-4 text-sm font-medium backdrop-blur-md transition-all duration-300',
                category === cat.value
                  ? 'border-[#ff8100]/55 bg-[#ff8100]/15 text-white shadow-[0_0_25px_-8px_rgba(255,129,0,0.7),inset_0_1px_0_0_rgba(255,181,90,0.35)]'
                  : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-[#ff8100]/30 hover:bg-white/[0.06] hover:text-white'
              )}
            >
              {isEs ? cat.labelEs : cat.labelEn}
            </button>
          ))}
        </div>
      </section>

      {/* Compose modal — glass */}
      {composing && (
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0b10]/60 p-5 backdrop-blur-xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff8100]/50 to-transparent"
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ff8100]/30 bg-[#ff8100]/10 text-[#ffb15a] shadow-[inset_0_1px_0_0_rgba(255,181,90,0.25)]">
                <UserIcon className="size-4" />
              </div>
              <span className="text-sm font-medium text-white">{user?.username || 'User'}</span>
            </div>
            <button
              type="button"
              onClick={resetCompose}
              className="cursor-pointer text-white/50 transition-colors hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            maxLength={500}
            rows={4}
            className="relative mt-4 w-full resize-none rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-white/35 outline-none transition-all duration-300 focus-visible:border-[#ff8100]/50 focus-visible:shadow-[0_0_30px_-10px_rgba(255,129,0,0.5)]"
            placeholder={
              isEs ? 'Comparte algo con la comunidad...' : 'Share something with the community...'
            }
          />

          {/* Image preview */}
          {imagePreview && (
            <div className="relative mt-3 overflow-hidden rounded-xl border border-border/60">
              <img
                src={imagePreview}
                alt={isEs ? 'Vista previa' : 'Preview'}
                className="max-h-80 w-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-black/90"
                aria-label={isEs ? 'Quitar imagen' : 'Remove image'}
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {imageError && <p className="mt-2 text-xs text-destructive">{imageError}</p>}

          {/* Hidden file input — triggered by the ImagePlus button below */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />

          <div className="relative mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs font-medium text-white/70 backdrop-blur-md transition-all duration-300 hover:border-[#ff8100]/30 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={isEs ? 'Agregar imagen' : 'Add image'}
              >
                <ImagePlus className="size-3.5" />
                {isEs ? 'Imagen' : 'Image'}
              </button>
              {POST_CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setNewCategory(cat.value)}
                  className={cn(
                    'h-8 cursor-pointer rounded-full border px-3 text-xs font-medium backdrop-blur-md transition-all duration-300',
                    newCategory === cat.value
                      ? 'border-[#ff8100]/55 bg-[#ff8100]/15 text-white shadow-[0_0_20px_-6px_rgba(255,129,0,0.6)]'
                      : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-[#ff8100]/30 hover:bg-white/[0.06] hover:text-white'
                  )}
                >
                  {isEs ? cat.labelEs : cat.labelEn}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40">{newContent.length}/500</span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !newContent.trim()}
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-[#ff8100]/50 bg-gradient-to-br from-[#ff8100] via-[#ff8100] to-[#f82d1a] px-4 text-sm font-semibold text-white shadow-[0_6px_20px_-6px_rgba(255,129,0,0.65),inset_0_1px_0_0_rgba(255,181,90,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-6px_rgba(255,129,0,0.85)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <Send className="size-3.5" />
                {uploading
                  ? isEs
                    ? 'Subiendo imagen...'
                    : 'Uploading image...'
                  : submitting
                    ? isEs
                      ? 'Publicando...'
                      : 'Posting...'
                    : isEs
                      ? 'Publicar'
                      : 'Post'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Feed — Pinterest-style masonry using CSS multi-column layout.
         Posts flow top-to-bottom in each column, so variable heights
         stack cleanly without JavaScript. `break-inside-avoid` on each
         card keeps the card from splitting across columns. */}
      {loading ? (
        <div className="gap-4 columns-1 sm:columns-2 lg:columns-3">
          {[32, 48, 40, 56, 36, 44].map((h, i) => (
            <div
              key={i}
              className="mb-4 break-inside-avoid animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]"
              style={{ height: `${h * 4}px` }}
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0b10]/60 p-8 text-center backdrop-blur-xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff8100]/40 to-transparent"
          />
          <MessageCircle className="mx-auto size-10 text-white/25" />
          <p className="mt-3 text-sm text-white/55">
            {isEs
              ? 'No hay publicaciones todav\u00eda. Se el primero en compartir algo.'
              : 'No posts yet. Be the first to share something.'}
          </p>
        </div>
      ) : (
        <div className="gap-4 columns-1 sm:columns-2 lg:columns-3">
          {posts.map(post => (
            <article
              key={post.id}
              className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-[#0a0b10]/60 p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 hover:border-[#ff8100]/30 hover:shadow-[0_20px_60px_-20px_rgba(255,129,0,0.3)]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff8100]/40 to-transparent opacity-50 transition-opacity duration-500 group-hover:opacity-100"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent"
              />

              {/* Post header */}
              <div className="relative flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ff8100]/30 bg-[#ff8100]/10 text-[#ffb15a] shadow-[inset_0_1px_0_0_rgba(255,181,90,0.25)]">
                  <UserIcon className="size-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{post.username}</p>
                  <p className="text-xs text-white/45">
                    {timeAgo(post.created_at, isEs)}
                    <span className="mx-1.5">&middot;</span>
                    {post.category}
                  </p>
                </div>
              </div>

              {/* Content */}
              <p className="relative mt-3 text-sm leading-relaxed whitespace-pre-wrap text-white/85">
                {post.content}
              </p>

              {/* Image */}
              {post.image_url && (
                <div className="relative mt-3 overflow-hidden rounded-xl border border-white/10">
                  <img
                    src={post.image_url}
                    alt=""
                    className="w-full object-cover"
                    style={{ maxHeight: 400 }}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="relative mt-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleLike(post.id)}
                  className={cn(
                    'flex cursor-pointer items-center gap-1.5 text-sm transition-colors',
                    post.liked_by_me ? 'text-[#dc2626]' : 'text-white/50 hover:text-[#dc2626]'
                  )}
                >
                  <Heart className="size-4" fill={post.liked_by_me ? 'currentColor' : 'none'} />
                  {post.likes_count > 0 && post.likes_count}
                </button>
                <button
                  type="button"
                  onClick={() => setCommentPostId(post.id)}
                  className="flex cursor-pointer items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white"
                >
                  <MessageCircle className="size-4" />
                  {post.comments_count > 0 && post.comments_count}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!user) return
                    if (savedPostIds.has(post.id)) {
                      await unsaveItem('post', post.id)
                      setSavedPostIds(prev => {
                        const next = new Set(prev)
                        next.delete(post.id)
                        return next
                      })
                    } else {
                      await saveItem('post', post.id)
                      setSavedPostIds(prev => new Set(prev).add(post.id))
                    }
                  }}
                  className={cn(
                    'flex cursor-pointer items-center gap-1.5 text-sm transition-colors',
                    savedPostIds.has(post.id)
                      ? 'text-[#ffb15a]'
                      : 'text-white/50 hover:text-[#ffb15a]'
                  )}
                >
                  <Bookmark
                    className="size-4"
                    fill={savedPostIds.has(post.id) ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Comment drawer */}
      {commentPostId && (
        <CommentDrawer
          postId={commentPostId}
          isOpen={!!commentPostId}
          onClose={() => setCommentPostId(null)}
          onCommentCountChange={(postId, delta) => {
            setPosts(prev =>
              prev.map(p =>
                p.id === postId
                  ? { ...p, comments_count: Math.max(0, (p.comments_count || 0) + delta) }
                  : p
              )
            )
          }}
        />
      )}
    </div>
  )
}
