import { requirePermission } from '@/lib/auth'
import { getSeasonsByOrg } from '@/domains/sports/queries/squad.queries'
import { redirect } from 'next/navigation'
import { SeasonsTable } from './_components/seasons-table'
import { CreateSeasonSheet } from './_components/create-season-sheet'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Props {
    params: Promise<{ orgSlug: string }>
}

export default async function SeasonsPage({ params }: Props) {
    const { orgSlug } = await params
    const ctx = await requirePermission(orgSlug, 'seasons', 'read').catch(() => redirect('/login'))

    const seasons = await getSeasonsByOrg(ctx.organizationId)

    return (
        <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Temporadas</h1>
                    <p className="text-muted-foreground">{seasons.length} temporada(s) registradas.</p>
                </div>
                <CreateSeasonSheet orgSlug={orgSlug}>
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva temporada
                    </Button>
                </CreateSeasonSheet>
            </div>
            <SeasonsTable seasons={seasons} orgSlug={orgSlug} />
        </div>
    )
}
