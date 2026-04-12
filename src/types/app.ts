export type AppLanguage = 'es' | 'en'

export type UiLanguagePreference = 'english' | 'spanish'

export type ImmigrationStatus =
  | 'citizen'
  | 'permanent_resident'
  | 'daca'
  | 'visa_holder'
  | 'undocumented'
  | 'prefer_not_to_say'

export type Occupation =
  | 'student'
  | 'worker'
  | 'student_worker'
  | 'job_seeker'
  | 'two_jobs'
  | 'retired'
  | 'caregiver'
  | 'other'

export type ResourceCategory =
  | 'legal'
  | 'healthcare'
  | 'immigration'
  | 'education'
  | 'community'
  | 'social_life'
  | 'financial_aid'
  | 'language_learning'
  | 'business'

export interface OnboardingProfile {
  countryOfOrigin?: string
  immigrationStatus?: ImmigrationStatus
  visaType?: string
  preferredLanguage: UiLanguagePreference
  occupations: Occupation[]
  goals: ResourceCategory[]
}

export interface User {
  id: string
  email: string
  username: string
  preferredAppLanguage: AppLanguage
  onboardingCompleted: boolean
  profile?: OnboardingProfile
}

export interface Resource {
  id: string
  name: string
  category: ResourceCategory
  // Raw Supabase opportunities.category — preserved so the recommend
  // algorithm can score interactions against its own 9-category
  // vocabulary (which only partially overlaps ResourceCategory). See
  // `toBackendCategory` in src/lib/aiApi.ts.
  rawCategory?: string
  description: string
  tags: string[]
  rating: number
  openNow: boolean
  verified: boolean
  distanceLabel: string
  address: string
  phone: string
  website: string
  languages: string[]
  imageUrl: string
  lastUpdated: string
}

export interface CommunityOrganization {
  id: string
  name: string
  category: ResourceCategory
  address: string
  phone: string
  languages: string[]
  openNow: boolean
  verified: boolean
  summary: string
}
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}
