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

type Match = {
  id: string
  matchDate: Date
  competitionName: string | null
  homeTeam: { name: string }
  awayTeam: { name: string }
  homeScore: number | null
  awayScore: number | null
  status: string
  venue: { name: string } | null
}

interface MatchesTableProps {
  matches: Match[]
  orgSlug: string
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Programado',
  LIVE: 'En vivo',
  FINISHED: 'Finalizado',
  POSTPONED: 'Aplazado',
  CANCELLED: 'Cancelado',
  ABANDONED: 'Abandonado',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  SCHEDULED: 'outline',
  LIVE: 'default',
  FINISHED: 'secondary',
  POSTPONED: 'destructive',
  CANCELLED: 'destructive',
  ABANDONED: 'destructive',
}

export function MatchesTable({ matches, orgSlug }: MatchesTableProps) {
  if (matches.length === 0)
    return <p className="text-sm text-muted-foreground py-8 text-center">No hay partidos registrados.</p>

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Partido</TableHead>
            <TableHead>Resultado</TableHead>
            <TableHead>Competición</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match) => (
            <TableRow key={match.id}>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {new Date(match.matchDate).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell>
                <span className="font-medium">{match.homeTeam.name}</span>
                <span className="text-muted-foreground mx-2">vs</span>
                <span className="font-medium">{match.awayTeam.name}</span>
              </TableCell>
              <TableCell>
                {match.homeScore != null && match.awayScore != null ? (
                  <span className="font-mono font-semibold">
                    {match.homeScore} – {match.awayScore}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm">
                {match.competitionName ?? <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANTS[match.status] ?? 'secondary'} className="text-xs">
                  {STATUS_LABELS[match.status] ?? match.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/admin/${orgSlug}/sports/matches/${match.id}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
