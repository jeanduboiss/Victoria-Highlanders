import { requirePermission } from '@/lib/auth'
import { getSeasonsByOrg, getTeamsByOrg } from '@/domains/sports/queries/squad.queries'
import { getStandingsData, getCompetitionNames } from '@/domains/sports/queries/standings.query'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { PageHeader } from '@/components/admin/page-header'
import { StandingsFilters } from './_components/standings-filters'
import { StandingsTable } from './_components/standings-table'
import type { TeamCategory } from '@prisma/client'

interface Props {
  params: Promise<{ orgSlug: string }>
  searchParams: Promise<{ seasonId?: string; category?: string; competitionName?: string }>
}

export default async function StandingsPage({ params, searchParams }: Props) {
  const t = await getTranslations('admin.pages')
  const { orgSlug } = await params
  const { seasonId, category, competitionName } = await searchParams

  const ctx = await requirePermission(orgSlug, 'matches', 'read').catch(() => redirect('/login'))

  const [standings, seasons, teams, competitions] = await Promise.all([
    getStandingsData(ctx.organizationId, { seasonId, category, competitionName }),
    getSeasonsByOrg(ctx.organizationId),
    getTeamsByOrg(ctx.organizationId),
    getCompetitionNames(ctx.organizationId, seasonId),
  ])

  const categories = [...new Set(teams.map((t) => t.category))] as TeamCategory[]

  return (
    <div className="space-y-4 py-4">
      <PageHeader
        title={t('sports.standings.title')}
        description={t('sports.standings.desc')}
      />
      <StandingsFilters
        seasons={seasons}
        categories={categories}
        competitions={competitions}
        currentSeasonId={seasonId}
        currentCategory={category}
        currentCompetition={competitionName}
        orgSlug={orgSlug}
      />
      <StandingsTable standings={standings} />
    </div>
  )
}
