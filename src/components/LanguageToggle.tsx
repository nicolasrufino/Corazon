import { Globe } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import type { AppLanguage } from '@/types/app'

const options: Array<{ code: AppLanguage; label: string }> = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
]

export const LanguageToggle = () => {
  const { language, setLanguage } = useAppContext()

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-card/70 p-1 backdrop-blur-sm">
      <Globe className="ml-1 size-4 text-primary" aria-hidden="true" />
      {options.map(option => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLanguage(option.code)}
          className={cn(
            'h-9 min-w-11 cursor-pointer rounded-full px-3 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            language === option.code
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-foreground/80 hover:bg-primary/15 hover:text-foreground'
          )}
          aria-pressed={language === option.code}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
