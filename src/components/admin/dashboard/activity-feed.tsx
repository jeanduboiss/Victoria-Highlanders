import { Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export interface ActivityItem {
  id: string
  type: 'article_published' | 'match_scheduled' | 'match_finished' | 'player_added' | 'event_published'
  description: string
  createdAt: Date
}

const ACTIVITY_ICONS: Record<ActivityItem['type'], string> = {
  article_published: '📰',
  match_scheduled: '📅',
  match_finished: '🏆',
  player_added: '👤',
  event_published: '📣',
}

interface ActivityFeedProps {
  items: ActivityItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <span className="text-base leading-none mt-0.5" aria-hidden>
                  {ACTIVITY_ICONS[item.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{item.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
