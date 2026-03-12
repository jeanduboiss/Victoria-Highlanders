import { Bell, Trophy, Newspaper } from 'lucide-react'
import { prisma } from '@/lib/prisma/client'
import { formatDistanceToNow } from 'date-fns'
import { es, enGB, fr } from 'date-fns/locale'
import { getLocale } from 'next-intl/server'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const DATE_FNS_LOCALES = {
  es,
  en: enGB,
  fr,
} as const

interface NotificationsPopoverProps {
  orgId: string
}

const getNotificationData = cache(async (orgId: string) => {
  return unstable_cache(
    async () => {
      const [recentEvents, recentArticles] = await Promise.all([
        prisma.matchEvent.findMany({
          where: { match: { organizationId: orgId } },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            player: { select: { firstName: true, lastName: true } },
            match: { select: { homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } } } },
          },
        }),
        prisma.article.findMany({
          where: { organizationId: orgId, status: 'PUBLISHED' },
          orderBy: { publishedAt: 'desc' },
          take: 5,
          select: { id: true, title: true, publishedAt: true },
        }),
      ])
      return { recentEvents, recentArticles }
    },
    [`notifications-${orgId}`],
    { revalidate: 60, tags: [`notifications-${orgId}`] }
  )()
})

export async function NotificationsPopover({ orgId }: NotificationsPopoverProps) {
  const locale = await getLocale()
  const dateFnsLocale = DATE_FNS_LOCALES[locale as keyof typeof DATE_FNS_LOCALES] || es
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const { recentEvents, recentArticles } = await getNotificationData(orgId)

  type NotifItem = {
    id: string
    type: 'match_event' | 'article'
    description: string
    date: Date
  }

  const items: NotifItem[] = [
    ...recentEvents.map((e) => ({
      id: `ev-${e.id}`,
      type: 'match_event' as const,
      description: `${e.player.firstName} ${e.player.lastName} — ${e.match.homeTeam.name} vs ${e.match.awayTeam.name}`,
      date: new Date(e.createdAt),
    })),
    ...recentArticles
      .filter((a) => a.publishedAt !== null)
      .map((a) => ({
        id: `art-${a.id}`,
        type: 'article' as const,
        description: `Publicado: "${a.title}"`,
        date: new Date(a.publishedAt!),
      })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6)

  const recentCount = items.filter((i) => i.date > since24h).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          aria-label="Notificaciones"
        >
          <Bell className="size-4" />
          {recentCount > 0 && (
            <span className="absolute top-1 right-1 flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="text-sm font-semibold">Actividad reciente</p>
          {recentCount > 0 && (
            <span className="text-xs text-muted-foreground">{recentCount} nuevas</span>
          )}
        </div>
        {items.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const isNew = item.date > since24h
              return (
                <li key={item.id} className={cn('flex items-start gap-3 px-4 py-3', isNew && 'bg-primary/5')}>
                  <div className={cn(
                    'flex items-center justify-center rounded-full size-7 shrink-0 mt-0.5',
                    item.type === 'match_event' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                  )}>
                    {item.type === 'match_event'
                      ? <Trophy className="size-3.5 text-amber-500" />
                      : <Newspaper className="size-3.5 text-blue-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug line-clamp-2">{item.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(item.date, {
                        addSuffix: true,
                        locale: dateFnsLocale
                      })}
                    </p>
                  </div>
                  {isNew && <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
                </li>
              )
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
