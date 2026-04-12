import { User as UserIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/context/AppContext'

export const ProfilePage = () => {
  const { language, user, signOut } = useAppContext()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-7">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10">
            <UserIcon className="size-8 text-white/70" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl">{user?.username || 'User'}</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </section>

      {user?.profile && (
        <section className="space-y-3 rounded-2xl border border-border/50 bg-card/70 p-5">
          <h2 className="text-lg font-medium">
            {language === 'es' ? 'Tu perfil' : 'Your profile'}
          </h2>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            {user.profile.countryOfOrigin && (
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === 'es' ? 'Pa\u00eds de origen' : 'Country of origin'}
                </p>
                <p>{user.profile.countryOfOrigin}</p>
              </div>
            )}
            {user.profile.preferredLanguage && (
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === 'es' ? 'Idioma' : 'Language'}
                </p>
                <p>{user.profile.preferredLanguage === 'spanish' ? 'Espa\u00f1ol' : 'English'}</p>
              </div>
            )}
            {user.profile.occupations.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === 'es' ? 'Ocupaci\u00f3n' : 'Occupation'}
                </p>
                <p>{user.profile.occupations.join(', ')}</p>
              </div>
            )}
            {user.profile.goals.length > 0 && (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">
                  {language === 'es' ? 'Metas' : 'Goals'}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {user.profile.goals.map(goal => (
                    <span
                      key={goal}
                      className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-xs"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <Button
        type="button"
        variant="outline"
        className="h-11 cursor-pointer text-destructive hover:bg-destructive/10"
        onClick={handleSignOut}
      >
        {language === 'es' ? 'Cerrar sesi\u00f3n' : 'Sign out'}
      </Button>
    </div>
  )
}
