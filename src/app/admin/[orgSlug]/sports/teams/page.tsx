import { requirePermission } from '@/lib/auth'
import { getTeamsByOrg } from '@/domains/sports/queries/squad.queries'
import { redirect } from 'next/navigation'
import { TeamsTable } from './_components/teams-table'
import { CreateTeamSheet } from './_components/create-team-sheet'
import { PageHeader } from '@/components/admin/page-header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Props {
  params: Promise<{ orgSlug: string }>
}

export default async function TeamsPage({ params }: Props) {
  const { orgSlug } = await params
  const ctx = await requirePermission(orgSlug, 'teams', 'read').catch(() => redirect('/login'))

  const teams = await getTeamsByOrg(ctx.organizationId)

  return (
    <div className="space-y-4 py-4">
      <PageHeader
        title="Equipos"
        description={`${teams.length} equipo${teams.length !== 1 ? 's' : ''} registrado${teams.length !== 1 ? 's' : ''}`}
        action={
          <CreateTeamSheet orgSlug={orgSlug}>
            <Button size="sm" className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo equipo
            </Button>
          </CreateTeamSheet>
        }
      />
      <TeamsTable teams={teams} orgSlug={orgSlug} />
    </div>
  )
}
