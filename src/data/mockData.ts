import type { CommunityOrganization, Resource } from '@/types/app'

export const resourceCategories = [
  { key: 'health', labelEs: 'Salud', labelEn: 'Health' },
  { key: 'mental_health', labelEs: 'Salud mental', labelEn: 'Mental Health' },
  { key: 'legal', labelEs: 'Legal', labelEn: 'Legal Aid' },
  { key: 'housing', labelEs: 'Vivienda', labelEn: 'Housing' },
  { key: 'food_bank', labelEs: 'Alimentos', labelEn: 'Food' },
  { key: 'scholarship', labelEs: 'Becas', labelEn: 'Scholarships' },
  { key: 'job', labelEs: 'Trabajo', labelEn: 'Jobs' },
  { key: 'event', labelEs: 'Eventos', labelEn: 'Events' },
  { key: 'language', labelEs: 'Idiomas', labelEn: 'Language' },
] as const

export const mockResources: Resource[] = [
  {
    id: 'res-1',
    name: 'Centro Esperanza Legal Clinic',
    category: 'legal',
    description:
      'Consultas legales asequibles con orientación clara para familias inmigrantes y citas bilingües.',
    tags: ['Trusted partner', 'Low-cost consult', 'Family cases'],
    rating: 4.8,
    openNow: true,
    verified: true,
    distanceLabel: '1.2 mi',
    address: '2540 W 26th St, Chicago, IL',
    phone: '(312) 555-0142',
    website: 'https://example.org/esperanza',
    languages: ['Español', 'English'],
    imageUrl:
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
    lastUpdated: '2026-02-11',
  },
  {
    id: 'res-2',
    name: 'Salud Para Todos Community Health',
    category: 'health',
    description:
      'Atención primaria, vacunas y apoyo prenatal con tarifas según ingresos y personal hispanohablante.',
    tags: ['Open evenings', 'Walk-ins', 'Pediatric care'],
    rating: 4.7,
    openNow: true,
    verified: true,
    distanceLabel: '2.8 mi',
    address: '1938 S Blue Island Ave, Chicago, IL',
    phone: '(773) 555-0891',
    website: 'https://example.org/salud',
    languages: ['Español', 'English'],
    imageUrl:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    lastUpdated: '2026-02-09',
  },
  {
    id: 'res-3',
    name: 'Puentes Workforce & ESL Hub',
    category: 'language',
    description:
      'Clases de inglés, talleres de entrevistas y conexión laboral para recién llegados.',
    tags: ['Evening classes', 'Job placement', 'Bilingual staff'],
    rating: 4.6,
    openNow: false,
    verified: true,
    distanceLabel: 'Online + 3.4 mi',
    address: 'Online / 4125 W Armitage Ave, Chicago, IL',
    phone: '(872) 555-4430',
    website: 'https://example.org/puentes',
    languages: ['Español', 'English'],
    imageUrl:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    lastUpdated: '2026-02-05',
  },
  {
    id: 'res-4',
    name: 'Casa Latina Financial Support Desk',
    category: 'food_bank',
    description:
      'Asistencia para renta, alimentos y programas de emergencia con orientación segura y privada.',
    tags: ['Emergency aid', 'Confidential', 'Local grants'],
    rating: 4.9,
    openNow: true,
    verified: true,
    distanceLabel: '0.9 mi',
    address: '1712 W Cermak Rd, Chicago, IL',
    phone: '(312) 555-9921',
    website: 'https://example.org/casalatina',
    languages: ['Español', 'English'],
    imageUrl:
      'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1200&q=80',
    lastUpdated: '2026-02-08',
  },
  {
    id: 'res-5',
    name: 'Raíces Immigration Family Center',
    category: 'legal',
    description:
      'Orientación migratoria en lenguaje sencillo con rutas de apoyo comunitario verificadas.',
    tags: ['Know-your-rights', 'Workshops', 'Referrals'],
    rating: 4.7,
    openNow: true,
    verified: false,
    distanceLabel: '4.1 mi',
    address: '3201 W North Ave, Chicago, IL',
    phone: '(773) 555-1290',
    website: 'https://example.org/raices',
    languages: ['Español'],
    imageUrl:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    lastUpdated: '2026-01-29',
  },
]

export const mockCommunityOrganizations: CommunityOrganization[] = [
  {
    id: 'org-1',
    name: 'Centro Comunitario El Camino',
    category: 'event',
    address: '2215 S Kedzie Ave, Chicago, IL',
    phone: '(773) 555-0202',
    languages: ['Español', 'English'],
    openNow: true,
    verified: true,
    summary:
      'Red de apoyo para familias nuevas en la ciudad con talleres, asesoría y eventos barriales.',
  },
  {
    id: 'org-2',
    name: 'Legal Aid Unidos',
    category: 'legal',
    address: '1880 N Milwaukee Ave, Chicago, IL',
    phone: '(312) 555-7112',
    languages: ['Español', 'English'],
    openNow: true,
    verified: true,
    summary:
      'Clínicas legales semanales con intérpretes y seguimiento de casos de inmigración y vivienda.',
  },
  {
    id: 'org-3',
    name: 'Mujeres Adelante Wellness Collective',
    category: 'health',
    address: '4500 S Ashland Ave, Chicago, IL',
    phone: '(773) 555-3389',
    languages: ['Español'],
    openNow: false,
    verified: true,
    summary:
      'Bienestar integral para mujeres latinas: salud mental, grupos de apoyo y navegación clínica.',
  },
  {
    id: 'org-4',
    name: 'Futuro Joven Academy',
    category: 'scholarship',
    address: '3012 W 47th St, Chicago, IL',
    phone: '(872) 555-8140',
    languages: ['Español', 'English'],
    openNow: true,
    verified: false,
    summary:
      'Programas de becas, mentorías y guía universitaria para estudiantes de primera generación.',
  },
  {
    id: 'org-5',
    name: 'La Plaza Small Business Circle',
    category: 'job',
    address: '1122 W 18th St, Chicago, IL',
    phone: '(312) 555-6201',
    languages: ['Español', 'English'],
    openNow: true,
    verified: true,
    summary:
      'Apoyo para emprendedores latinos: licencias, microcréditos y asesoría de crecimiento.',
  },
]
