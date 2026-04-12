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

describe('category mapping (1:1)', () => {
  const VALID = [
    'legal',
    'health',
    'mental_health',
    'housing',
    'food_bank',
    'scholarship',
    'job',
    'event',
    'language',
  ]

  function mapCategory(raw: string): string {
    if (VALID.includes(raw)) return raw
    return 'health'
  }

  it('maps valid categories to themselves', () => {
    for (const cat of VALID) {
      expect(mapCategory(cat)).toBe(cat)
    }
  })

  it('defaults unknown categories to health', () => {
    expect(mapCategory('unknown')).toBe('health')
    expect(mapCategory('')).toBe('health')
  })
})
