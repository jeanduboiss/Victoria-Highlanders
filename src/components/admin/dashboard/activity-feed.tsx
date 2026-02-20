import { Activity, Newspaper, CalendarDays, Trophy, UserRound, Megaphone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export interface ActivityItem {
  id: string
  type: 'article_published' | 'match_scheduled' | 'match_finished' | 'player_added' | 'event_published'
  description: string
  createdAt: Date
}

const ACTIVITY_CONFIG: Record<
  ActivityItem['type'],
  { icon: React.ElementType; iconBg: string; iconColor: string }
> = {
  article_published: { icon: Newspaper, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500' },
  match_scheduled: { icon: CalendarDays, iconBg: 'bg-violet-500/10', iconColor: 'text-violet-500' },
  match_finished: { icon: Trophy, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
  player_added: { icon: UserRound, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
  event_published: { icon: Megaphone, iconBg: 'bg-rose-500/10', iconColor: 'text-rose-500' },
}

interface ActivityFeedProps {
  items: ActivityItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Sin actividad reciente.</p>
        ) : (
          <ul className="space-y-0">
            {items.map((item, index) => {
              const config = ACTIVITY_CONFIG[item.type]
              const Icon = config.icon
              const isLast = index === items.length - 1
              return (
                <li key={item.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn('flex items-center justify-center rounded-full size-7 shrink-0', config.iconBg)}>
                      <Icon className={cn('size-3.5', config.iconColor)} />
                    </div>
                    {!isLast && <div className="w-px flex-1 bg-border mt-1 mb-1" />}
                  </div>
                  <div className={cn('flex-1 min-w-0 pb-3', isLast && 'pb-0')}>
                    <p className="text-sm leading-snug">{item.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
