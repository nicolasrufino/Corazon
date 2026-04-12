import { supabase } from '@/lib/supabase'
import type { CommunityOrganization, Resource, ResourceCategory } from '@/types/app'

// Map Supabase opportunity_category enum → frontend ResourceCategory
const CATEGORY_MAP: Record<string, ResourceCategory> = {
  health: 'healthcare',
  mental_health: 'healthcare',
  legal: 'legal',
  housing: 'community',
  food_bank: 'community',
  event: 'community',
  scholarship: 'education',
  job: 'business',
  language: 'language_learning',
}

function mapCategory(raw: string): ResourceCategory {
  return CATEGORY_MAP[raw] || 'community'
}

interface OpportunityRow {
  id: string
  title: string
  organization: string
  description: string | null
  category: string
  address: string | null
  phone: string | null
  url: string | null
  location: string | null
  language_support: string | null
  tags: string[] | null
  neighborhood: string | null
  event_date: string | null
  scraped_at: string | null
}

function rowToResource(row: OpportunityRow): Resource {
  const tags = row.tags || []
  return {
    id: row.id,
    name: row.organization || row.title,
    category: mapCategory(row.category),
    description: row.description || '',
    tags: tags.filter(t => !['general', 'latino-specific'].includes(t)),
    rating: 0,
    openNow: false,
    verified: tags.includes('latino-specific'),
    distanceLabel: '',
    address: row.address || '',
    phone: row.phone || '',
    website: row.url || '',
    languages: row.language_support ? [row.language_support] : [],
    imageUrl: '',
    lastUpdated: row.scraped_at || '',
  }
}

function rowToOrganization(row: OpportunityRow): CommunityOrganization {
  const tags = row.tags || []
  return {
    id: row.id,
    name: row.organization || row.title,
    category: mapCategory(row.category),
    address: row.address || '',
    phone: row.phone || '',
    languages: row.language_support
      ? row.language_support.includes('Spanish')
        ? ['Español', 'English']
        : ['English']
      : ['English'],
    openNow: false,
    verified: tags.includes('latino-specific'),
    summary: row.description || row.title,
  }
}

interface ResourceQuery {
  search?: string
  category?: ResourceCategory | 'all'
}

export async function fetchResources(query: ResourceQuery): Promise<Resource[]> {
  let q = supabase.from('active_opportunities').select('*')

  // Map frontend category back to DB categories
  if (query.category && query.category !== 'all') {
    const dbCategories = Object.entries(CATEGORY_MAP)
      .filter(([, frontendCat]) => frontendCat === query.category)
      .map(([dbCat]) => dbCat)

    if (dbCategories.length > 0) {
      q = q.in('category', dbCategories)
    }
  }

  if (query.search?.trim()) {
    const s = query.search.trim()
    q = q.or(`title.ilike.%${s}%,organization.ilike.%${s}%,description.ilike.%${s}%`)
  }

  // Prioritize latino-specific, then sort by title
  const { data, error } = await q.order('title').limit(50)

  if (error) {
    console.error('Supabase fetch error:', error)
    return []
  }

  const rows = (data || []) as OpportunityRow[]

  // Sort so latino-specific come first
  rows.sort((a, b) => {
    const aLatino = (a.tags || []).includes('latino-specific') ? 0 : 1
    const bLatino = (b.tags || []).includes('latino-specific') ? 0 : 1
    return aLatino - bLatino
  })

  return rows.map(rowToResource)
}

export async function fetchCommunityOrganizations(
  category: ResourceCategory | 'all',
  language: 'all' | 'Español' | 'English'
): Promise<CommunityOrganization[]> {
  let q = supabase.from('active_opportunities').select('*')

  if (category && category !== 'all') {
    const dbCategories = Object.entries(CATEGORY_MAP)
      .filter(([, frontendCat]) => frontendCat === category)
      .map(([dbCat]) => dbCat)

    if (dbCategories.length > 0) {
      q = q.in('category', dbCategories)
    }
  }

  if (language === 'Español') {
    q = q.ilike('language_support', '%Spanish%')
  }

  const { data, error } = await q.order('title').limit(60)

  if (error) {
    console.error('Supabase fetch error:', error)
    return []
  }

  return ((data || []) as OpportunityRow[]).map(rowToOrganization)
}
