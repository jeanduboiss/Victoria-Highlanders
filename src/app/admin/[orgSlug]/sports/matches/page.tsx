import { requirePermission } from '@/lib/auth'
import { getMatchesByOrg } from '@/domains/sports/queries/match.queries'
import { getSeasonsByOrg } from '@/domains/sports/queries/squad.queries'
import { redirect } from 'next/navigation'
import { MatchesTable } from './_components/matches-table'
import { ScheduleMatchSheet } from './_components/schedule-match-sheet'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Props {
  params: Promise<{ orgSlug: string }>
  searchParams: Promise<{ seasonId?: string }>
}

export default async function MatchesPage({ params, searchParams }: Props) {
  const { orgSlug } = await params
  const { seasonId } = await searchParams

  const ctx = await requirePermission(orgSlug, 'matches', 'read').catch(() => redirect('/login'))

  const [matches, seasons] = await Promise.all([
    getMatchesByOrg(ctx.organizationId, seasonId),
    getSeasonsByOrg(ctx.organizationId),
  ])

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Partidos</h1>
          <p className="text-muted-foreground">{matches.length} partido(s) encontrados.</p>
        </div>
        <ScheduleMatchSheet orgSlug={orgSlug} seasons={seasons}>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Programar partido
          </Button>
        </ScheduleMatchSheet>
      </div>
      <MatchesTable matches={matches} orgSlug={orgSlug} />
    </div>
  )
}
