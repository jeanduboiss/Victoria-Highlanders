'use client'

import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Lock } from 'lucide-react'

interface SeasonRecord {
    id: string
    jerseyNumber: number | null
    transferInDate: Date
    transferOutDate: Date | null
    isCurrent: boolean
    isLocked: boolean
    status: string
    contractType: string
    team: { name: string; category: string }
    season: { name: string; isArchived: boolean }
    seasonStats: {
        matchesPlayed: number
        goals: number
        assists: number
        yellowCards: number
        redCards: number
        minutesPlayed: number
    } | null
}

interface PlayerSeasonHistoryProps {
    records: SeasonRecord[]
}

const CONTRACT_LABELS: Record<string, string> = {
    PROFESSIONAL: 'Profesional',
    AMATEUR: 'Amateur',
    YOUTH: 'Juvenil',
}

const STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Activo',
    LOANED: 'Cedido',
    SUSPENDED: 'Suspendido',
    INJURED: 'Lesionado',
    TRANSFERRED: 'Transferido',
}

const CATEGORY_LABELS: Record<string, string> = {
    FIRST_TEAM: 'Primer equipo',
    RESERVE: 'Reserva',
    U23: 'Sub-23',
    U20: 'Sub-20',
    U18: 'Sub-18',
    U16: 'Sub-16',
    U14: 'Sub-14',
    U12: 'Sub-12',
    WOMEN: 'Femenino',
    FUTSAL: 'Futsal',
}

export function PlayerSeasonHistory({ records }: PlayerSeasonHistoryProps) {
    if (records.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                    <span className="text-2xl">📋</span>
                </div>
                <p className="text-sm text-muted-foreground">Sin historial de temporadas</p>
                <p className="text-xs text-muted-foreground mt-1">Enrola al jugador en un equipo para empezar</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Temporada</TableHead>
                        <TableHead>Equipo</TableHead>
                        <TableHead className="text-center">#</TableHead>
                        <TableHead className="text-center">PJ</TableHead>
                        <TableHead className="text-center">⚽</TableHead>
                        <TableHead className="text-center">🅰️</TableHead>
                        <TableHead className="text-center">🟨</TableHead>
                        <TableHead className="text-center">🟥</TableHead>
                        <TableHead>Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((record) => {
                        const stats = record.seasonStats
                        return (
                            <TableRow key={record.id} className={record.isLocked ? 'opacity-60' : ''}>
                                <TableCell className="font-medium whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        {record.season.name}
                                        {record.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="text-sm font-medium">{record.team.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {CATEGORY_LABELS[record.team.category] ?? record.team.category}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center font-mono text-sm">
                                    {record.jerseyNumber ?? '—'}
                                </TableCell>
                                <TableCell className="text-center font-mono text-sm">
                                    {stats?.matchesPlayed ?? 0}
                                </TableCell>
                                <TableCell className="text-center font-mono text-sm font-semibold">
                                    {stats?.goals ?? 0}
                                </TableCell>
                                <TableCell className="text-center font-mono text-sm">
                                    {stats?.assists ?? 0}
                                </TableCell>
                                <TableCell className="text-center font-mono text-sm">
                                    {stats?.yellowCards ?? 0}
                                </TableCell>
                                <TableCell className="text-center font-mono text-sm">
                                    {stats?.redCards ?? 0}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <Badge
                                            variant={record.isCurrent ? 'default' : 'secondary'}
                                            className="text-[10px] px-1.5"
                                        >
                                            {record.isCurrent ? 'Actual' : STATUS_LABELS[record.status] ?? record.status}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">
                                            {CONTRACT_LABELS[record.contractType] ?? record.contractType}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
