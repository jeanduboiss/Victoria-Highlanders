import { requirePermission } from '@/lib/auth'
import { getMatchesByOrg } from '@/domains/sports/queries/match.queries'
import { getSeasonsByOrg, getTeamsByOrg } from '@/domains/sports/queries/squad.queries'
import { redirect } from 'next/navigation'
import { MatchesTable } from './_components/matches-table'
import { ScheduleMatchSheet } from './_components/schedule-match-sheet'
import { PageHeader } from '@/components/admin/page-header'
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

  const [matches, seasons, teams] = await Promise.all([
    getMatchesByOrg(ctx.organizationId, seasonId),
    getSeasonsByOrg(ctx.organizationId),
    getTeamsByOrg(ctx.organizationId),
  ])

  return (
    <div className="space-y-4 py-4">
      <PageHeader
        title="Partidos"
        description={`${matches.length} partido${matches.length !== 1 ? 's' : ''} encontrado${matches.length !== 1 ? 's' : ''}`}
        action={
          <ScheduleMatchSheet orgSlug={orgSlug} seasons={seasons} teams={teams}>
            <Button size="sm" className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Programar partido
            </Button>
          </ScheduleMatchSheet>
        }
      />
      <MatchesTable matches={matches} orgSlug={orgSlug} />
    </div>
  )
}
