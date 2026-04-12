import { describe, expect, it } from 'vitest'
import type { OnboardingProfile, User } from '../types/app'

// Replicates the in-memory user-reset logic from AppContext.deleteUserData.
// The key invariant: after deletion, onboardingCompleted MUST be false
// so the ProtectedRoute in App.tsx kicks the user back to /onboarding
// instead of showing stale dashboard UI. profile is undefined so no
// "Hello <stale_username>" copy leaks through.
function applyDeleteUserDataReset(prev: User | null): User | null {
  if (!prev) return null
  return { ...prev, onboardingCompleted: false, profile: undefined }
}

const SAMPLE_PROFILE: OnboardingProfile = {
  countryOfOrigin: 'Mexico',
  immigrationStatus: 'daca',
  preferredLanguage: 'spanish',
  occupations: ['worker'],
  goals: ['legal', 'health'],
}

const SAMPLE_USER: User = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  preferredAppLanguage: 'es',
  onboardingCompleted: true,
  profile: SAMPLE_PROFILE,
}

describe('deleteUserData → user state reset', () => {
  it('flips onboardingCompleted from true to false', () => {
    const after = applyDeleteUserDataReset(SAMPLE_USER)
    expect(after?.onboardingCompleted).toBe(false)
  })

  it('clears the profile so stale data is not shown', () => {
    const after = applyDeleteUserDataReset(SAMPLE_USER)
    expect(after?.profile).toBeUndefined()
  })

  it('preserves id, email, username, and app language', () => {
    // The auth row still exists — only the profile row was wiped.
    // We must not lose who the user is, or we can't display the
    // "Hello X" header or auto-resume their session.
    const after = applyDeleteUserDataReset(SAMPLE_USER)
    expect(after?.id).toBe('user-1')
    expect(after?.email).toBe('test@example.com')
    expect(after?.username).toBe('testuser')
    expect(after?.preferredAppLanguage).toBe('es')
  })

  it('returns null when there was no user (guest)', () => {
    // Calling delete on a guest session should be a no-op that
    // returns null, not throw. Guards against a button-click on an
    // anonymous session.
    expect(applyDeleteUserDataReset(null)).toBeNull()
  })

  it('does not re-use the same object reference (new object, safe for React state)', () => {
    // React needs a NEW reference for useState setter to re-render.
    // If we mutated `prev` in place, subscribers wouldn't see the
    // update.
    const after = applyDeleteUserDataReset(SAMPLE_USER)
    expect(after).not.toBe(SAMPLE_USER)
  })
})
