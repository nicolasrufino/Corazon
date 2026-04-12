import { supabase } from '@/lib/supabase'

export interface SavedList {
  id: string
  name: string
  created_at: string
}

export interface SavedItem {
  id: string
  item_type: 'post' | 'resource'
  item_id: string
  list_id: string | null
  created_at: string
}

async function getUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user?.id || null
}

async function ensureDefaultList(userId: string): Promise<string> {
  const { data } = await supabase
    .from('saved_lists')
    .select('id')
    .eq('user_id', userId)
    .eq('name', 'Saved')
    .single()

  if (data) return data.id

  const { data: created } = await supabase
    .from('saved_lists')
    .insert({ user_id: userId, name: 'Saved' })
    .select('id')
    .single()

  return created?.id || ''
}

export async function fetchLists(): Promise<SavedList[]> {
  const userId = await getUserId()
  if (!userId) return []

  const { data } = await supabase
    .from('saved_lists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  return (data || []) as SavedList[]
}

export async function createList(name: string): Promise<SavedList | null> {
  const userId = await getUserId()
  if (!userId) return null

  // Max 20 lists
  const { count } = await supabase
    .from('saved_lists')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if ((count || 0) >= 20) return null

  const { data, error } = await supabase
    .from('saved_lists')
    .insert({ user_id: userId, name: name.slice(0, 50) })
    .select()
    .single()

  if (error) return null
  return data as SavedList
}

export async function deleteList(listId: string): Promise<boolean> {
  const { error } = await supabase.from('saved_lists').delete().eq('id', listId)
  return !error
}

export async function saveItem(
  itemType: 'post' | 'resource',
  itemId: string,
  listId?: string
): Promise<boolean> {
  const userId = await getUserId()
  if (!userId) return false

  const targetListId = listId || (await ensureDefaultList(userId))
  if (!targetListId) return false

  const { error } = await supabase.from('saved_items').insert({
    user_id: userId,
    list_id: targetListId,
    item_type: itemType,
    item_id: itemId,
  })

  return !error
}

export async function unsaveItem(itemType: string, itemId: string): Promise<boolean> {
  const userId = await getUserId()
  if (!userId) return false

  const { error } = await supabase
    .from('saved_items')
    .delete()
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)

  return !error
}

export async function fetchSavedItems(listId?: string): Promise<SavedItem[]> {
  const userId = await getUserId()
  if (!userId) return []

  let q = supabase
    .from('saved_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (listId) {
    q = q.eq('list_id', listId)
  }

  const { data } = await q
  return (data || []) as SavedItem[]
}

export async function isItemSaved(itemType: string, itemId: string): Promise<boolean> {
  const userId = await getUserId()
  if (!userId) return false

  const { count } = await supabase
    .from('saved_items')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)

  return (count || 0) > 0
}
