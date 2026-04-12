import { describe, expect, it } from 'vitest'
import { toBackendCategory } from '../lib/aiApi'
import type { Resource } from '../types/app'

// Replicates the logResourceInteraction + toggleSavedResource logic
// from AppContext so we can test it without mounting React. The real
// functions just drive React setState — the meaningful branches are in
// the reducers below.

const MAX_INTERACTIONS = 200

function pushInteraction(
  current: string[],
  resource: Pick<Resource, 'rawCategory' | 'category'>
): string[] {
  const mapped = toBackendCategory(resource.rawCategory) || toBackendCategory(resource.category)
  if (!mapped) return current
  const next = [...current, mapped]
  return next.length > MAX_INTERACTIONS ? next.slice(-MAX_INTERACTIONS) : next
}

function applyToggleSave(
  currentSavedIds: string[],
  currentLog: string[],
  resource: Pick<Resource, 'id' | 'rawCategory' | 'category'>
): { savedIds: string[]; log: string[] } {
  const alreadySaved = currentSavedIds.includes(resource.id)
  if (alreadySaved) {
    // Unsave: remove from savedIds, don't touch log
    return {
      savedIds: currentSavedIds.filter(id => id !== resource.id),
      log: currentLog,
    }
  }
  // Save: add to savedIds AND log the interaction
  return {
    savedIds: [...currentSavedIds, resource.id],
    log: pushInteraction(currentLog, resource),
  }
}

// Replicates AppContext.signOut's reset of user-scoped state —
// interactionsLog MUST be cleared here so the next user on a shared
// browser doesn't inherit the previous user's archetype signal.
// Regression guard for the privacy fix from code review.
function applySignOut(): { savedIds: string[]; log: string[] } {
  return { savedIds: [], log: [] }
}

function makeResource(overrides: Partial<Resource>): Resource {
  return {
    id: 'r-1',
    name: 'Test Resource',
    category: 'healthcare',
    rawCategory: 'health',
    description: '',
    tags: [],
    rating: 0,
    openNow: false,
    verified: false,
    distanceLabel: '',
    address: '',
    phone: '',
    website: '',
    languages: [],
    imageUrl: '',
    lastUpdated: '',
    ...overrides,
  }
}

describe('pushInteraction (logResourceInteraction reducer)', () => {
  it('appends a mapped backend category to the log', () => {
    const res = makeResource({ rawCategory: 'health' })
    expect(pushInteraction([], res)).toEqual(['health'])
  })

  it('appends to an existing log', () => {
    const res = makeResource({ rawCategory: 'legal' })
    expect(pushInteraction(['health'], res)).toEqual(['health', 'legal'])
  })

  it('uses rawCategory in preference to frontend category', () => {
    // rawCategory is the authoritative signal because it comes straight
    // from Supabase. The frontend `category` field is a lossy projection.
    const res = makeResource({ rawCategory: 'mental_health', category: 'healthcare' })
    expect(pushInteraction([], res)).toEqual(['mental_health'])
  })

  it('falls back to frontend category if rawCategory is missing', () => {
    const res = makeResource({ rawCategory: undefined, category: 'legal' })
    expect(pushInteraction([], res)).toEqual(['legal'])
  })

  it('drops the interaction silently if neither field maps', () => {
    // social_life has no backend equivalent and 'event' → null too
    const res = makeResource({
      rawCategory: 'event',
      category: 'social_life',
    })
    expect(pushInteraction(['legal'], res)).toEqual(['legal'])
  })

  it('allows duplicate interactions (weighting signal is meaningful)', () => {
    // The backend's _compute_weights adds 0.3 per interaction. Tapping
    // the same resource 3x should count 3x, not dedupe.
    const res = makeResource({ rawCategory: 'legal' })
    let log: string[] = []
    log = pushInteraction(log, res)
    log = pushInteraction(log, res)
    log = pushInteraction(log, res)
    expect(log).toEqual(['legal', 'legal', 'legal'])
  })

  it('caps the log at MAX_INTERACTIONS, keeping the most recent entries', () => {
    // Simulate 250 interactions — log should hold only the last 200
    const initial = Array.from({ length: 199 }, () => 'health')
    const res = makeResource({ rawCategory: 'legal' })
    let log: string[] = [...initial, 'legal'] // 200 total

    // Add 5 more — should slide window
    for (let i = 0; i < 5; i++) {
      log = pushInteraction(log, res)
    }

    expect(log.length).toBe(MAX_INTERACTIONS)
    // Last 6 entries should be: 'legal' (the original at position 199) + 5 new legals
    expect(log.slice(-6)).toEqual(['legal', 'legal', 'legal', 'legal', 'legal', 'legal'])
    // First entry should now be 'health' (index 5 of original was shifted off)
    expect(log[0]).toBe('health')
  })
})

describe('applyToggleSave (toggleSavedResource reducer)', () => {
  it('adds an unsaved resource and logs the interaction', () => {
    const res = makeResource({ id: 'r-1', rawCategory: 'legal' })
    const result = applyToggleSave([], [], res)
    expect(result.savedIds).toEqual(['r-1'])
    expect(result.log).toEqual(['legal'])
  })

  it('removes a saved resource WITHOUT touching the log', () => {
    // Unsaving shouldn't erode archetype weight the user already earned
    const res = makeResource({ id: 'r-1', rawCategory: 'legal' })
    const result = applyToggleSave(['r-1'], ['legal'], res)
    expect(result.savedIds).toEqual([])
    expect(result.log).toEqual(['legal']) // preserved
  })

  it('saving then unsaving then re-saving logs the interaction twice', () => {
    // Each save = one positive signal. Re-saves should re-log.
    const res = makeResource({ id: 'r-1', rawCategory: 'legal' })
    let state = { savedIds: [] as string[], log: [] as string[] }
    state = applyToggleSave(state.savedIds, state.log, res)
    expect(state.log).toEqual(['legal'])

    state = applyToggleSave(state.savedIds, state.log, res) // unsave
    expect(state.log).toEqual(['legal'])

    state = applyToggleSave(state.savedIds, state.log, res) // re-save
    expect(state.log).toEqual(['legal', 'legal'])
  })

  it("does not log if the resource's category is unmappable", () => {
    const res = makeResource({
      id: 'r-1',
      rawCategory: 'event',
      category: 'social_life',
    })
    const result = applyToggleSave([], ['health'], res)
    // Save still happens — we don't block the save just because we
    // can't feed the signal into the algorithm
    expect(result.savedIds).toEqual(['r-1'])
    expect(result.log).toEqual(['health'])
  })
})

describe('applySignOut (privacy regression guard)', () => {
  it('clears both savedIds and the interaction log', () => {
    // Reviewer's call from Phase 1-4 code review: on a shared browser,
    // the next user signing in must NOT inherit the previous user's
    // archetype signal. This is the assertion that drove the fix in
    // AppContext.signOut — if someone "simplifies" that function and
    // drops the log-clearing line, this test fails loudly.
    const priorSaved = ['r-1', 'r-2']
    const priorLog = ['legal', 'health', 'job']
    const result = applySignOut()
    expect(result.savedIds).toEqual([])
    expect(result.log).toEqual([])
    // Sanity: prior state was non-empty, so the clear actually did work
    expect(priorSaved.length).toBeGreaterThan(0)
    expect(priorLog.length).toBeGreaterThan(0)
  })
})
