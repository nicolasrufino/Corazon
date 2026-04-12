import { User as UserIcon } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

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
            <h1 className="text-2xl sm:text-3xl">
              {language === 'es' ? 'Mi perfil' : 'My profile'}
            </h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/50 bg-card/70 p-5">
        <p className="text-sm text-muted-foreground">
          {language === 'es'
            ? 'La p\u00e1gina de perfil completa viene pronto.'
            : 'Full profile page coming soon.'}
        </p>
      </section>

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
