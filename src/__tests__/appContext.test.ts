import { describe, expect, it } from 'vitest'
import type { Occupation } from '../types/app'

describe('profile data parsing', () => {
  // Replicate the occupation parsing logic from AppContext fetchProfile
  function parseOccupations(raw: string | null): Occupation[] {
    if (!raw) return []
    return raw.split(',').filter(Boolean) as Occupation[]
  }

  it('parses single occupation', () => {
    expect(parseOccupations('student')).toEqual(['student'])
  })

  it('parses multiple occupations', () => {
    expect(parseOccupations('student,worker')).toEqual(['student', 'worker'])
  })

  it('returns empty array for null', () => {
    expect(parseOccupations(null)).toEqual([])
  })

  it('returns empty array for empty string', () => {
    expect(parseOccupations('')).toEqual([])
  })

  it('filters out empty strings from split', () => {
    expect(parseOccupations('student,,worker')).toEqual(['student', 'worker'])
    expect(parseOccupations(',student,')).toEqual(['student'])
  })
})

describe('language mapping', () => {
  function mapLanguage(preference: string): 'es' | 'en' {
    return preference === 'english' ? 'en' : 'es'
  }

  it('maps english to en', () => {
    expect(mapLanguage('english')).toBe('en')
  })

  it('maps spanish to es', () => {
    expect(mapLanguage('spanish')).toBe('es')
  })

  it('defaults to es for unknown values', () => {
    expect(mapLanguage('')).toBe('es')
    expect(mapLanguage('both')).toBe('es')
  })
})

describe('onboarding completion check', () => {
  // The fix: check onboarding_completed field, not just row existence
  function isOnboardingComplete(profileData: { onboarding_completed?: boolean } | null): boolean {
    if (!profileData) return false
    return !!profileData.onboarding_completed
  }

  it('returns false for null profile', () => {
    expect(isOnboardingComplete(null)).toBe(false)
  })

  it('returns false when onboarding_completed is false', () => {
    expect(isOnboardingComplete({ onboarding_completed: false })).toBe(false)
  })

  it('returns false when onboarding_completed is undefined', () => {
    expect(isOnboardingComplete({})).toBe(false)
  })

  it('returns true when onboarding_completed is true', () => {
    expect(isOnboardingComplete({ onboarding_completed: true })).toBe(true)
  })
})
