import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { StandingsRow } from '@/domains/sports/queries/standings.query'
import type { TeamCategory } from '@prisma/client'

const CATEGORY_LABELS: Record<TeamCategory, string> = {
  FIRST_TEAM: 'Primera',
  RESERVE: 'Reservas',
  U23: 'Sub-23',
  U20: 'Sub-20',
  U18: 'Sub-18',
  U16: 'Sub-16',
  U14: 'Sub-14',
  U12: 'Sub-12',
  WOMEN: 'Femenino',
  FUTSAL: 'Fútsal',
}

interface Props {
  standings: StandingsRow[]
}

export function StandingsTable({ standings }: Props) {
  if (!standings.length)
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        No hay partidos finalizados con estos filtros
      </div>
    )

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-center">#</TableHead>
            <TableHead>Equipo</TableHead>
            <TableHead className="text-center">PJ</TableHead>
            <TableHead className="text-center">G</TableHead>
            <TableHead className="text-center">E</TableHead>
            <TableHead className="text-center">P</TableHead>
            <TableHead className="text-center hidden sm:table-cell">GF</TableHead>
            <TableHead className="text-center hidden sm:table-cell">GC</TableHead>
            <TableHead className="text-center">DG</TableHead>
            <TableHead className="text-center font-bold">Pts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((row, i) => (
            <TableRow key={row.team.id}>
              <TableCell className="text-center text-muted-foreground text-sm">{i + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {row.team.badgeUrl && (
                    <img
                      src={row.team.badgeUrl}
                      alt={row.team.name}
                      className="h-5 w-5 object-contain shrink-0"
                    />
                  )}
                  <span className="font-medium">{row.team.shortName ?? row.team.name}</span>
                  <Badge variant="outline" className="text-xs hidden md:inline-flex">
                    {CATEGORY_LABELS[row.team.category]}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-center">{row.mp}</TableCell>
              <TableCell className="text-center">{row.w}</TableCell>
              <TableCell className="text-center">{row.d}</TableCell>
              <TableCell className="text-center">{row.l}</TableCell>
              <TableCell className="text-center hidden sm:table-cell">{row.gf}</TableCell>
              <TableCell className="text-center hidden sm:table-cell">{row.ga}</TableCell>
              <TableCell className="text-center">
                {row.gd > 0 ? `+${row.gd}` : row.gd}
              </TableCell>
              <TableCell className="text-center font-bold">{row.pts}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
