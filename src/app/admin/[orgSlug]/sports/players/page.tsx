import { requirePermission } from '@/lib/auth'
import { getPlayersByOrg } from '@/domains/sports/queries/squad.queries'
import { redirect } from 'next/navigation'
import { PlayersTable } from './_components/players-table'
import { CreatePlayerSheet } from './_components/create-player-sheet'
import { PageHeader } from '@/components/admin/page-header'
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
      <PageHeader
        title="Jugadores"
        description={`${players.length} jugador${players.length !== 1 ? 'es' : ''} en el pool`}
        action={
          <CreatePlayerSheet orgSlug={orgSlug}>
            <Button size="sm" className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo jugador
            </Button>
          </CreatePlayerSheet>
        }
      />
      <PlayersTable players={players} orgSlug={orgSlug} />
    </div>
  )
}
