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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowRight, Users } from 'lucide-react'

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

const POSITION_COLORS: Record<string, string> = {
  GOALKEEPER: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  DEFENDER: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  MIDFIELDER: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  FORWARD: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
}

export function PlayersTable({ players, orgSlug }: PlayersTableProps) {
  if (players.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center rounded-xl border bg-card">
        <Users className="size-10 text-muted-foreground/40" />
        <div>
          <p className="text-sm font-medium">No hay jugadores registrados</p>
          <p className="text-xs text-muted-foreground mt-0.5">Agrega el primer jugador para comenzar.</p>
        </div>
      </div>
    )

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Jugador</TableHead>
              <TableHead>Posición</TableHead>
              <TableHead className="hidden sm:table-cell">Nac.</TableHead>
              <TableHead className="hidden md:table-cell">Edad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[52px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => {
              const primary = player.nationalities.find((n) => n.isPrimary)
              const age = player.dateOfBirth
                ? Math.floor((Date.now() - new Date(player.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
                : null
              const initials = `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`.toUpperCase()

              return (
                <TableRow key={player.id} className="group">
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-7 shrink-0">
                        <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">
                        {player.firstName} {player.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {player.position ? (
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${POSITION_COLORS[player.position] ?? 'bg-muted text-muted-foreground border-border'}`}
                      >
                        {POSITION_LABELS[player.position] ?? player.position}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {primary?.country ?? '—'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {age != null ? `${age} años` : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={player.isActive ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {player.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="size-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Link
                        href={`/admin/${orgSlug}/sports/players/${player.id}`}
                        aria-label={`Ver perfil de ${player.firstName} ${player.lastName}`}
                      >
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
    </div>
  )
}
