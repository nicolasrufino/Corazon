import { Check, Heart, Pencil, Trash2, User as UserIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/context/AppContext'
import { supabase } from '@/lib/supabase'
import { deletePost, fetchUserPosts, type Post } from '@/lib/postsApi'
import { cn } from '@/lib/utils'
import type { Occupation, OnboardingProfile, ResourceCategory } from '@/types/app'

/**
 * Country label → flag emoji map for the most common countries used in
 * onboarding. Mirrors the COUNTRIES list in OnboardingPage so the profile
 * displays a flag next to the user's country of origin if we recognize it.
 * Stored value can be either the ES or EN label.
 */
const COUNTRY_FLAGS: Record<string, string> = {
  // Latin America (ES + EN labels both map to the same flag)
  México: '🇲🇽',
  Mexico: '🇲🇽',
  Guatemala: '🇬🇹',
  'El Salvador': '🇸🇻',
  Honduras: '🇭🇳',
  Colombia: '🇨🇴',
  Ecuador: '🇪🇨',
  Perú: '🇵🇪',
  Peru: '🇵🇪',
  Venezuela: '🇻🇪',
  Cuba: '🇨🇺',
  'República Dominicana': '🇩🇴',
  'Dominican Republic': '🇩🇴',
  'Puerto Rico': '🇵🇷',
  Nicaragua: '🇳🇮',
  'Costa Rica': '🇨🇷',
  Panamá: '🇵🇦',
  Panama: '🇵🇦',
  Argentina: '🇦🇷',
  Chile: '🇨🇱',
  Bolivia: '🇧🇴',
  Paraguay: '🇵🇾',
  Uruguay: '🇺🇾',
  Brasil: '🇧🇷',
  Brazil: '🇧🇷',
  Haití: '🇭🇹',
  Haiti: '🇭🇹',
  Jamaica: '🇯🇲',
  // Other
  'Estados Unidos': '🇺🇸',
  'United States': '🇺🇸',
  Canadá: '🇨🇦',
  Canada: '🇨🇦',
  España: '🇪🇸',
  Spain: '🇪🇸',
  Portugal: '🇵🇹',
  Filipinas: '🇵🇭',
  Philippines: '🇵🇭',
  Italia: '🇮🇹',
  Italy: '🇮🇹',
}

/**
 * Country options for the edit-mode dropdown. `en` is the canonical value
 * stored in profiles.country_of_origin, but we also accept the `es` label
 * for backwards-compat with profiles created in Spanish onboarding.
 */
interface CountryOption {
  en: string
  es: string
  flag: string
}

const COUNTRIES: CountryOption[] = [
  { en: 'Mexico', es: 'México', flag: '🇲🇽' },
  { en: 'Guatemala', es: 'Guatemala', flag: '🇬🇹' },
  { en: 'El Salvador', es: 'El Salvador', flag: '🇸🇻' },
  { en: 'Honduras', es: 'Honduras', flag: '🇭🇳' },
  { en: 'Colombia', es: 'Colombia', flag: '🇨🇴' },
  { en: 'Ecuador', es: 'Ecuador', flag: '🇪🇨' },
  { en: 'Peru', es: 'Perú', flag: '🇵🇪' },
  { en: 'Venezuela', es: 'Venezuela', flag: '🇻🇪' },
  { en: 'Cuba', es: 'Cuba', flag: '🇨🇺' },
  { en: 'Dominican Republic', es: 'República Dominicana', flag: '🇩🇴' },
  { en: 'Puerto Rico', es: 'Puerto Rico', flag: '🇵🇷' },
  { en: 'Nicaragua', es: 'Nicaragua', flag: '🇳🇮' },
  { en: 'Costa Rica', es: 'Costa Rica', flag: '🇨🇷' },
  { en: 'Panama', es: 'Panamá', flag: '🇵🇦' },
  { en: 'Argentina', es: 'Argentina', flag: '🇦🇷' },
  { en: 'Chile', es: 'Chile', flag: '🇨🇱' },
  { en: 'Bolivia', es: 'Bolivia', flag: '🇧🇴' },
  { en: 'Paraguay', es: 'Paraguay', flag: '🇵🇾' },
  { en: 'Uruguay', es: 'Uruguay', flag: '🇺🇾' },
  { en: 'Brazil', es: 'Brasil', flag: '🇧🇷' },
  { en: 'Haiti', es: 'Haití', flag: '🇭🇹' },
  { en: 'United States', es: 'Estados Unidos', flag: '🇺🇸' },
  { en: 'Canada', es: 'Canadá', flag: '🇨🇦' },
  { en: 'Spain', es: 'España', flag: '🇪🇸' },
  { en: 'Portugal', es: 'Portugal', flag: '🇵🇹' },
  { en: 'Philippines', es: 'Filipinas', flag: '🇵🇭' },
  { en: 'Italy', es: 'Italia', flag: '🇮🇹' },
]

const findCountry = (label: string | undefined): CountryOption | undefined =>
  label ? COUNTRIES.find(c => c.en === label || c.es === label) : undefined

const ALL_OCCUPATIONS: Occupation[] = [
  'student',
  'worker',
  'student_worker',
  'job_seeker',
  'two_jobs',
  'retired',
  'caregiver',
  'other',
]

const ALL_GOALS: ResourceCategory[] = [
  'legal',
  'healthcare',
  'immigration',
  'education',
  'community',
  'social_life',
  'financial_aid',
  'language_learning',
  'business',
]

// Corazón logo letter palette — used to color goal pills.
const PILL_COLORS = ['#ff8100', '#00aa63', '#1777d7', '#ffd300', '#ffb5e2', '#f82d1a']

const HEART_RED = '#dc2626'

const OCCUPATION_LABELS: Record<string, { en: string; es: string }> = {
  student: { en: 'Student', es: 'Estudiante' },
  worker: { en: 'Worker', es: 'Trabajador' },
  student_worker: { en: 'Student + Worker', es: 'Estudiante + Trabajador' },
  job_seeker: { en: 'Job seeker', es: 'Buscando trabajo' },
  two_jobs: { en: 'Two jobs', es: 'Dos trabajos' },
  retired: { en: 'Retired', es: 'Jubilado' },
  caregiver: { en: 'Caregiver', es: 'Cuidador' },
  other: { en: 'Other', es: 'Otro' },
}

const GOAL_LABELS: Record<string, { en: string; es: string }> = {
  legal: { en: 'Legal', es: 'Legal' },
  healthcare: { en: 'Healthcare', es: 'Salud' },
  immigration: { en: 'Immigration', es: 'Inmigración' },
  education: { en: 'Education', es: 'Educación' },
  community: { en: 'Community', es: 'Comunidad' },
  social_life: { en: 'Social life', es: 'Vida social' },
  financial_aid: { en: 'Financial aid', es: 'Ayuda financiera' },
  language_learning: { en: 'Language', es: 'Aprender idiomas' },
  business: { en: 'Business', es: 'Negocios' },
}

function formatDate(dateStr: string, isEs: boolean): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(isEs ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
  })
}

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

