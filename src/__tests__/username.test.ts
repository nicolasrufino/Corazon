import { describe, expect, it } from 'vitest'
import { generateUsername } from '../lib/username'

describe('generateUsername', () => {
  it('returns a string', () => {
    expect(typeof generateUsername()).toBe('string')
  })

  it('matches the pattern AdjectiveNoun000', () => {
    const name = generateUsername()
    // Starts with uppercase letter, has at least 2 uppercase-starting words, ends with 3 digits
    expect(name).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+\d{3}$/)
  })

  it('generates different usernames on multiple calls', () => {
    const names = new Set(Array.from({ length: 20 }, () => generateUsername()))
    // With 3.6M combos, 20 calls should all be unique (astronomically unlikely to collide)
    expect(names.size).toBeGreaterThan(15)
  })

  it('always has exactly 3 digits at the end', () => {
    for (let i = 0; i < 50; i++) {
      const name = generateUsername()
      const digits = name.match(/\d+$/)?.[0]
      expect(digits).toBeDefined()
      expect(digits!.length).toBe(3)
    }
  })
})
