import { requirePermission } from '@/lib/auth'
import { getMatchWithEvents } from '@/domains/sports/queries/match.queries'
import { getPlayersByOrg } from '@/domains/sports/queries/squad.queries'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { LiveScoreboard } from './_components/live-scoreboard'
import { LiveScoreControls } from './_components/live-score-controls'
import { LiveEventPanel } from './_components/live-event-panel'
import { LiveEventsFeed } from './_components/live-events-feed'
import { FinishMatchDialog } from './_components/finish-match-dialog'

interface Props {
  params: Promise<{ orgSlug: string; matchId: string }>
}

export default async function LiveMatchPage({ params }: Props) {
  const { orgSlug, matchId } = await params
  const ctx = await requirePermission(orgSlug, 'matches', 'write').catch(() => redirect('/login'))

  const [match, allPlayers] = await Promise.all([
    getMatchWithEvents(matchId, ctx.organizationId),
    getPlayersByOrg(ctx.organizationId),
  ])

  if (!match) notFound()
  if (match.status !== 'LIVE') redirect(`/admin/${orgSlug}/sports/matches/${matchId}`)

  const players = allPlayers.map((p) => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    position: p.position,
    jerseyNumber: p.jerseyNumberDefault,
  }))

  const homeScore = match.homeScore ?? 0
  const awayScore = match.awayScore ?? 0

  return (
    <div className="space-y-4 py-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href={`/admin/${orgSlug}/sports/matches/${matchId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-sm font-semibold text-muted-foreground">Panel en vivo</h1>
        <FinishMatchDialog
          orgSlug={orgSlug}
          matchId={matchId}
          homeTeamName={match.homeTeam.name}
          awayTeamName={match.awayTeam.name}
          homeScore={homeScore}
          awayScore={awayScore}
        />
      </div>

      <LiveScoreboard
        homeTeamName={match.homeTeam.name}
        awayTeamName={match.awayTeam.name}
        homeScore={homeScore}
        awayScore={awayScore}
        liveStartedAt={match.liveStartedAt}
      />

      <LiveScoreControls
        orgSlug={orgSlug}
        matchId={matchId}
        homeTeamName={match.homeTeam.name}
        awayTeamName={match.awayTeam.name}
        homeScore={homeScore}
        awayScore={awayScore}
      />

      <LiveEventPanel
        orgSlug={orgSlug}
        matchId={matchId}
        players={players}
        liveStartedAt={match.liveStartedAt}
      />

      <LiveEventsFeed events={match.events} />
    </div>
  )
}
