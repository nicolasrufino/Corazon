import { config } from '@/config/env'

/**
 * Typed wrappers around the backend's AI endpoints (defined in
 * backend/routers/ai.py). Each function takes the user's profile in
 * the shape the backend expects (immigration_status / preferred_language
 * / occupation) plus the endpoint-specific extras.
 *
 * All calls have a 30s AbortController timeout so a hung backend can't
 * freeze the UI.
 */

const AI_TIMEOUT_MS = 30_000

/* ───────── shared types ───────── */

export interface AiProfile {
  immigration_status: string
  preferred_language: 'es' | 'en'
  occupation: string
}

export interface RecommendedResource {
  id?: string
  name?: string
  title?: string
  organization?: string
  description?: string
  category?: string
  categories?: string[]
  url?: string
  phone?: string
  address?: string
  neighborhood?: string
  languages?: string[]
  language_support?: string
  tags?: string[]
}

export interface ComplexArchetype {
  immigration_status: string
  preferred_language: string
  occupation: string
  nav_hours_yr: number
  time_saved_rate: Record<string, number>
  category_weights: Record<string, number>
  last_updated: string
  interaction_count: number
  dominant_categories: string[]
}

export interface RecommendResponse {
  archetype: ComplexArchetype
  resources: RecommendedResource[]
  count: number
}

export interface ImpactResponse {
  nav_hours: number
  poverty_hours: number
  total_hours_yr: number
  lifetime_days: number
  conversion_rate: number
  source: string
}

export interface TimeSavedResponse {
  total_saved_hrs: number
  breakdown: Record<string, number>
  interactions_count: number
}

export interface IsolationResponse {
  isolation_hours_yr: number
  isolation_days_lifetime: number
  community_hours_needed: number
  source: string
}

/* ───────── helper ───────── */

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  try {
    const res = await fetch(`${config.apiUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`AI API ${path} → ${res.status} ${res.statusText}`)
    }

    return (await res.json()) as T
  } finally {
    clearTimeout(timeout)
  }
}

/* ───────── endpoints ───────── */

export function recommendResources(
  profile: AiProfile,
  interactions_log: string[] = [],
  n = 5
): Promise<RecommendResponse> {
  return postJson<RecommendResponse>('/api/ai/recommend', {
    ...profile,
    interactions_log,
    n,
  })
}

export function estimateImpact(profile: AiProfile): Promise<ImpactResponse> {
  return postJson<ImpactResponse>('/api/ai/impact', profile)
}

export function calculateTimeSaved(
  profile: AiProfile,
  interactions_log: string[]
): Promise<TimeSavedResponse> {
  return postJson<TimeSavedResponse>('/api/ai/time-saved', {
    ...profile,
    interactions_log,
  })
}

export function isolationImpact(profile: AiProfile): Promise<IsolationResponse> {
  return postJson<IsolationResponse>('/api/ai/discovery/isolation', profile)
}

/* ───────── adapter from app User → AiProfile ───────── */

interface AppProfileLike {
  immigrationStatus?: string
  preferredLanguage?: string // 'spanish' | 'english'
  occupations?: string[]
}

export function buildAiProfile(profile: AppProfileLike | undefined): AiProfile {
  const occupation = profile?.occupations?.[0] ?? 'employed'
  const preferred =
    profile?.preferredLanguage === 'spanish' || profile?.preferredLanguage === 'es' ? 'es' : 'en'
  return {
    immigration_status: profile?.immigrationStatus ?? 'citizen',
    preferred_language: preferred,
    occupation,
  }
}

/* ───────── category taxonomy bridge ─────────
 *
 * The algorithm in backend/ai/algorithms.py uses a different 9-category
 * vocabulary than the frontend's ResourceCategory type. An interaction
 * tagged with a frontend category (e.g. "healthcare") gets silently
 * dropped by _compute_weights() because it's not in CATEGORIES.
 *
 * This mapper normalizes BOTH the frontend ResourceCategory values AND
 * the raw Supabase `opportunities.category` values into the algorithm's
 * vocabulary. Returns null for inputs that have no good equivalent
 * (e.g. "social_life" has no backend analogue) — callers filter nulls
 * before sending the log to /api/ai/recommend.
 */

export type BackendResourceCategory =
  | 'job'
  | 'internship'
  | 'scholarship'
  | 'food_bank'
  | 'health'
  | 'mental_health'
  | 'legal'
  | 'housing'
  | 'language'

const BACKEND_CATEGORIES: ReadonlySet<BackendResourceCategory> = new Set([
  'job',
  'internship',
  'scholarship',
  'food_bank',
  'health',
  'mental_health',
  'legal',
  'housing',
  'language',
])

// Frontend ResourceCategory → BackendResourceCategory
// Some frontend buckets fan in (healthcare = health + mental_health); we
// pick the most common primary. "social_life" has no analogue so it maps
// to null and gets filtered out before sending to the algorithm.
const FRONTEND_TO_BACKEND: Record<string, BackendResourceCategory | null> = {
  legal: 'legal',
  healthcare: 'health',
  immigration: 'legal',
  education: 'scholarship',
  community: 'food_bank',
  social_life: null,
  financial_aid: 'scholarship',
  language_learning: 'language',
  business: 'job',
  // Supabase raw values that don't match algorithm CATEGORIES 1:1
  event: null,
}

export function toBackendCategory(raw: string | null | undefined): BackendResourceCategory | null {
  if (!raw) return null
  if (BACKEND_CATEGORIES.has(raw as BackendResourceCategory)) {
    return raw as BackendResourceCategory
  }
  return FRONTEND_TO_BACKEND[raw] ?? null
}

/**
 * Convert an array of mixed-taxonomy category strings into a clean
 * backend-vocabulary interaction log, dropping anything that doesn't
 * map. Safe to pass straight to recommendResources / calculateTimeSaved.
 */
export function normalizeInteractionsLog(log: Array<string | null | undefined>): string[] {
  const out: string[] = []
  for (const entry of log) {
    const mapped = toBackendCategory(entry)
    if (mapped) out.push(mapped)
  }
  return out
}
