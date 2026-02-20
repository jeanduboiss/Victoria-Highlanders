import { requirePermission } from '@/lib/auth'
import { getTeamsByOrg } from '@/domains/sports/queries/squad.queries'
import { redirect } from 'next/navigation'
import { TeamsTable } from './_components/teams-table'
import { CreateTeamSheet } from './_components/create-team-sheet'
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Equipos</h1>
                    <p className="text-muted-foreground">{teams.length} equipo(s) registrados.</p>
                </div>
                <CreateTeamSheet orgSlug={orgSlug}>
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo equipo
                    </Button>
                </CreateTeamSheet>
            </div>
            <TeamsTable teams={teams} orgSlug={orgSlug} />
        </div>
    )
}
