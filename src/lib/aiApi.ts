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

export interface RecommendResponse {
  archetype: Record<string, unknown>
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
