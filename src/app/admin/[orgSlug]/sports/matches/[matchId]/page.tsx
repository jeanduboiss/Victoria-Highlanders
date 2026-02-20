import { requirePermission } from '@/lib/auth'
import { getMatchWithEvents } from '@/domains/sports/queries/match.queries'
import { getPlayersByOrg } from '@/domains/sports/queries/squad.queries'
import { redirect, notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Trophy,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { UpdateMatchResultForm } from './_components/update-match-result-form'
import { MatchEventsTimeline } from './_components/match-events-timeline'
import { AddMatchEventSheet } from './_components/add-match-event-sheet'

interface Props {
  params: Promise<{ orgSlug: string; matchId: string }>
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Programado',
  LIVE: 'En vivo',
  FINISHED: 'Finalizado',
  POSTPONED: 'Aplazado',
  CANCELLED: 'Cancelado',
  ABANDONED: 'Abandonado',
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  LIVE: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse',
  FINISHED: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  POSTPONED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  CANCELLED: 'bg-red-500/10 text-red-500 border-red-500/20',
  ABANDONED: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export default async function MatchDetailPage({ params }: Props) {
  const { orgSlug, matchId } = await params
  const ctx = await requirePermission(orgSlug, 'matches', 'read').catch(() => redirect('/login'))

  const [match, players] = await Promise.all([
    getMatchWithEvents(matchId, ctx.organizationId),
    getPlayersByOrg(ctx.organizationId),
  ])

  if (!match) notFound()

  const matchDate = new Date(match.matchDate)
  const isEditable = match.status === 'SCHEDULED' || match.status === 'LIVE'

  return (
    <div className="space-y-6 py-4">
      {/* Header con back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href={`/admin/${orgSlug}/sports/matches`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              Detalle del partido
            </h1>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${STATUS_COLORS[match.status] ?? 'bg-zinc-500/10 text-zinc-400'}`}
            >
              {STATUS_LABELS[match.status] ?? match.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {match.competitionName ? `${match.competitionName} • ` : ''}
            {match.season.name}
          </p>
        </div>
      </div>

      {/* Scoreboard — la pieza central */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 shadow-2xl">
        <CardContent className="p-0">
          {/* Metadata strip */}
          <div className="flex items-center justify-center gap-4 px-6 py-3 border-b border-white/5 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {matchDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {matchDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {match.venue && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {match.venue.name}
              </span>
            )}
          </div>

          {/* Scoreboard principal */}
          <div className="grid grid-cols-3 items-center py-10 px-6">
            {/* Equipo local */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                <Trophy className="h-7 w-7 text-zinc-300" />
              </div>
              <div>
                <p className="font-bold text-white text-lg">{match.homeTeam.name}</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Local</p>
              </div>
            </div>

            {/* Marcador */}
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl font-black text-white tabular-nums tracking-tight">
                {match.homeScore ?? '–'}
              </span>
              <span className="text-2xl font-light text-zinc-600">:</span>
              <span className="text-5xl font-black text-white tabular-nums tracking-tight">
                {match.awayScore ?? '–'}
              </span>
            </div>

            {/* Equipo visitante */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                <Trophy className="h-7 w-7 text-zinc-300" />
              </div>
              <div>
                <p className="font-bold text-white text-lg">{match.awayTeam.name}</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Visitante</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de actions + events */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Columna izquierda — Acciones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Actualizar resultado */}
          {isEditable && (
            <UpdateMatchResultForm
              orgSlug={orgSlug}
              matchId={match.id}
              currentStatus={match.status}
              homeTeamName={match.homeTeam.name}
              awayTeamName={match.awayTeam.name}
            />
          )}

          {/* Info del partido */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temporada</span>
                <span className="font-medium">{match.season.name}</span>
              </div>
              {match.competitionName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Competición</span>
                  <span className="font-medium">{match.competitionName}</span>
                </div>
              )}
              {match.matchDay && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jornada</span>
                  <span className="font-medium">{match.matchDay}</span>
                </div>
              )}
              {match.round && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ronda</span>
                  <span className="font-medium">{match.round}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Local</span>
                <Badge variant={match.isHomeGame ? 'default' : 'outline'} className="text-xs">
                  {match.isHomeGame ? 'Sí' : 'No'}
                </Badge>
              </div>
              {match.notes && (
                <>
                  <Separator />
                  <p className="text-muted-foreground text-xs leading-relaxed">{match.notes}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha — Timeline de eventos */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">
                Eventos del partido
                {match.events.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    ({match.events.length})
                  </span>
                )}
              </CardTitle>
              <AddMatchEventSheet
                orgSlug={orgSlug}
                matchId={match.id}
                players={players}
              >
                <Button size="sm" variant="outline" className="h-8 text-xs">
                  + Evento
                </Button>
              </AddMatchEventSheet>
            </CardHeader>
            <CardContent>
              <MatchEventsTimeline
                events={match.events}
                orgSlug={orgSlug}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
