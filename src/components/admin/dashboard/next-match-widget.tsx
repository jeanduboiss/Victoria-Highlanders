import Link from 'next/link'
import { CalendarDays, MapPin, ArrowRight, Swords } from 'lucide-react'
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
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Próximo Partido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
            <Swords className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No hay partidos programados.</p>
          </div>
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Próximo Partido
          </CardTitle>
          <div className="flex gap-1.5">
            {match.competitionName && (
              <Badge variant="secondary" className="text-xs">{match.competitionName}</Badge>
            )}
            <Badge variant={match.isHomeGame ? 'default' : 'outline'} className="text-xs">
              {match.isHomeGame ? 'Local' : 'Visitante'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Teams VS layout */}
        <div className="flex items-center justify-between gap-3 py-2">
          <div className="flex-1 text-center">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
              <span className="text-sm font-bold text-primary">
                {match.homeTeam.name.charAt(0)}
              </span>
            </div>
            <p className="text-sm font-semibold leading-tight line-clamp-2">{match.homeTeam.name}</p>
          </div>
          <div className="flex flex-col items-center shrink-0">
            <span className="text-xs font-bold text-muted-foreground bg-muted rounded-md px-2 py-1">VS</span>
          </div>
          <div className="flex-1 text-center">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-1.5">
              <span className="text-sm font-bold text-muted-foreground">
                {match.awayTeam.name.charAt(0)}
              </span>
            </div>
            <p className="text-sm font-semibold leading-tight line-clamp-2">{match.awayTeam.name}</p>
          </div>
        </div>

        {/* Date & venue */}
        <div className="rounded-lg bg-muted/50 border px-3 py-2.5 space-y-1">
          <p className="text-sm capitalize font-medium">{dateStr}</p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{timeStr}</span>
            {match.venue && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {match.venue.name}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" asChild className="w-full cursor-pointer">
          <Link href={`/admin/${orgSlug}/sports/matches/${match.id}`}>
            Ver detalles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
