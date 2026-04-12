import { supabase } from '@/lib/supabase'

export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  username: string
  content: string
  created_at: string
  replies: Comment[]
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  const flat = data as Omit<Comment, 'replies'>[]
  const topLevel: Comment[] = []
  const byId = new Map<string, Comment>()

  // First pass: create all comment objects with empty replies
  for (const c of flat) {
    const comment: Comment = { ...c, replies: [] }
    byId.set(c.id, comment)
  }

  // Second pass: nest replies under parents
  for (const c of flat) {
    const comment = byId.get(c.id)!
    if (c.parent_id && byId.has(c.parent_id)) {
      byId.get(c.parent_id)!.replies.push(comment)
    } else {
      topLevel.push(comment)
    }
  }

  return topLevel
}

export async function createComment(
  postId: string,
  content: string,
  parentId?: string
): Promise<Comment | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', session.user.id)
    .single()

  const username = profile?.username || 'Anonymous'

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: session.user.id,
      parent_id: parentId || null,
      username,
      content,
    })
    .select()
    .single()

  if (error || !data) return null

  // Increment comment count on the post
  const { data: post } = await supabase
    .from('posts')
    .select('comments_count,user_id')
    .eq('id', postId)
    .single()

  if (post) {
    await supabase
      .from('posts')
      .update({ comments_count: (post.comments_count || 0) + 1 })
      .eq('id', postId)

    // Create notification for post author (don't notify yourself)
    if (post.user_id !== session.user.id) {
      await supabase.from('notifications').insert({
        user_id: post.user_id,
        type: parentId ? 'reply' : 'comment',
        actor_username: username,
        actor_user_id: session.user.id,
        post_id: postId,
        comment_id: data.id,
        preview: content.slice(0, 80),
      })
    }

    // If replying, also notify the parent comment author
    if (parentId) {
      const { data: parentComment } = await supabase
        .from('comments')
        .select('user_id')
        .eq('id', parentId)
        .single()

      if (
        parentComment &&
        parentComment.user_id !== session.user.id &&
        parentComment.user_id !== post.user_id
      ) {
        await supabase.from('notifications').insert({
          user_id: parentComment.user_id,
          type: 'reply',
          actor_username: username,
          actor_user_id: session.user.id,
          post_id: postId,
          comment_id: data.id,
          preview: content.slice(0, 80),
        })
      }
    }
  }

  return { ...data, replies: [] } as Comment
}

export async function deleteComment(commentId: string, postId: string): Promise<boolean> {
  // Count how many comments will be deleted (this one + its replies)
  const { data: replies } = await supabase.from('comments').select('id').eq('parent_id', commentId)

  const totalDeleted = 1 + (replies?.length || 0)

  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) return false

  // Decrement comment count
  const { data: post } = await supabase
    .from('posts')
    .select('comments_count')
    .eq('id', postId)
    .single()

  if (post) {
    await supabase
      .from('posts')
      .update({ comments_count: Math.max(0, (post.comments_count || 0) - totalDeleted) })
      .eq('id', postId)
  }

  return true
}
