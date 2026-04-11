import { API_CONFIG } from '@/config/api'
import { mockCommunityOrganizations, mockResources } from '@/data/mockData'
import type {
  AnalyzerRecord,
  AppLanguage,
  ChatMessage,
  CommunityOrganization,
  Resource,
  ResourceCategory,
} from '@/types/app'

const NETWORK_DELAY = 450

const wait = (duration: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, duration)
  })

interface ResourceQuery {
  search?: string
  category?: ResourceCategory | 'all'
}

export const fetchResources = async (query: ResourceQuery): Promise<Resource[]> => {
  await wait(NETWORK_DELAY)

  const search = query.search?.trim().toLowerCase()
  const category = query.category ?? 'all'

  return mockResources.filter(resource => {
    const categoryMatches = category === 'all' || resource.category === category
    const searchMatches =
      !search ||
      resource.name.toLowerCase().includes(search) ||
      resource.description.toLowerCase().includes(search) ||
      resource.tags.some(tag => tag.toLowerCase().includes(search))

    return categoryMatches && searchMatches
  })
}

export const fetchCommunityOrganizations = async (
  category: ResourceCategory | 'all',
  language: 'all' | 'Español' | 'English'
): Promise<CommunityOrganization[]> => {
  await wait(NETWORK_DELAY)

  return mockCommunityOrganizations.filter(org => {
    const categoryMatches = category === 'all' || org.category === category
    const languageMatches = language === 'all' || org.languages.includes(language)
    return categoryMatches && languageMatches
  })
}

export const analyzeDocument = async (
  fileName: string,
  outputLanguage: AppLanguage
): Promise<AnalyzerRecord> => {
  await wait(1200)

  return {
    id: `analysis-${Date.now()}`,
    fileName,
    createdAt: new Date().toISOString(),
    outputLanguage,
    summary:
      outputLanguage === 'es'
        ? 'Este documento parece ser una notificación oficial con fecha límite. Resume requisitos, fechas y opciones de respuesta. Esta explicación es informativa y no reemplaza asesoría legal.'
        : 'This document appears to be an official notice with a response deadline. It summarizes requirements, dates, and response options. This explanation is informational only and does not replace legal advice.',
    nextSteps:
      outputLanguage === 'es'
        ? [
            'Verifica la fecha límite y guarda copia del documento.',
            'Consulta una organización legal verificada antes de responder.',
            'Prepara tus preguntas para una cita o chat de seguimiento.',
          ]
        : [
            'Verify the deadline and keep a copy of the document.',
            'Speak with a verified legal organization before responding.',
            'Prepare your questions for a follow-up visit or voice chat.',
          ],
  }
}

export const sendVoiceChatMessage = async (
  input: string,
  appLanguage: AppLanguage
): Promise<ChatMessage> => {
  await wait(800)

  const responseText =
    appLanguage === 'es'
      ? `Gracias por compartir: "${input}". Te recomiendo revisar recursos verificados de la categoría más relacionada y confirmar horarios antes de visitar.`
      : `Thanks for sharing: "${input}". I recommend checking verified resources in the most relevant category and confirming hours before visiting.`

  return {
    id: `assistant-${Date.now()}`,
    role: 'assistant',
    content: responseText,
    createdAt: new Date().toISOString(),
  }
}

export const apiInfo = {
  baseUrl: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
}
