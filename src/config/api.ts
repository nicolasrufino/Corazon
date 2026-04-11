import { config } from '@/config/env'

export const API_CONFIG = {
  BASE_URL: config.apiUrl || 'http://localhost:8000',
  TIMEOUT: 10000,
}
