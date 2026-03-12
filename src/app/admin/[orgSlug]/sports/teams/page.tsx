import { requirePermission } from '@/lib/auth'
import { getTeamsByOrg } from '@/domains/sports/queries/squad.queries'
import {  redirect  } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { TeamsTable } from './_components/teams-table'
import { CreateTeamSheet } from './_components/create-team-sheet'
import { PageHeader } from '@/components/admin/page-header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Props {
  params: Promise<{ orgSlug: string }>
}

export default async function TeamsPage({ params }: Props) {
  const t = await getTranslations('admin.pages')
  const { orgSlug } = await params
  const ctx = await requirePermission(orgSlug, 'teams', 'read').catch(() => redirect('/login'))

  const teams = await getTeamsByOrg(ctx.organizationId)

  return (
    <div className="space-y-4 py-4">
      <PageHeader
        title={t('sports.teams')}
        description={t('sports.teamsCount', { count: teams.length })}
        action={
          <CreateTeamSheet orgSlug={orgSlug}>
            <Button size="sm" className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              {t('sports.newTeam')}
            </Button>
          </CreateTeamSheet>
        }
      />
      <TeamsTable teams={teams} orgSlug={orgSlug} />
    </div>
  )
}
