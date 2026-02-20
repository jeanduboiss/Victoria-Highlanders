'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowRight, Swords } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  LIVE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  FINISHED: 'bg-muted text-muted-foreground border-border',
  POSTPONED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  CANCELLED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  ABANDONED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
}

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'SCHEDULED', label: 'Programados' },
  { value: 'LIVE', label: 'En vivo' },
  { value: 'FINISHED', label: 'Finalizados' },
  { value: 'POSTPONED', label: 'Aplazados' },
]

export function MatchesTable({ matches, orgSlug }: MatchesTableProps) {
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filtered = statusFilter === 'ALL'
    ? matches
    : matches.filter((m) => m.status === statusFilter)

  if (matches.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center rounded-xl border bg-card">
        <Swords className="size-10 text-muted-foreground/40" />
        <div>
          <p className="text-sm font-medium">No hay partidos registrados</p>
          <p className="text-xs text-muted-foreground mt-0.5">Programa el primer partido para comenzar.</p>
        </div>
      </div>
    )

  return (
    <div className="space-y-3">
      {/* Status filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {FILTER_OPTIONS.map((opt) => {
          const count = opt.value === 'ALL' ? matches.length : matches.filter((m) => m.status === opt.value).length
          if (opt.value !== 'ALL' && count === 0) return null
          return (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors cursor-pointer',
                statusFilter === opt.value
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
              )}
            >
              {opt.label}
              <span className={cn('text-[10px]', statusFilter === opt.value ? 'opacity-70' : 'opacity-50')}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">No hay partidos con ese estado.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4 whitespace-nowrap">Fecha</TableHead>
                  <TableHead>Partido</TableHead>
                  <TableHead className="text-center">Resultado</TableHead>
                  <TableHead className="hidden md:table-cell">Competición</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[52px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((match) => (
                  <TableRow key={match.id} className="group">
                    <TableCell className="pl-4 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(match.matchDate).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap text-sm">
                        <span className="font-medium">{match.homeTeam.name}</span>
                        <span className="text-muted-foreground text-xs">vs</span>
                        <span className="font-medium">{match.awayTeam.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {match.homeScore != null && match.awayScore != null ? (
                        <span className="font-mono font-semibold text-sm bg-muted rounded-md px-2 py-0.5">
                          {match.homeScore} – {match.awayScore}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {match.competitionName ?? '—'}
                    </TableCell>
                    <TableCell>
                      <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full border', STATUS_STYLES[match.status] ?? STATUS_STYLES.FINISHED)}>
                        {STATUS_LABELS[match.status] ?? match.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="size-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Link
                          href={`/admin/${orgSlug}/sports/matches/${match.id}`}
                          aria-label={`Ver partido ${match.homeTeam.name} vs ${match.awayTeam.name}`}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
