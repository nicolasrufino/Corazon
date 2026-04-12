import { createContext, useContext, type ReactNode } from 'react'
import { useAppContext } from '@/context/AppContext'

export type Lang = 'EN' | 'ES'

type Dict = Record<string, string>

const dictionaries: Record<Lang, Dict> = {
  EN: {
    // Navbar
    'nav.about': 'About',
    'nav.faq': 'FAQ',
    'nav.resources': 'The Team',
    'nav.join': 'Join',
    'nav.joinAria': 'Join Corazon',

    // Hero
    'hero.subtitle': 'For Latinos, by Latinos.',
    'hero.scroll': 'Scroll',

    // About
    'about.overline': 'About Us',
    'about.heading.pre': 'Building Community,',
    'about.heading.accent': 'Together',
    'about.p1':
      "Corazón was born from a simple truth: people need resources, but they don't have the time to search for them. We're building the digital plaza where Latino voices, stories, and resources come together - a space that honors our culture while empowering our future. From first-generation college students seeking mentorship to undocumented immigrants looking for employment opportunities, Corazón is the bridge between needs and achievements.",
    'about.p2':
      "We believe bureaucracy should serve the people, not the other way around. Every feature we build is shaped by the lived experiences of our community - bilingual by design, culturally rooted, and radically inclusive. Whether you're in Los Angeles, San Juan, or Mexico City, Corazón is your home. We're not just building an app; we're nurturing a movement that takes back the time Latinos so desperately deserve",

    // Stats
    'stats.1.value': '77%',
    'stats.1.label': 'of undocumented immigrants in the U.S. are Latino.',
    'stats.2.value': 'only 9%',
    'stats.2.label': 'of international students in the U.S. come from Latin America.',
    'stats.3.value': '8%',
    'stats.3.label': 'of U.S. STEM workers are Latino, despite being 19% of the population.',
    'stats.4.value': 'only 4%',
    'stats.4.label': 'of Fortune 500 CEOs are Hispanic.',
    'stats.4.emphasis': 'We plan to change that.',

    // FAQ
    'faq.overline': 'FAQ',
    'faq.heading.pre': 'Common',
    'faq.heading.accent': 'Questions',
    'faq.1.q': 'What is Corazon?',
    'faq.1.a':
      'Corazon is a community-driven platform designed specifically for the Latino community. We provide a space to connect with others, access resources, find mentorship, and celebrate our shared cultural heritage - all in a bilingual, culturally-rooted environment.',
    'faq.2.q': 'Is Corazon free to use?',
    'faq.2.a':
      'Yes! Corazon is completely free for all community members. We believe access to community and resources should never be gated by cost. Our platform is sustained through partnerships with organizations that share our mission of uplifting Latino communities.',
    'faq.3.q': 'Is the app available in Spanish?',
    'faq.3.a':
      "Absolutely. Corazon is bilingual by design - fully available in both English and Spanish. You can switch between languages at any time using the toggle in the navigation bar. We're also working on supporting additional languages spoken across Latin America.",
    'faq.4.q': 'How can I get involved or contribute?',
    'faq.4.a':
      'There are many ways to get involved! You can share resources out to our userbase, contribute to our open-source codebase, organize local community events, or simply spread the word. Reach out through our contact page or join one of our community channels to get started.',
    'faq.5.q': 'Who is behind Corazon?',
    'faq.5.a':
      'Corazon was founded by Nicolas, Eddie, and Diego - three friends united by a shared vision of empowering Latino communities through technology and regaining lost time. Our growing team includes designers, engineers, and community organizers from across the Americas.',
    'faq.6.q': 'What resources does Corazon offer?',
    'faq.6.a':
      'We offer a wide range of resources including mentorship matching, scholarship databases, small business tools, immigration resource guides, job boards with bilingual opportunities, community events calendars, and culturally-relevant wellness content.',

    // Founders
    'founders.overline': 'Our Team',
    'founders.heading.pre': 'Meet the',
    'founders.heading.accent': 'Founders',
    'founders.nicolas.role': 'CEO & Co-Founder',
    'founders.nicolas.bio':
      'An international student from Bolivia, Nicolas brings a decade of experience in community organizing and product strategy. His vision for Corazon is rooted in the belief that technology can be a force for cultural preservation and empowerment.',
    'founders.eddie.role': 'CTO & Co-Founder',
    'founders.eddie.bio':
      'Eddie is a Mexican-American engineer with a passion for building accessible, inclusive technology. With experience at leading tech companies, he ensures Corazon is built on a foundation that scales while keeping the community at its core.',
    'founders.diego.role': 'CDO & Co-Founder',
    'founders.diego.bio':
      'Diego is a Mexican-American designer who believes beautiful design is a form of respect. He crafts every pixel of Corazon with intention, ensuring the platform feels like home for every member of our diverse community.',

    // Footer
    'footer.rights': 'All rights reserved.',

    // Aria
    'aria.switchLang.toES': 'Switch language to Spanish',
    'aria.switchLang.toEN': 'Switch language to English',
    'aria.logoHome': 'Corazon home',
  },

  ES: {
    // Navbar
    'nav.about': 'Nosotros',
    'nav.faq': 'Preguntas',
    'nav.resources': 'El Equipo',
    'nav.join': 'Únete',
    'nav.joinAria': 'Únete a Corazón',

    // Hero
    'hero.subtitle': 'Para latinos, por latinos.',
    'hero.scroll': 'Desliza',

    // About
    'about.overline': 'Sobre Nosotros',
    'about.heading.pre': 'Construyendo comunidad,',
    'about.heading.accent': 'juntos.',
    'about.p1':
      'Corazón nació de algo simple: somos latinos en Chicago, y sabemos lo que se siente buscar ayuda en un idioma que no es el tuyo, navegar sistemas que no fueron diseñados para ti, y perder horas que no tienes. No construimos esto para una comunidad hipotética. Lo construimos para nuestras familias, nuestros vecinos, nosotros mismos.',
    'about.p2':
      'Corazón es la plaza digital que siempre debió existir — un lugar donde los recursos, las oportunidades y la cultura latina de Chicago se encuentran en un solo espacio. Bilingüe por diseño. Culturalmente arraigado. Hecho con amor, de latinos para latinos.',

    // Stats
    'stats.1.value': '77%',
    'stats.1.label': 'de los inmigrantes indocumentados en EE.UU. son latinos.',
    'stats.2.value': '200+',
    'stats.2.label': 'organizaciones latinas en Chicago en nuestra plataforma',
    'stats.3.value': '8%',
    'stats.3.label': 'de los trabajadores STEM son latinos — siendo el 19% de la población',
    'stats.4.value': '1 de cada 3',
    'stats.4.label':
      'latinos en EE.UU. reporta dificultad accediendo a servicios básicos por barreras de idioma',
    'stats.4.emphasis': 'Estamos aquí para cambiar eso. Un recurso a la vez.',

    // FAQ
    'faq.overline': 'Preguntas frecuentes',
    'faq.heading.pre': 'Preguntas',
    'faq.heading.accent': 'frecuentes',
    'faq.1.q': '¿Qué es Corazón?',
    'faq.1.a':
      'Corazón es una plataforma bilingüe para la comunidad latina en Chicago. Te ayuda a encontrar organizaciones de confianza, oportunidades, eventos culturales y recursos — todo en un solo lugar, en tu idioma.',
    'faq.2.q': '¿Es gratis usar Corazón?',
    'faq.2.a': 'Sí, completamente gratis. Siempre.',
    'faq.3.q': '¿La aplicación está disponible en español?',
    'faq.3.a':
      'Sí. Corazón es bilingüe por diseño — puedes cambiar entre español e inglés en cualquier momento desde cualquier página.',
    'faq.4.q': '¿Cómo puedo involucrarme o contribuir?',
    'faq.4.a':
      'Comparte Corazón con alguien que lo necesite. Esa es la forma más poderosa de apoyar el proyecto ahora mismo.',
    'faq.5.q': '¿Quién está detrás de Corazón?',
    'faq.5.a':
      'Somos tres estudiantes hispanos de CS en UIC — Nicolas, Eddie y Diego. Construimos Corazón en 36 horas en WildHacks 2026 porque era algo que necesitábamos nosotros mismos.',
    'faq.6.q': '¿Qué recursos ofrece Corazón?',
    'faq.6.a':
      'Ayuda legal e inmigración, clínicas de salud bilingües, bancos de alimentos, becas, empleos, eventos culturales, organizaciones comunitarias y más — todo enfocado en Chicago y sus alrededores.',

    // Founders
    'founders.overline': 'Nuestro Equipo',
    'founders.heading.pre': 'Conoce a los',
    'founders.heading.accent': 'fundadores',
    'founders.nicolas.role': 'CEO & Cofundador',
    'founders.nicolas.bio':
      'Estudiante internacional de Bolivia y Campus Lead de The AI Collective en UIC. Nicolas construyó Corazón desde la experiencia de navegar la vida universitaria en un país nuevo, sin una guía clara. Cree que la tecnología debe servir a quienes más la necesitan.',
    'founders.eddie.role': 'CTO & Cofundador',
    'founders.eddie.bio':
      'Estudiante mexicano-americano de CS en UIC y el cerebro técnico detrás de Corazón. Eddie construyó toda la integración de IA — desde el asistente de voz hasta las recomendaciones personalizadas. Para él, el código es una forma de cuidar a su comunidad.',
    'founders.diego.role': 'CDO & Cofundador',
    'founders.diego.bio':
      'Estudiante mexicano-americano de CS en UIC y el diseñador de Corazón. Diego cree que el diseño hermoso es una forma de respeto — cada pantalla está hecha para que cualquier persona, sin importar su nivel de tecnología, se sienta bienvenida.',

    // Footer
    'footer.rights': 'Todos los derechos reservados.',

    // Aria
    'aria.switchLang.toES': 'Cambiar idioma a español',
    'aria.switchLang.toEN': 'Cambiar idioma a inglés',
    'aria.logoHome': 'Inicio de Corazón',
  },
}

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  toggle: () => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextValue | undefined>(undefined)

export function LangProvider({ children }: { children: ReactNode }) {
  // Source of truth is AppContext.language so the landing's EN/ES toggle
  // carries through to /auth, /onboarding, and the rest of the app.
  const { language, setLanguage } = useAppContext()
  const lang: Lang = language === 'en' ? 'EN' : 'ES'

  const t = (key: string) => dictionaries[lang][key] ?? key

  const setLang = (next: Lang) => {
    setLanguage(next === 'EN' ? 'en' : 'es')
  }

  const toggle = () => {
    setLanguage(language === 'en' ? 'es' : 'en')
  }

  return (
    <LangContext.Provider value={{ lang, setLang, toggle, t }}>{children}</LangContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within a LangProvider')
  return ctx
}
