'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowRight } from 'lucide-react'

type Player = {
  id: string
  firstName: string
  lastName: string
  position: string | null
  dateOfBirth: Date | null
  isActive: boolean
  nationalities: { country: string; isPrimary: boolean }[]
}

interface PlayersTableProps {
  players: Player[]
  orgSlug: string
}

const POSITION_LABELS: Record<string, string> = {
  GOALKEEPER: 'Portero',
  DEFENDER: 'Defensa',
  MIDFIELDER: 'Centrocampista',
  FORWARD: 'Delantero',
}

export function PlayersTable({ players, orgSlug }: PlayersTableProps) {
  if (players.length === 0)
    return <p className="text-sm text-muted-foreground py-8 text-center">No hay jugadores registrados.</p>

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Posición</TableHead>
            <TableHead>Nacionalidad</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const primary = player.nationalities.find((n) => n.isPrimary)
            const age = player.dateOfBirth
              ? Math.floor((Date.now() - new Date(player.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
              : null

            return (
              <TableRow key={player.id}>
                <TableCell className="font-medium">
                  {player.firstName} {player.lastName}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {player.position ? (POSITION_LABELS[player.position] ?? player.position) : '—'}
                </TableCell>
                <TableCell className="text-sm">
                  {primary?.country ?? '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {age != null ? `${age} años` : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={player.isActive ? 'default' : 'secondary'} className="text-xs">
                    {player.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/${orgSlug}/sports/players/${player.id}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
