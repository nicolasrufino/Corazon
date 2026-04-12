import { describe, expect, it } from 'vitest'
import { buildAiProfile, normalizeInteractionsLog, toBackendCategory } from '../lib/aiApi'

describe('toBackendCategory', () => {
  // ── Pass-through for already-valid backend categories ──
  it('returns backend categories unchanged', () => {
    expect(toBackendCategory('job')).toBe('job')
    expect(toBackendCategory('legal')).toBe('legal')
    expect(toBackendCategory('health')).toBe('health')
    expect(toBackendCategory('mental_health')).toBe('mental_health')
    expect(toBackendCategory('food_bank')).toBe('food_bank')
    expect(toBackendCategory('housing')).toBe('housing')
    expect(toBackendCategory('language')).toBe('language')
    expect(toBackendCategory('internship')).toBe('internship')
    expect(toBackendCategory('scholarship')).toBe('scholarship')
  })

  // ── Frontend ResourceCategory → backend mapping ──
  it('maps frontend ResourceCategory values to backend equivalents', () => {
    expect(toBackendCategory('legal')).toBe('legal')
    expect(toBackendCategory('healthcare')).toBe('health')
    expect(toBackendCategory('immigration')).toBe('legal')
    expect(toBackendCategory('education')).toBe('scholarship')
    expect(toBackendCategory('community')).toBe('food_bank')
    expect(toBackendCategory('financial_aid')).toBe('scholarship')
    expect(toBackendCategory('language_learning')).toBe('language')
    expect(toBackendCategory('business')).toBe('job')
  })

  // ── Categories that should map to null ──
  it('returns null for frontend categories with no backend equivalent', () => {
    // social_life has no good backend analogue — better to drop it than
    // lie about what the interaction meant
    expect(toBackendCategory('social_life')).toBeNull()
  })

  it('returns null for Supabase raw values not in CATEGORIES', () => {
    // `event` is a real Supabase category but isn't in the algorithm's
    // CATEGORIES list — would be silently ignored by _compute_weights
    // anyway, so we drop it explicitly
    expect(toBackendCategory('event')).toBeNull()
  })

  // ── Defensive null/undefined handling ──
  it('returns null for null/undefined/empty inputs', () => {
    expect(toBackendCategory(null)).toBeNull()
    expect(toBackendCategory(undefined)).toBeNull()
    expect(toBackendCategory('')).toBeNull()
  })

  it('returns null for unknown category strings', () => {
    expect(toBackendCategory('foo')).toBeNull()
    expect(toBackendCategory('random_category')).toBeNull()
    expect(toBackendCategory('LEGAL')).toBeNull() // case-sensitive
  })
})

describe('normalizeInteractionsLog', () => {
  it('passes through already-valid backend categories', () => {
    expect(normalizeInteractionsLog(['legal', 'health', 'job'])).toEqual(['legal', 'health', 'job'])
  })

  it('converts frontend categories to backend taxonomy', () => {
    expect(normalizeInteractionsLog(['healthcare', 'business', 'education'])).toEqual([
      'health',
      'job',
      'scholarship',
    ])
  })

  it('drops unmappable entries (social_life, event, unknown)', () => {
    expect(normalizeInteractionsLog(['legal', 'social_life', 'event', 'nonsense', 'job'])).toEqual([
      'legal',
      'job',
    ])
  })

  it('drops null and undefined entries', () => {
    expect(normalizeInteractionsLog(['legal', null, undefined, 'health'])).toEqual([
      'legal',
      'health',
    ])
  })

  it('returns empty array for empty input', () => {
    expect(normalizeInteractionsLog([])).toEqual([])
  })

  it('returns empty array when everything is unmappable', () => {
    expect(normalizeInteractionsLog(['social_life', 'event', null, ''])).toEqual([])
  })

  it('preserves interaction order (important for archetype weighting)', () => {
    // The algorithm's _compute_weights doesn't care about order but
    // duplicate counts matter — e.g. 3x "legal" should stay 3x "legal"
    expect(normalizeInteractionsLog(['legal', 'legal', 'healthcare', 'legal'])).toEqual([
      'legal',
      'legal',
      'health',
      'legal',
    ])
  })

  it('handles duplicate unmappable entries without crashing', () => {
    expect(normalizeInteractionsLog(['social_life', 'social_life', 'legal'])).toEqual(['legal'])
  })
})

describe('buildAiProfile', () => {
  it('builds a profile from a full OnboardingProfile', () => {
    expect(
      buildAiProfile({
        immigrationStatus: 'daca',
        preferredLanguage: 'spanish',
        occupations: ['student'],
      })
    ).toEqual({
      immigration_status: 'daca',
      preferred_language: 'es',
      occupation: 'student',
    })
  })

  it('maps preferredLanguage: "english" to "en"', () => {
    expect(
      buildAiProfile({
        immigrationStatus: 'citizen',
        preferredLanguage: 'english',
        occupations: ['worker'],
      })
    ).toMatchObject({ preferred_language: 'en' })
  })

  it('defaults to en if preferredLanguage is missing or unknown', () => {
    expect(buildAiProfile({ occupations: ['worker'] })).toMatchObject({
      preferred_language: 'en',
    })
  })

  it('uses only the first occupation when multiple are provided', () => {
    expect(
      buildAiProfile({
        occupations: ['student_worker', 'caregiver'],
      })
    ).toMatchObject({ occupation: 'student_worker' })
  })

  it('defaults to "employed" if occupations list is empty', () => {
    expect(buildAiProfile({ occupations: [] })).toMatchObject({
      occupation: 'employed',
    })
  })

  it('defaults to "citizen" if immigrationStatus is missing', () => {
    expect(buildAiProfile({})).toMatchObject({ immigration_status: 'citizen' })
  })

  it('returns sensible defaults for an undefined profile', () => {
    expect(buildAiProfile(undefined)).toEqual({
      immigration_status: 'citizen',
      preferred_language: 'en',
      occupation: 'employed',
    })
  })
})
