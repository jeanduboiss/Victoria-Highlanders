'use client'

import { useTranslations } from 'next-intl'
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

interface Props {
  standings: StandingsRow[]
}

export function StandingsTable({ standings }: Props) {
  const t = useTranslations('admin.pages.sports.standings')
  const tc = useTranslations('subpages.roster.categories')

  if (!standings.length)
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        {t('noResults')}
      </div>
    )

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-center">#</TableHead>
            <TableHead>{t('team')}</TableHead>
            <TableHead className="text-center">{t('mp')}</TableHead>
            <TableHead className="text-center">{t('w')}</TableHead>
            <TableHead className="text-center">{t('d')}</TableHead>
            <TableHead className="text-center">{t('l')}</TableHead>
            <TableHead className="text-center hidden sm:table-cell">{t('gf')}</TableHead>
            <TableHead className="text-center hidden sm:table-cell">{t('ga')}</TableHead>
            <TableHead className="text-center">{t('gd')}</TableHead>
            <TableHead className="text-center font-bold">{t('pts')}</TableHead>
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
                  <span className="font-medium truncate max-w-[120px] sm:max-w-none">
                    {row.team.shortName ?? row.team.name}
                  </span>
                  <Badge variant="outline" className="text-[10px] hidden md:inline-flex px-1 h-4">
                    {tc(row.team.category)}
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
