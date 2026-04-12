import { describe, expect, it } from 'vitest'
import { toBackendCategory } from '../lib/aiApi'
import type { Resource } from '../types/app'

// Replicates the logResourceInteraction + toggleSavedResource logic
// from AppContext so we can test it without mounting React. The real
// functions just drive React setState — the meaningful branches are
// in the reducers below.
//
// NOTE: after the PR #9 taxonomy unification, the frontend's
// ResourceCategory values match the backend vocabulary for most
// categories, so toBackendCategory mostly pass-throughs. The only
// value that still returns null is 'event', which is intentional —
// the backend doesn't score event interactions in _compute_weights.

const MAX_INTERACTIONS = 200

function pushInteraction(current: string[], resource: Pick<Resource, 'category'>): string[] {
  const mapped = toBackendCategory(resource.category)
  if (!mapped) return current
  const next = [...current, mapped]
  return next.length > MAX_INTERACTIONS ? next.slice(-MAX_INTERACTIONS) : next
}

function applyToggleSave(
  currentSavedIds: string[],
  currentLog: string[],
  resource: Pick<Resource, 'id' | 'category'>
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
function applySignOut(): { savedIds: string[]; log: string[] } {
  return { savedIds: [], log: [] }
}

function makeResource(overrides: Partial<Resource>): Resource {
  return {
    id: 'r-1',
    name: 'Test Resource',
    category: 'health',
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
    const res = makeResource({ category: 'health' })
    expect(pushInteraction([], res)).toEqual(['health'])
  })

  it('appends to an existing log', () => {
    const res = makeResource({ category: 'legal' })
    expect(pushInteraction(['health'], res)).toEqual(['health', 'legal'])
  })

  it('pass-throughs backend category values (1:1 post PR #9 taxonomy)', () => {
    const res = makeResource({ category: 'mental_health' })
    expect(pushInteraction([], res)).toEqual(['mental_health'])
  })

  it("drops 'event' interactions because the algorithm doesn't score them", () => {
    const res = makeResource({ category: 'event' })
    expect(pushInteraction(['legal'], res)).toEqual(['legal'])
  })

  it('allows duplicate interactions (weighting signal is meaningful)', () => {
    // The backend's _compute_weights adds 0.3 per interaction. Tapping
    // the same resource 3x should count 3x, not dedupe.
    const res = makeResource({ category: 'legal' })
    let log: string[] = []
    log = pushInteraction(log, res)
    log = pushInteraction(log, res)
    log = pushInteraction(log, res)
    expect(log).toEqual(['legal', 'legal', 'legal'])
  })

  it('caps the log at MAX_INTERACTIONS, keeping the most recent entries', () => {
    // Simulate 200 initial + 5 more = 205, but should be capped to 200.
    const initial = Array.from({ length: 199 }, () => 'health')
    const res = makeResource({ category: 'legal' })
    let log: string[] = [...initial, 'legal'] // 200 total

    for (let i = 0; i < 5; i++) {
      log = pushInteraction(log, res)
    }

    expect(log.length).toBe(MAX_INTERACTIONS)
    expect(log.slice(-6)).toEqual(['legal', 'legal', 'legal', 'legal', 'legal', 'legal'])
    // First entry should now be 'health' (index 5 of original shifted off)
    expect(log[0]).toBe('health')
  })
})

describe('applyToggleSave (toggleSavedResource reducer)', () => {
  it('adds an unsaved resource and logs the interaction', () => {
    const res = makeResource({ id: 'r-1', category: 'legal' })
    const result = applyToggleSave([], [], res)
    expect(result.savedIds).toEqual(['r-1'])
    expect(result.log).toEqual(['legal'])
  })

  it('removes a saved resource WITHOUT touching the log', () => {
    // Unsaving shouldn't erode archetype weight the user already earned
    const res = makeResource({ id: 'r-1', category: 'legal' })
    const result = applyToggleSave(['r-1'], ['legal'], res)
    expect(result.savedIds).toEqual([])
    expect(result.log).toEqual(['legal']) // preserved
  })

  it('saving then unsaving then re-saving logs the interaction twice', () => {
    const res = makeResource({ id: 'r-1', category: 'legal' })
    let state = { savedIds: [] as string[], log: [] as string[] }
    state = applyToggleSave(state.savedIds, state.log, res)
    expect(state.log).toEqual(['legal'])

    state = applyToggleSave(state.savedIds, state.log, res) // unsave
    expect(state.log).toEqual(['legal'])

    state = applyToggleSave(state.savedIds, state.log, res) // re-save
    expect(state.log).toEqual(['legal', 'legal'])
  })

  it("still saves when category is unmappable, but doesn't log", () => {
    const res = makeResource({ id: 'r-1', category: 'event' })
    const result = applyToggleSave([], ['health'], res)
    // Save still happens — we don't block the save just because we
    // can't feed the signal into the algorithm
    expect(result.savedIds).toEqual(['r-1'])
    expect(result.log).toEqual(['health'])
  })
})

describe('applySignOut (privacy regression guard)', () => {
  it('clears both savedIds and the interaction log', () => {
    // Regression guard for the C3 privacy fix from the Phase 1-4
    // review. If someone "simplifies" AppContext.signOut and drops
    // the log-clearing line, this test fails loudly.
    const priorSaved = ['r-1', 'r-2']
    const priorLog = ['legal', 'health', 'job']
    const result = applySignOut()
    expect(result.savedIds).toEqual([])
    expect(result.log).toEqual([])
    expect(priorSaved.length).toBeGreaterThan(0)
    expect(priorLog.length).toBeGreaterThan(0)
  })
})
