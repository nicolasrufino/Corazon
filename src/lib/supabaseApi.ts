import { supabase } from '@/lib/supabase'
import type { CommunityOrganization, Resource, ResourceCategory } from '@/types/app'

// Sanitize search input for PostgREST .or() filter to prevent injection
function sanitizeSearch(input: string): string {
  return input.replace(/[%(),.*\\]/g, ' ').trim()
}

// DB categories map 1:1 to frontend categories now
const VALID_CATEGORIES: ResourceCategory[] = [
  'legal',
  'health',
  'mental_health',
  'housing',
  'food_bank',
  'scholarship',
  'job',
  'event',
  'language',
]

function mapCategory(raw: string): ResourceCategory {
  if (VALID_CATEGORIES.includes(raw as ResourceCategory)) return raw as ResourceCategory
  return 'health' // safe default
}

// Category-based Unsplash images so cards aren't blank
const CATEGORY_IMAGES: Record<string, string> = {
  health:
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
  mental_health:
    'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80',
  legal:
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
  housing:
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
  food_bank:
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
  event:
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  scholarship:
    'https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&w=800&q=80',
  job: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80',
  language:
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
}

// Generate a helpful description when the DB one is empty or too short
const CATEGORY_DESCRIPTIONS: Record<string, { es: string; en: string }> = {
  health: {
    es: 'Centro de salud comunitario con servicios accesibles para familias.',
    en: 'Community health center with accessible services for families.',
  },
  mental_health: {
    es: 'Apoyo en salud mental, consejería y servicios de bienestar emocional.',
    en: 'Mental health support, counseling, and emotional wellness services.',
  },
  legal: {
    es: 'Asistencia legal para temas migratorios, vivienda y derechos civiles.',
    en: 'Legal assistance for immigration, housing, and civil rights.',
  },
  housing: {
    es: 'Apoyo con vivienda, refugio temporal y recursos de emergencia.',
    en: 'Housing assistance, temporary shelter, and emergency resources.',
  },
  food_bank: {
    es: 'Banco de alimentos y despensa comunitaria con acceso gratuito.',
    en: 'Food bank and community pantry with free access.',
  },
  event: {
    es: 'Organización comunitaria latina con eventos y recursos culturales.',
    en: 'Latino community organization with cultural events and resources.',
  },
  scholarship: {
    es: 'Oportunidades educativas, becas y programas de apoyo estudiantil.',
    en: 'Educational opportunities, scholarships, and student support.',
  },
  job: {
    es: 'Programa de capacitación laboral y desarrollo profesional.',
    en: 'Workforce training and professional development program.',
  },
  language: {
    es: 'Clases de inglés y programas de aprendizaje de idiomas.',
    en: 'English classes and language learning programs.',
  },
}

function buildDescription(row: {
  description: string | null
  category: string
  organization: string
  address: string | null
  tags: string[] | null
}): string {
  // If we have a real description that's not just a URL, use it
  if (row.description && row.description.length > 20 && !row.description.startsWith('http')) {
    return row.description
  }

  // Build a helpful description from what we know
  const fallback = CATEGORY_DESCRIPTIONS[row.category]?.en || ''
  const location = row.address ? ` Located at ${row.address}.` : ''
  const isLatino = (row.tags || []).includes('latino-specific')
  const focus = isLatino ? ' Serves the Latino community.' : ''

  return `${row.organization} — ${fallback}${location}${focus}`
}

// Clean up org name — never show a URL as the title
function cleanName(org: string, title: string): string {
  // Prefer organization, fall back to title
  const name = org || title
  // If it looks like a URL, try the other field
  if (name.startsWith('http') || name.includes('.com') || name.includes('.org')) {
    const alt = org === name ? title : org
    if (alt && !alt.startsWith('http')) return alt
    // Last resort: extract domain name
    try {
      return new URL(name).hostname.replace('www.', '')
    } catch {
      return name
    }
  }
  // Strip trailing " — SchoolName" from university org titles if org has it
  return name
}