export const ProfilePage = () => {
  const { language, user, signOut, completeOnboarding } = useAppContext()
  const navigate = useNavigate()
  const isEs = language === 'es'

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [memberSince, setMemberSince] = useState<string | null>(null)

  // Edit mode for profile info section
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<OnboardingProfile | null>(null)
  const [saving, setSaving] = useState(false)

  const startEdit = () => {
    if (!user?.profile) return
    setDraft({
      ...user.profile,
      occupations: [...user.profile.occupations],
      goals: [...user.profile.goals],
    })
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDraft(null)
  }

  const saveEdit = async () => {
    if (!draft) return
    setSaving(true)
    await completeOnboarding(draft)
    setSaving(false)
    setEditing(false)
    setDraft(null)
  }

  const toggleOccupation = (occ: Occupation) => {
    setDraft(d => {
      if (!d) return d
      const has = d.occupations.includes(occ)
      return {
        ...d,
        occupations: has ? d.occupations.filter(o => o !== occ) : [...d.occupations, occ],
      }
    })
  }

  const toggleGoal = (goal: ResourceCategory) => {
    setDraft(d => {
      if (!d) return d
      const has = d.goals.includes(goal)
      return {
        ...d,
        goals: has ? d.goals.filter(g => g !== goal) : [...d.goals, goal],
      }
    })
  }

  useEffect(() => {
    if (!user) return
    void (async () => {
      setLoading(true)
      const [userPosts, authResult] = await Promise.all([
        fetchUserPosts(user.id),
        supabase.auth.getUser(),
      ])
      setPosts(userPosts)
      if (authResult.data.user?.created_at) {
        setMemberSince(authResult.data.user.created_at)
      }
      setLoading(false)
    })()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleDeletePost = async (postId: string) => {
    const ok = await deletePost(postId)
    if (ok) setPosts(prev => prev.filter(p => p.id !== postId))
  }

  if (!user) return null

  const country = user.profile?.countryOfOrigin
  const flag = country ? COUNTRY_FLAGS[country] : undefined

  const occupationLabel = (user.profile?.occupations || [])
    .map(o => (isEs ? OCCUPATION_LABELS[o]?.es : OCCUPATION_LABELS[o]?.en) || o)
    .join(' + ')

  return (
    <div className="space-y-6">
      {/* Header — avatar + username + email + member since */}
      <section
        className="rounded-3xl border bg-card/70 p-5 sm:p-7"
        style={{ borderColor: `${HEART_RED}40` }}
      >
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 bg-white/5"
            style={{ borderColor: HEART_RED }}
          >
            <UserIcon className="size-10 text-white/80" />
          </div>
          <div className="min-w-0 flex-1">
            <h1
              className="truncate text-2xl sm:text-3xl"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              {user.username || (isEs ? 'Usuario' : 'User')}
            </h1>
            <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
            {memberSince && (
              <p className="mt-1 text-xs text-muted-foreground">
                {isEs ? 'Miembro desde' : 'Member since'} {formatDate(memberSince, isEs)}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Profile info section */}
      {user.profile && (
        <section className="space-y-4 rounded-2xl border border-border/50 bg-card/70 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">{isEs ? 'Tu perfil' : 'Profile info'}</h2>
            {!editing ? (
              <button
                type="button"
                onClick={startEdit}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/10"
                aria-label={isEs ? 'Editar perfil' : 'Edit profile'}
              >
                <Pencil className="size-3.5" />
                {isEs ? 'Editar' : 'Edit'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={isEs ? 'Cancelar' : 'Cancel'}
                >
                  <X className="size-3.5" />
                  {isEs ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={saving}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={isEs ? 'Guardar cambios' : 'Save changes'}
                >
                  <Check className="size-3.5" />
                  {saving ? (isEs ? 'Guardando...' : 'Saving...') : isEs ? 'Guardar' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {/* Read mode */}
          {!editing && (
            <>
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                {country && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {isEs ? 'País de origen' : 'Country'}
                    </p>
                    <p className="mt-1 flex items-center gap-2">
                      {flag && <span className="text-base">{flag}</span>}
                      {country}
                    </p>
                  </div>
                )}

                {user.profile.preferredLanguage && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {isEs ? 'Idioma' : 'Language'}
                    </p>
                    <p className="mt-1">
                      {user.profile.preferredLanguage === 'spanish' ? 'Español' : 'English'}
                    </p>
                  </div>
                )}

                {occupationLabel && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {isEs ? 'Ocupación' : 'Occupation'}
                    </p>
                    <p className="mt-1">{occupationLabel}</p>
                  </div>
                )}
              </div>

              {user.profile.goals.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {isEs ? 'Metas' : 'Goals'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.profile.goals.map((goal, i) => {
                      const color = PILL_COLORS[i % PILL_COLORS.length]
                      const label = isEs ? GOAL_LABELS[goal]?.es : GOAL_LABELS[goal]?.en
                      return (
                        <span
                          key={goal}
                          className="rounded-full px-3 py-1 text-xs font-semibold text-black"
                          style={{ background: color }}
                        >
                          {label || goal}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Edit mode */}
          {editing && draft && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                {/* Country dropdown */}
                <div>
                  <label
                    htmlFor="profile-country"
                    className="text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    {isEs ? 'País de origen' : 'Country'}
                  </label>
                  <select
                    id="profile-country"
                    value={findCountry(draft.countryOfOrigin)?.en || ''}
                    onChange={e => {
                      const en = e.target.value
                      const opt = COUNTRIES.find(c => c.en === en)
                      setDraft(d =>
                        d ? { ...d, countryOfOrigin: opt ? (isEs ? opt.es : opt.en) : '' } : d
                      )
                    }}
                    className="mt-1 h-11 w-full cursor-pointer rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">{isEs ? '— Selecciona —' : '— Select —'}</option>
                    {COUNTRIES.map(c => (
                      <option key={c.en} value={c.en}>
                        {c.flag} {isEs ? c.es : c.en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language select */}
                <div>
                  <label
                    htmlFor="profile-lang"
                    className="text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    {isEs ? 'Idioma' : 'Language'}
                  </label>
                  <select
                    id="profile-lang"
                    value={draft.preferredLanguage}
                    onChange={e =>
                      setDraft(d =>
                        d ? { ...d, preferredLanguage: e.target.value as 'spanish' | 'english' } : d
                      )
                    }
                    className="mt-1 h-11 w-full cursor-pointer rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="spanish">Español</option>
                    <option value="english">English</option>
                  </select>
                </div>
              </div>

              {/* Occupation chips */}
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {isEs ? 'Ocupación' : 'Occupation'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ALL_OCCUPATIONS.map(occ => {
                    const active = draft.occupations.includes(occ)
                    const label = isEs ? OCCUPATION_LABELS[occ]?.es : OCCUPATION_LABELS[occ]?.en
                    return (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => toggleOccupation(occ)}
                        className={cn(
                          'h-8 cursor-pointer rounded-full border px-3 text-xs font-medium transition-colors',
                          active
                            ? 'border-primary bg-primary text-black'
                            : 'border-border hover:border-primary hover:bg-primary/10'
                        )}
                      >
                        {label || occ}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Goal chips */}
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {isEs ? 'Metas' : 'Goals'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ALL_GOALS.map((goal, i) => {
                    const active = draft.goals.includes(goal)
                    const color = PILL_COLORS[i % PILL_COLORS.length]
                    const label = isEs ? GOAL_LABELS[goal]?.es : GOAL_LABELS[goal]?.en
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={cn(
                          'h-8 cursor-pointer rounded-full border px-3 text-xs font-medium transition-colors',
                          active
                            ? 'border-transparent text-black'
                            : 'border-border hover:bg-muted/40'
                        )}
                        style={active ? { background: color } : undefined}
                      >
                        {label || goal}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* My posts */}
      <section className="space-y-4 rounded-2xl border border-border/50 bg-card/70 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{isEs ? 'Mis publicaciones' : 'My Posts'}</h2>
          <span className="text-xs text-muted-foreground">{posts.length}</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/40" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isEs
              ? 'Todavía no has publicado nada. Visita Descubre para compartir tu primera publicación.'
              : "You haven't posted anything yet. Visit Discover to share your first post."}
          </p>
        ) : (
          <ul className="space-y-3">
            {posts.map(post => (
              <li
                key={post.id}
                className="rounded-xl border border-border/50 bg-background/40 p-4 transition-colors hover:border-border"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(post.created_at, isEs)} · {post.category}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                    {post.image_url && (
                      <div className="mt-2 overflow-hidden rounded-lg">
                        <img
                          src={post.image_url}
                          alt=""
                          className="w-full object-cover"
                          style={{ maxHeight: 240 }}
                        />
                      </div>
                    )}
                    <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="size-3" />
                      {post.likes_count}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id)}
                    className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={isEs ? 'Eliminar publicación' : 'Delete post'}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Sign out */}
      <Button
        type="button"
        variant="outline"
        className="h-11 cursor-pointer text-destructive hover:bg-destructive/10"
        onClick={handleSignOut}
      >
        {isEs ? 'Cerrar sesión' : 'Sign out'}
      </Button>
    </div>
  )
}
