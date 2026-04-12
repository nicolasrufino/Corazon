import { supabase } from '@/lib/supabase'

export interface Notification {
  id: string
  type: 'comment' | 'reply' | 'like'
  actor_username: string
  post_id: string | null
  comment_id: string | null
  preview: string
  read: boolean
  created_at: string
}

export async function fetchNotifications(limit = 20): Promise<Notification[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return (data || []) as Notification[]
}

export async function getUnreadCount(): Promise<number> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) return 0

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .eq('read', false)

  if (error) return 0
  return count || 0
}

export async function markAsRead(notificationId: string): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('id', notificationId)
}

export async function markAllAsRead(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) return

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', session.user.id)
    .eq('read', false)
}