export type SortOption = 'relevance' | 'latino_first' | 'recent' | 'az'

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
  const isLatino = tags.includes('latino-specific')
  const displayTags = tags.filter(
    t => !['general', 'latino-specific', 'vocational', 'trade', 'workforce'].includes(t)
  )
  if (isLatino) displayTags.unshift('Latino-focused')

  return {
    id: row.id,
    name: cleanName(row.organization, row.title),
    category: mapCategory(row.category),
    description: buildDescription(row),
    tags: displayTags.slice(0, 4),
    rating: 0,
    openNow: false,
    verified: isLatino,
    distanceLabel: row.location || '',
    address: row.address || '',
    phone: row.phone || '',
    website: row.url || '',
    languages: row.language_support ? [row.language_support] : [],
    imageUrl: CATEGORY_IMAGES[row.category] || CATEGORY_IMAGES.event,
    lastUpdated: row.scraped_at || '',
  }
}

function rowToOrganization(row: OpportunityRow): CommunityOrganization {
  const tags = row.tags || []
  return {
    id: row.id,
    name: cleanName(row.organization, row.title),
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
    summary: buildDescription(row),
  }
}

function sortRows(rows: OpportunityRow[], sort: SortOption): OpportunityRow[] {
  switch (sort) {
    case 'latino_first':
      return [...rows].sort((a, b) => {
        const aL = (a.tags || []).includes('latino-specific') ? 0 : 1
        const bL = (b.tags || []).includes('latino-specific') ? 0 : 1
        return aL - bL || (a.organization || '').localeCompare(b.organization || '')
      })
    case 'recent':
      return [...rows].sort((a, b) => {
        const da = a.scraped_at || ''
        const db = b.scraped_at || ''
        return db.localeCompare(da)
      })
    case 'az':
      return [...rows].sort((a, b) => (a.organization || '').localeCompare(b.organization || ''))
    case 'relevance':
    default:
      // Latino first, then by category importance
      return [...rows].sort((a, b) => {
        const aL = (a.tags || []).includes('latino-specific') ? 0 : 1
        const bL = (b.tags || []).includes('latino-specific') ? 0 : 1
        if (aL !== bL) return aL - bL
        // Then by whether it has a description
        const aDesc = a.description && a.description.length > 20 ? 0 : 1
        const bDesc = b.description && b.description.length > 20 ? 0 : 1
        return aDesc - bDesc
      })
  }
}

interface ResourceQuery {
  search?: string
  category?: ResourceCategory | 'all'
  sort?: SortOption
  latinoOnly?: boolean
}

export async function fetchResources(query: ResourceQuery): Promise<Resource[]> {
  let q = supabase.from('active_opportunities').select('*')

  if (query.category && query.category !== 'all') {
    q = q.eq('category', query.category)
  }

  if (query.latinoOnly) {
    q = q.contains('tags', ['latino-specific'])
  }

  if (query.search?.trim()) {
    const s = sanitizeSearch(query.search)
    if (s) {
      q = q.or(`title.ilike.%${s}%,organization.ilike.%${s}%,description.ilike.%${s}%`)
    }
  }

  const { data, error } = await q.order('title').limit(50)

  if (error) {
    console.error('Supabase fetch error:', error)
    return []
  }

  const rows = sortRows((data || []) as OpportunityRow[], query.sort || 'relevance')
  return rows.map(rowToResource)
}

export async function fetchCommunityOrganizations(
  category: ResourceCategory | 'all',
  sort: SortOption = 'relevance'
): Promise<CommunityOrganization[]> {
  let q = supabase.from('active_opportunities').select('*')

  if (category && category !== 'all') {
    q = q.eq('category', category)
  }

  const { data, error } = await q.order('title').limit(60)

  if (error) {
    console.error('Supabase fetch error:', error)
    return []
  }

  const rows = sortRows((data || []) as OpportunityRow[], sort)
  return rows.map(rowToOrganization)
}
