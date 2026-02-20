import Link from 'next/link'
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface NextMatchWidgetProps {
  orgSlug: string
  match: {
    id: string
    competitionName: string | null
    matchDate: Date
    homeTeam: { name: string }
    awayTeam: { name: string }
    venue: { name: string } | null
    isHomeGame: boolean
  } | null
}

export function NextMatchWidget({ orgSlug, match }: NextMatchWidgetProps) {
  if (!match) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Próximo Partido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay partidos programados.</p>
        </CardContent>
      </Card>
    )
  }

  const matchDate = new Date(match.matchDate)
  const dateStr = matchDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const timeStr = matchDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Próximo Partido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <span className="font-semibold text-sm truncate">{match.homeTeam.name}</span>
          <span className="text-xs text-muted-foreground font-medium">vs</span>
          <span className="font-semibold text-sm truncate text-right">{match.awayTeam.name}</span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm capitalize">{dateStr} · {timeStr}</p>
          {match.venue && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {match.venue.name}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {match.competitionName && (
            <Badge variant="secondary" className="text-xs">{match.competitionName}</Badge>
          )}
          <Badge variant={match.isHomeGame ? 'default' : 'outline'} className="text-xs">
            {match.isHomeGame ? 'Local' : 'Visitante'}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" asChild className="w-full">
          <Link href={`/admin/${orgSlug}/sports/matches/${match.id}`}>
            Ver detalles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
