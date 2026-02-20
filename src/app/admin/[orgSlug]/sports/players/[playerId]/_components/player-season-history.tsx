'use client'

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
import { Lock, BarChart3 } from 'lucide-react'
import { EditPlayerStatsSheet } from './edit-player-stats-sheet'

interface SeasonStats {
    id: string
    matchesPlayed: number
    matchesStarted: number
    minutesPlayed: number
    goals: number
    assists: number
    yellowCards: number
    redCards: number
    cleanSheets: number
    goalsConceded: number
    saves: number
    isLocked: boolean
}

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
    seasonStats: SeasonStats | null
}

interface PlayerSeasonHistoryProps {
    records: SeasonRecord[]
    orgSlug: string
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

export function PlayerSeasonHistory({ records, orgSlug }: PlayerSeasonHistoryProps) {
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
        <div className="space-y-0">
            {/* Desktop: Table view */}
            <div className="hidden md:block rounded-md border overflow-x-auto">
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
                            <TableHead className="w-[48px]" />
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
                                    <TableCell>
                                        {stats && !stats.isLocked && (
                                            <EditPlayerStatsSheet
                                                orgSlug={orgSlug}
                                                stats={stats}
                                                teamName={record.team.name}
                                                seasonName={record.season.name}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 cursor-pointer"
                                                    title="Editar estadísticas"
                                                >
                                                    <BarChart3 className="h-3.5 w-3.5" />
                                                </Button>
                                            </EditPlayerStatsSheet>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile: Card view */}
            <div className="md:hidden space-y-3">
                {records.map((record) => {
                    const stats = record.seasonStats
                    return (
                        <div
                            key={record.id}
                            className={`rounded-xl border bg-card p-4 space-y-3 ${record.isLocked ? 'opacity-60' : ''}`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className="font-semibold text-sm">{record.season.name}</p>
                                        {record.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {record.team.name} • {CATEGORY_LABELS[record.team.category] ?? record.team.category}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Badge
                                        variant={record.isCurrent ? 'default' : 'secondary'}
                                        className="text-[10px] px-1.5"
                                    >
                                        {record.isCurrent ? 'Actual' : STATUS_LABELS[record.status] ?? record.status}
                                    </Badge>
                                    {record.jerseyNumber && (
                                        <span className="font-mono text-xs font-bold bg-muted px-1.5 py-0.5 rounded">
                                            #{record.jerseyNumber}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { label: 'PJ', value: stats?.matchesPlayed ?? 0 },
                                    { label: 'Goles', value: stats?.goals ?? 0 },
                                    { label: 'Asist.', value: stats?.assists ?? 0 },
                                    { label: 'Min.', value: stats?.minutesPlayed ?? 0 },
                                ].map((s) => (
                                    <div key={s.label} className="text-center rounded-lg bg-muted/50 p-2">
                                        <p className="text-sm font-bold">{s.value}</p>
                                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Discipline */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>🟨 {stats?.yellowCards ?? 0}</span>
                                <span>🟥 {stats?.redCards ?? 0}</span>
                                <span className="text-[10px]">{CONTRACT_LABELS[record.contractType] ?? record.contractType}</span>
                                {stats && !stats.isLocked && (
                                    <EditPlayerStatsSheet
                                        orgSlug={orgSlug}
                                        stats={stats}
                                        teamName={record.team.name}
                                        seasonName={record.season.name}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="ml-auto h-7 text-xs cursor-pointer"
                                        >
                                            <BarChart3 className="mr-1 h-3 w-3" />
                                            Editar stats
                                        </Button>
                                    </EditPlayerStatsSheet>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
