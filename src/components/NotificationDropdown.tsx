import { Bell, Heart, MessageCircle, Reply } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '@/context/AppContext'
import {
  fetchNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  type Notification,
} from '@/lib/notificationsApi'

function timeAgo(dateStr: string, isEs: boolean): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return isEs ? 'ahora' : 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return `${Math.floor(days / 7)}w`
}

const TYPE_ICON = {
  comment: MessageCircle,
  reply: Reply,
  like: Heart,
}

export const NotificationDropdown = () => {
  const { language, user } = useAppContext()
  const navigate = useNavigate()
  const isEs = language === 'es'
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)

  const loadNotifications = useCallback(async () => {
    if (!user) return
    const [notifs, count] = await Promise.all([fetchNotifications(), getUnreadCount()])
    setNotifications(notifs)
    setUnread(count)
  }, [user])

  // Load on mount + poll every 30 seconds
  useEffect(() => {
    void loadNotifications()
    const interval = setInterval(() => void loadNotifications(), 30000)
    return () => clearInterval(interval)
  }, [loadNotifications])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-notification-dropdown]')) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const handleClick = async (notif: Notification) => {
    if (!notif.read) {
      await markAsRead(notif.id)
      setNotifications(prev => prev.map(n => (n.id === notif.id ? { ...n, read: true } : n)))
      setUnread(prev => Math.max(0, prev - 1))
    }
    setOpen(false)
    if (notif.post_id) {
      navigate('/discovery')
    }
  }

  const handleMarkAll = async () => {
    await markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  if (!user) return null

  return (
    <div className="relative" data-notification-dropdown>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#ff8100]/30 bg-gradient-to-br from-[#ff8100]/15 to-[#f82d1a]/5 text-[#ffb15a] shadow-[inset_0_1px_0_0_rgba(255,181,90,0.25)] transition-all duration-300 hover:border-[#ff8100]/60 hover:from-[#ff8100]/25 hover:to-[#f82d1a]/15 hover:text-white"
        aria-label={isEs ? 'Notificaciones' : 'Notifications'}
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-[#ff8100] bg-[#f82d1a] px-1 text-[10px] font-bold text-white shadow-[0_0_12px_rgba(248,45,26,0.8)]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <h4 className="text-sm font-medium">{isEs ? 'Notificaciones' : 'Notifications'}</h4>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAll()}
                className="cursor-pointer text-xs text-primary hover:underline"
              >
                {isEs ? 'Marcar todo' : 'Mark all read'}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                {isEs ? 'Sin notificaciones' : 'No notifications yet'}
              </p>
            ) : (
              notifications.map(notif => {
                const Icon = TYPE_ICON[notif.type]
                const label =
                  notif.type === 'comment'
                    ? isEs
                      ? 'comentó en tu post'
                      : 'commented on your post'
                    : notif.type === 'reply'
                      ? isEs
                        ? 'respondió a tu comentario'
                        : 'replied to your comment'
                      : isEs
                        ? 'le gustó tu post'
                        : 'liked your post'

                return (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => void handleClick(notif)}
                    className="flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                    style={!notif.read ? { borderLeft: '3px solid #dc2626' } : undefined}
                  >
                    <Icon
                      className="mt-0.5 size-4 shrink-0"
                      style={{ color: notif.type === 'like' ? '#dc2626' : undefined }}
                    />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-sm">
                        <span className="font-medium">{notif.actor_username}</span>{' '}
                        <span className="text-muted-foreground">{label}</span>
                      </p>
                      {notif.preview && (
                        <p className="text-xs text-muted-foreground">
                          &ldquo;{notif.preview}&rdquo;
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {timeAgo(notif.created_at, isEs)}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
