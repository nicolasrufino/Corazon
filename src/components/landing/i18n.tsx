import { createContext, useContext, useState, type ReactNode } from 'react'

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
      "Corazón was born from a simple truth: our communities are stronger when we're connected. We're building the digital plaza where Latino voices, stories, and resources come together — a space that honors our culture while empowering our future. From first-generation college students seeking mentorship to entrepreneurs looking for community capital, Corazón is the bridge between aspiration and achievement.",
    'about.p2':
      "We believe technology should serve the people, not the other way around. Every feature we build is shaped by the lived experiences of our community — bilingual by design, culturally rooted, and radically inclusive. Whether you're in Los Angeles, San Juan, or Mexico City, Corazón is your home. We're not just building an app; we're nurturing a movement that celebrates the richness of Latino identity in all its beautiful complexity.",

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
      'Corazon is a community-driven platform designed specifically for the Latino community. We provide a space to connect with others, access resources, find mentorship, and celebrate our shared cultural heritage — all in a bilingual, culturally-rooted environment.',
    'faq.2.q': 'Is Corazon free to use?',
    'faq.2.a':
      'Yes! Corazon is completely free for all community members. We believe access to community and resources should never be gated by cost. Our platform is sustained through partnerships with organizations that share our mission of uplifting Latino communities.',
    'faq.3.q': 'Is the app available in Spanish?',
    'faq.3.a':
      "Absolutely. Corazon is bilingual by design — fully available in both English and Spanish. You can switch between languages at any time using the toggle in the navigation bar. We're also working on supporting additional languages spoken across Latin America.",
    'faq.4.q': 'How can I get involved or contribute?',
    'faq.4.a':
      'There are many ways to get involved! You can volunteer as a mentor, contribute to our open-source codebase, organize local community events, or simply spread the word. Reach out through our contact page or join one of our community channels to get started.',
    'faq.5.q': 'Who is behind Corazon?',
    'faq.5.a':
      'Corazon was founded by Nicolas, Eddie, and Diego — three friends united by a shared vision of empowering Latino communities through technology. Our growing team includes designers, engineers, and community organizers from across the Americas.',
    'faq.6.q': 'What resources does Corazon offer?',
    'faq.6.a':
      'We offer a wide range of resources including mentorship matching, scholarship databases, small business tools, immigration resource guides, job boards with bilingual opportunities, community events calendars, and culturally-relevant wellness content.',

    // Founders
    'founders.overline': 'Our Team',
    'founders.heading.pre': 'Meet the',
    'founders.heading.accent': 'Founders',
    'founders.nicolas.role': 'CEO & Co-Founder',
    'founders.nicolas.bio':
      'A first-generation Colombian-American, Nicolas brings a decade of experience in community organizing and product strategy. His vision for Corazon is rooted in the belief that technology can be a force for cultural preservation and empowerment.',
    'founders.eddie.role': 'CTO & Co-Founder',
    'founders.eddie.bio':
      'Eddie is a Mexican-American engineer with a passion for building accessible, inclusive technology. With experience at leading tech companies, he ensures Corazon is built on a foundation that scales while keeping the community at its core.',
    'founders.diego.role': 'CDO & Co-Founder',
    'founders.diego.bio':
      'Diego is a Dominican-American designer who believes beautiful design is a form of respect. He crafts every pixel of Corazon with intention, ensuring the platform feels like home for every member of our diverse community.',

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
    'about.heading.pre': 'Construyendo Comunidad,',
    'about.heading.accent': 'Juntos',
    'about.p1':
      'Corazón nació de una verdad simple: nuestras comunidades son más fuertes cuando estamos conectados. Estamos construyendo la plaza digital donde las voces, historias y recursos latinos se unen — un espacio que honra nuestra cultura mientras empodera nuestro futuro. Desde estudiantes universitarios de primera generación buscando mentoría hasta emprendedores en busca de capital comunitario, Corazón es el puente entre la aspiración y el logro.',
    'about.p2':
      'Creemos que la tecnología debe servir a las personas, no al revés. Cada función que construimos está moldeada por las experiencias vividas de nuestra comunidad — bilingüe por diseño, culturalmente arraigada y radicalmente inclusiva. Ya sea que estés en Los Ángeles, San Juan o Ciudad de México, Corazón es tu hogar. No solo estamos construyendo una aplicación; estamos nutriendo un movimiento que celebra la riqueza de la identidad latina en toda su hermosa complejidad.',

    // Stats
    'stats.1.value': '77%',
    'stats.1.label': 'de los inmigrantes indocumentados en EE.UU. son latinos.',
    'stats.2.value': 'solo 9%',
    'stats.2.label': 'de los estudiantes internacionales en EE.UU. vienen de Latinoamérica.',
    'stats.3.value': '8%',
    'stats.3.label':
      'de los trabajadores STEM en EE.UU. son latinos, a pesar de ser el 19% de la población.',
    'stats.4.value': 'solo 4%',
    'stats.4.label': 'de los directores ejecutivos de Fortune 500 son hispanos.',
    'stats.4.emphasis': 'Planeamos cambiar eso.',

    // FAQ
    'faq.overline': 'Preguntas',
    'faq.heading.pre': 'Preguntas',
    'faq.heading.accent': 'Frecuentes',
    'faq.1.q': '¿Qué es Corazón?',
    'faq.1.a':
      'Corazón es una plataforma impulsada por la comunidad diseñada específicamente para la comunidad latina. Ofrecemos un espacio para conectarte con otros, acceder a recursos, encontrar mentoría y celebrar nuestra herencia cultural compartida — todo en un entorno bilingüe y culturalmente arraigado.',
    'faq.2.q': '¿Es gratis usar Corazón?',
    'faq.2.a':
      '¡Sí! Corazón es completamente gratis para todos los miembros de la comunidad. Creemos que el acceso a la comunidad y a los recursos nunca debe estar limitado por el costo. Nuestra plataforma se sostiene a través de alianzas con organizaciones que comparten nuestra misión de elevar a las comunidades latinas.',
    'faq.3.q': '¿La aplicación está disponible en español?',
    'faq.3.a':
      'Por supuesto. Corazón es bilingüe por diseño — completamente disponible en inglés y español. Puedes cambiar entre idiomas en cualquier momento usando el interruptor en la barra de navegación. También estamos trabajando para apoyar otros idiomas hablados en América Latina.',
    'faq.4.q': '¿Cómo puedo involucrarme o contribuir?',
    'faq.4.a':
      '¡Hay muchas formas de involucrarte! Puedes ser voluntario como mentor, contribuir a nuestro código abierto, organizar eventos comunitarios locales o simplemente correr la voz. Contáctanos a través de nuestra página de contacto o únete a uno de nuestros canales comunitarios para comenzar.',
    'faq.5.q': '¿Quién está detrás de Corazón?',
    'faq.5.a':
      'Corazón fue fundado por Nicolás, Eddie y Diego — tres amigos unidos por una visión compartida de empoderar a las comunidades latinas a través de la tecnología. Nuestro creciente equipo incluye diseñadores, ingenieros y organizadores comunitarios de toda América.',
    'faq.6.q': '¿Qué recursos ofrece Corazón?',
    'faq.6.a':
      'Ofrecemos una amplia gama de recursos, incluyendo conexión con mentores, bases de datos de becas, herramientas para pequeños negocios, guías de recursos migratorios, bolsas de trabajo con oportunidades bilingües, calendarios de eventos comunitarios y contenido de bienestar culturalmente relevante.',

    // Founders
    'founders.overline': 'Nuestro Equipo',
    'founders.heading.pre': 'Conoce a los',
    'founders.heading.accent': 'Fundadores',
    'founders.nicolas.role': 'CEO y Cofundador',
    'founders.nicolas.bio':
      'Colombiano-americano de primera generación, Nicolás aporta una década de experiencia en organización comunitaria y estrategia de producto. Su visión para Corazón está arraigada en la creencia de que la tecnología puede ser una fuerza para la preservación cultural y el empoderamiento.',
    'founders.eddie.role': 'CTO y Cofundador',
    'founders.eddie.bio':
      'Eddie es un ingeniero mexicano-americano con pasión por construir tecnología accesible e inclusiva. Con experiencia en empresas tecnológicas líderes, asegura que Corazón esté construido sobre una base que escala mientras mantiene a la comunidad en su centro.',
    'founders.diego.role': 'CDO y Cofundador',
    'founders.diego.bio':
      'Diego es un diseñador dominicano-americano que cree que el diseño hermoso es una forma de respeto. Crea cada píxel de Corazón con intención, asegurando que la plataforma se sienta como en casa para cada miembro de nuestra diversa comunidad.',

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
  const [lang, setLang] = useState<Lang>('EN')

  const t = (key: string) => dictionaries[lang][key] ?? key
  const toggle = () => setLang(current => (current === 'EN' ? 'ES' : 'EN'))

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
