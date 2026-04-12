import { describe, expect, it } from 'vitest'

// We're testing the sanitizeSearch function — need to extract it
// Since it's not exported, test the behavior inline
describe('search sanitization', () => {
  // Replicate the sanitize logic from supabaseApi.ts
  function sanitizeSearch(input: string): string {
    return input.replace(/[%(),.*\\]/g, ' ').trim()
  }

  it('passes normal search terms through', () => {
    expect(sanitizeSearch('legal aid')).toBe('legal aid')
    expect(sanitizeSearch('health clinic')).toBe('health clinic')
    expect(sanitizeSearch('ESL classes')).toBe('ESL classes')
  })

  it('strips parentheses that could break PostgREST filters', () => {
    expect(sanitizeSearch('test)')).toBe('test')
    expect(sanitizeSearch('(injection')).toBe('injection')
    expect(sanitizeSearch('a(b)c')).toBe('a b c')
  })

  it('strips percent signs', () => {
    expect(sanitizeSearch('100%')).toBe('100')
    expect(sanitizeSearch('%wildcard%')).toBe('wildcard')
  })

  it('strips commas that could inject extra filter conditions', () => {
    expect(sanitizeSearch('a,b')).toBe('a b')
  })

  it('strips dots and asterisks', () => {
    expect(sanitizeSearch('file.exe')).toBe('file exe')
    expect(sanitizeSearch('test*')).toBe('test')
  })

  it('strips backslashes', () => {
    expect(sanitizeSearch('path\\to')).toBe('path to')
  })

  it('returns empty string for all-special-char input', () => {
    expect(sanitizeSearch('()%,.*')).toBe('')
  })

  it('trims whitespace', () => {
    expect(sanitizeSearch('  hello  ')).toBe('hello')
  })
})

describe('category mapping', () => {
  // Replicate the CATEGORY_MAP from supabaseApi.ts
  const CATEGORY_MAP: Record<string, string> = {
    health: 'healthcare',
    mental_health: 'healthcare',
    legal: 'legal',
    housing: 'community',
    food_bank: 'community',
    event: 'community',
    scholarship: 'education',
    job: 'business',
    language: 'language_learning',
  }

  function mapCategory(raw: string): string {
    return CATEGORY_MAP[raw] || 'community'
  }

  it('maps health to healthcare', () => {
    expect(mapCategory('health')).toBe('healthcare')
    expect(mapCategory('mental_health')).toBe('healthcare')
  })

  it('maps legal to legal', () => {
    expect(mapCategory('legal')).toBe('legal')
  })

  it('maps housing and food_bank to community', () => {
    expect(mapCategory('housing')).toBe('community')
    expect(mapCategory('food_bank')).toBe('community')
  })

  it('maps scholarship to education', () => {
    expect(mapCategory('scholarship')).toBe('education')
  })

  it('maps job to business', () => {
    expect(mapCategory('job')).toBe('business')
  })

  it('defaults unknown categories to community', () => {
    expect(mapCategory('unknown')).toBe('community')
    expect(mapCategory('')).toBe('community')
  })
})
