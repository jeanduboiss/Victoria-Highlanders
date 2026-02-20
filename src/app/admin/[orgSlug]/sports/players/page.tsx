import { requirePermission } from '@/lib/auth'
import { getPlayersByOrg } from '@/domains/sports/queries/squad.queries'
import { redirect } from 'next/navigation'
import { PlayersTable } from './_components/players-table'
import { CreatePlayerSheet } from './_components/create-player-sheet'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Props {
  params: Promise<{ orgSlug: string }>
}

export default async function PlayersPage({ params }: Props) {
  const { orgSlug } = await params
  const ctx = await requirePermission(orgSlug, 'players', 'read').catch(() => redirect('/login'))

  const players = await getPlayersByOrg(ctx.organizationId)

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jugadores</h1>
          <p className="text-muted-foreground">{players.length} jugador(es) en el pool.</p>
        </div>
        <CreatePlayerSheet orgSlug={orgSlug}>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo jugador
          </Button>
        </CreatePlayerSheet>
      </div>
      <PlayersTable players={players} orgSlug={orgSlug} />
    </div>
  )
}
