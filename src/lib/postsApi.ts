import { supabase } from '@/lib/supabase'

export interface Post {
  id: string
  user_id: string
  username: string
  content: string
  image_url: string | null
  category: string
  likes_count: number
  created_at: string
  liked_by_me: boolean
}

export type PostCategory = 'general' | 'question' | 'resource' | 'event' | 'story'

export async function fetchPosts(
  category: PostCategory | 'all' = 'all',
  limit = 30
): Promise<Post[]> {
  let q = supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(limit)

  if (category !== 'all') {
    q = q.eq('category', category)
  }

  const { data, error } = await q
  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }

  const posts = (data || []) as Post[]

  // Check which posts the current user has liked
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session?.user) {
    const postIds = posts.map(p => p.id)
    if (postIds.length > 0) {
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', session.user.id)
        .in('post_id', postIds)

      const likedIds = new Set((likes || []).map(l => l.post_id))
      return posts.map(p => ({ ...p, liked_by_me: likedIds.has(p.id) }))
    }
  }

  return posts.map(p => ({ ...p, liked_by_me: false }))
}

export async function createPost(
  content: string,
  category: PostCategory,
  imageUrl?: string
): Promise<Post | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) return null

  // Fetch username from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', session.user.id)
    .single()

  const username = profile?.username || 'Anonymous'

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: session.user.id,
      username,
      content,
      category,
      image_url: imageUrl || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating post:', error)
    return null
  }

  return { ...data, liked_by_me: false } as Post
}

export async function toggleLike(postId: string): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) return false

  // Check if already liked
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', session.user.id)
    .single()

  if (existing) {
    await supabase.from('post_likes').delete().eq('id', existing.id)
    // Update count
    const { count } = await supabase
      .from('post_likes')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId)
    await supabase
      .from('posts')
      .update({ likes_count: count || 0 })
      .eq('id', postId)
    return false
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: session.user.id })
    const { count } = await supabase
      .from('post_likes')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId)
    await supabase
      .from('posts')
      .update({ likes_count: count || 0 })
      .eq('id', postId)
    return true
  }
}

export async function deletePost(postId: string): Promise<boolean> {
  const { error } = await supabase.from('posts').delete().eq('id', postId)
  return !error
}
