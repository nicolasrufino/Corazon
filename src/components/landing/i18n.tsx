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
    'nav.joinAria': 'Join Coraz\u00f3n',

    // Hero
    'hero.subtitle': 'For Latinos, by Latinos.',
    'hero.scroll': 'Scroll',

    // About
    'about.overline': 'About Us',
    'about.heading.pre': 'Building community,',
    'about.heading.accent': 'together.',
    'about.p1':
      "Coraz\u00f3n was born from something simple: we're Latinos in Chicago, and we know what it feels like to search for help in a language that isn't yours, navigate systems that weren't designed for you, and lose hours you don't have. We didn't build this for a hypothetical community. We built it for our families, our neighbors, ourselves.",
    'about.p2':
      'Coraz\u00f3n is the digital plaza that should have always existed \u2014 a place where resources, opportunities, and Latino culture in Chicago come together in one space. Bilingual by design. Culturally rooted. Made with love, by Latinos for Latinos.',

    // Stats
    'stats.1.value': '77%',
    'stats.1.label': 'of undocumented immigrants in the U.S. are Latino',
    'stats.2.value': '200+',
    'stats.2.label': 'Latino organizations in Chicago on our platform',
    'stats.3.value': '8%',
    'stats.3.label': 'of STEM workers are Latino \u2014 despite being 19% of the population',
    'stats.4.value': '1 in 3',
    'stats.4.label':
      'Latinos in the U.S. report difficulty accessing basic services due to language barriers',
    'stats.4.emphasis': "We're here to change that. One resource at a time.",

    // FAQ
    'faq.overline': 'FAQ',
    'faq.heading.pre': 'Frequently Asked',
    'faq.heading.accent': 'Questions',
    'faq.1.q': 'What is Coraz\u00f3n?',
    'faq.1.a':
      'Coraz\u00f3n is a bilingual platform for the Latino community in Chicago. It helps you find trusted organizations, opportunities, cultural events, and resources \u2014 all in one place, in your language.',
    'faq.2.q': 'Is Coraz\u00f3n free to use?',
    'faq.2.a': 'Yes, completely free. Always.',
    'faq.3.q': 'Is the app available in Spanish?',
    'faq.3.a':
      'Yes. Coraz\u00f3n is bilingual by design \u2014 you can switch between Spanish and English at any time from any page.',
    'faq.4.q': 'How can I get involved or contribute?',
    'faq.4.a':
      "Share Coraz\u00f3n with someone who needs it. That's the most powerful way to support the project right now.",
    'faq.5.q': 'Who is behind Coraz\u00f3n?',
    'faq.5.a':
      "We're three Hispanic CS students at UIC \u2014 Nicolas, Eddie, and Diego. We built Coraz\u00f3n in 36 hours at WildHacks 2026 because it was something we needed ourselves.",
    'faq.6.q': 'What resources does Coraz\u00f3n offer?',
    'faq.6.a':
      'Legal and immigration help, bilingual health clinics, food banks, scholarships, jobs, cultural events, community organizations, and more \u2014 all focused on Chicago and the surrounding area.',

    // Founders
    'founders.overline': 'Our Team',
    'founders.heading.pre': 'Meet the',
    'founders.heading.accent': 'founders',
    'founders.nicolas.role': 'CEO & Co-Founder',
    'founders.nicolas.bio':
      'International student from Bolivia and Campus Lead of The AI Collective at UIC. Nicolas built Coraz\u00f3n from the experience of navigating college life in a new country, without a clear guide. He believes technology should serve those who need it most.',
    'founders.eddie.role': 'CTO & Co-Founder',
    'founders.eddie.bio':
      'Mexican-American CS student at UIC and the technical brain behind Coraz\u00f3n. Eddie built the entire AI integration \u2014 from the voice assistant to personalized recommendations. For him, code is a way to take care of his community.',
    'founders.diego.role': 'CDO & Co-Founder',
    'founders.diego.bio':
      'Mexican-American CS student at UIC and the designer of Coraz\u00f3n. Diego believes beautiful design is a form of respect \u2014 every screen is made so that anyone, regardless of their tech level, feels welcome.',

    // Footer
    'footer.rights': 'All rights reserved.',

    // Aria
    'aria.switchLang.toES': 'Switch language to Spanish',
    'aria.switchLang.toEN': 'Switch language to English',
    'aria.logoHome': 'Coraz\u00f3n home',
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
