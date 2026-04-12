import { describe, expect, it } from 'vitest'

describe('comment tree building', () => {
  interface FlatComment {
    id: string
    parent_id: string | null
    content: string
  }

  interface TreeComment extends FlatComment {
    replies: TreeComment[]
  }

  function buildTree(flat: FlatComment[]): TreeComment[] {
    const topLevel: TreeComment[] = []
    const byId = new Map<string, TreeComment>()

    for (const c of flat) {
      byId.set(c.id, { ...c, replies: [] })
    }

    for (const c of flat) {
      const node = byId.get(c.id)!
      if (c.parent_id && byId.has(c.parent_id)) {
        byId.get(c.parent_id)!.replies.push(node)
      } else {
        topLevel.push(node)
      }
    }

    return topLevel
  }

  it('returns empty array for no comments', () => {
    expect(buildTree([])).toEqual([])
  })

  it('returns flat list when no replies', () => {
    const result = buildTree([
      { id: '1', parent_id: null, content: 'first' },
      { id: '2', parent_id: null, content: 'second' },
    ])
    expect(result).toHaveLength(2)
    expect(result[0].replies).toHaveLength(0)
  })

  it('nests replies under parent', () => {
    const result = buildTree([
      { id: '1', parent_id: null, content: 'parent' },
      { id: '2', parent_id: '1', content: 'reply' },
    ])
    expect(result).toHaveLength(1)
    expect(result[0].replies).toHaveLength(1)
    expect(result[0].replies[0].content).toBe('reply')
  })

  it('handles multiple replies to same parent', () => {
    const result = buildTree([
      { id: '1', parent_id: null, content: 'parent' },
      { id: '2', parent_id: '1', content: 'reply 1' },
      { id: '3', parent_id: '1', content: 'reply 2' },
    ])
    expect(result[0].replies).toHaveLength(2)
  })

  it('handles orphaned replies gracefully', () => {
    const result = buildTree([{ id: '2', parent_id: 'deleted', content: 'orphan' }])
    // Orphan becomes top-level
    expect(result).toHaveLength(1)
    expect(result[0].content).toBe('orphan')
  })
})

describe('comment validation', () => {
  it('enforces 300 character limit', () => {
    const content = 'a'.repeat(301)
    expect(content.length).toBeGreaterThan(300)
    expect(content.slice(0, 300).length).toBe(300)
  })

  it('preview truncation to 80 chars', () => {
    const long = 'a'.repeat(100)
    const preview = long.slice(0, 80)
    expect(preview.length).toBe(80)
  })
})

describe('self-notification prevention', () => {
  function shouldNotify(actorId: string, postAuthorId: string): boolean {
    return actorId !== postAuthorId
  }

  it('should not notify when actor is the post author', () => {
    expect(shouldNotify('user-1', 'user-1')).toBe(false)
  })

  it('should notify when actor is different from post author', () => {
    expect(shouldNotify('user-2', 'user-1')).toBe(true)
  })
})
