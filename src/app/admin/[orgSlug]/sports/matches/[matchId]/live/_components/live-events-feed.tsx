interface MatchEvent {
  id: string
  eventType: string
  minute: number
  extraTimeMinute: number | null
  player: { firstName: string; lastName: string }
  assistPlayer: { firstName: string; lastName: string } | null
}

interface LiveEventsFeedProps {
  events: MatchEvent[]
}

const EVENT_CONFIG: Record<string, { icon: string; label: string }> = {
  GOAL: { icon: '⚽', label: 'Gol' },
  OWN_GOAL: { icon: '⚽', label: 'Autogol' },
  YELLOW_CARD: { icon: '🟨', label: 'Amarilla' },
  RED_CARD: { icon: '🟥', label: 'Roja' },
  YELLOW_RED_CARD: { icon: '🟨🟥', label: '2ª Amarilla' },
  SUBSTITUTION_IN: { icon: '🔼', label: 'Entra' },
  SUBSTITUTION_OUT: { icon: '🔽', label: 'Sale' },
  PENALTY_SCORED: { icon: '⚽', label: 'Penal' },
  PENALTY_MISSED: { icon: '❌', label: 'Penal fallado' },
}

export function LiveEventsFeed({ events }: LiveEventsFeedProps) {
  const recent = [...events].reverse().slice(0, 10)

  if (recent.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4 text-center">
        <p className="text-xs text-muted-foreground">Sin eventos aún</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-3 space-y-0">
      <p className="text-xs text-muted-foreground font-medium mb-2 px-1">Últimos eventos</p>
      <div className="divide-y divide-border">
        {recent.map((event) => {
          const config = EVENT_CONFIG[event.eventType] ?? { icon: '📋', label: event.eventType }
          const minuteStr = event.extraTimeMinute
            ? `${event.minute}+${event.extraTimeMinute}'`
            : `${event.minute}'`

          return (
            <div key={event.id} className="flex items-center gap-3 py-2.5 px-1">
              <span className="text-base shrink-0">{config.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-muted-foreground tabular-nums">
                    {minuteStr}
                  </span>
                  <span className="text-xs text-muted-foreground">{config.label}</span>
                </div>
                <p className="text-sm font-medium truncate">
                  {event.player.firstName} {event.player.lastName}
                </p>
                {event.assistPlayer && (
                  <p className="text-xs text-muted-foreground truncate">
                    Asistencia: {event.assistPlayer.firstName} {event.assistPlayer.lastName}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
