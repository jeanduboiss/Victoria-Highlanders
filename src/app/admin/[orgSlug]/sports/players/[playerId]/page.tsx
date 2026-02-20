import { requirePermission } from '@/lib/auth'
import { getPlayerWithHistory, getTeamsByOrg, getSeasonsByOrg } from '@/domains/sports/queries/squad.queries'

type PlayerData = NonNullable<Awaited<ReturnType<typeof getPlayerWithHistory>>>
type SeasonRow = Awaited<ReturnType<typeof getSeasonsByOrg>>[number]

import { redirect, notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    ArrowLeft,
    Calendar,
    Ruler,
    Weight,
    Footprints,
    User,
    Shield,
    BarChart3,
    Flag,
} from 'lucide-react'
import Link from 'next/link'
import { NumberTicker } from '@/components/ui/number-ticker'
import { PlayerSeasonHistory } from './_components/player-season-history'
import { EnrollPlayerSheet } from './_components/enroll-player-sheet'
import { TransferPlayerSheet } from './_components/transfer-player-sheet'
import { DeactivatePlayerButton } from './_components/deactivate-player-button'
import { EditPlayerStatsSheet } from './_components/edit-player-stats-sheet'

interface Props {
    params: Promise<{ orgSlug: string; playerId: string }>
}

const POSITION_LABELS: Record<string, string> = {
    GOALKEEPER: 'Portero',
    DEFENDER: 'Defensa',
    MIDFIELDER: 'Centrocampista',
    FORWARD: 'Delantero',
}

const POSITION_COLORS: Record<string, string> = {
    GOALKEEPER: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    DEFENDER: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    MIDFIELDER: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    FORWARD: 'bg-red-500/10 text-red-500 border-red-500/20',
}

const FOOT_LABELS: Record<string, string> = {
    LEFT: 'Izquierdo',
    RIGHT: 'Derecho',
    BOTH: 'Ambidiestro',
}

export default async function PlayerDetailPage({ params }: Props) {
    const { orgSlug, playerId } = await params
    const ctx = await requirePermission(orgSlug, 'players', 'read').catch(() => redirect('/login'))

    const [player, teams, seasons] = await Promise.all([
        getPlayerWithHistory(playerId, ctx.organizationId),
        getTeamsByOrg(ctx.organizationId),
        getSeasonsByOrg(ctx.organizationId),
    ])

    if (!player) notFound()

    const age = player.dateOfBirth
        ? Math.floor((Date.now() - new Date(player.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        : null

    const primaryNation = player.nationalities.find((n: PlayerData['nationalities'][number]) => n.isPrimary)
    const currentRecord = player.seasonRecords.find((r: PlayerData['seasonRecords'][number]) => r.isCurrent)

    return (
        <div className="flex flex-col gap-4 py-4 min-w-0">
            {/* Header compacto */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild className="shrink-0 size-8">
                    <Link href={`/admin/${orgSlug}/sports/players`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <h1 className="text-xl font-bold tracking-tight truncate">
                        {player.firstName} {player.lastName}
                    </h1>
                    <Badge variant={player.isActive ? 'default' : 'secondary'} className="text-[10px] shrink-0">
                        {player.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                    {player.position && (
                        <span
                            className={`hidden sm:inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0 ${POSITION_COLORS[player.position] ?? ''}`}
                        >
                            {POSITION_LABELS[player.position] ?? player.position}
                        </span>
                    )}
                </div>
            </div>

            {/* Layout principal — 3 columnas */}
            <div className="grid gap-4 lg:grid-cols-[280px_1fr_240px]">

                {/* Col 1: Card de perfil visual */}
                <Card className="overflow-hidden shadow-2xl lg:row-span-2">
                    <CardContent className="p-5">
                        <div className="flex flex-col items-center text-center">
                            {/* Avatar */}
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted ring-2 ring-border mb-3">
                                {player.jerseyNumberDefault ? (
                                    <span className="text-2xl font-black text-foreground">{player.jerseyNumberDefault}</span>
                                ) : (
                                    <User className="h-8 w-8 text-muted-foreground" />
                                )}
                            </div>
                            <h2 className="text-lg font-bold text-foreground">
                                {player.firstName} {player.lastName}
                            </h2>
                            {currentRecord && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {currentRecord.team.name} • #{currentRecord.jerseyNumber ?? '—'}
                                </p>
                            )}
                            {player.position && (
                                <span
                                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium mt-2 ${POSITION_COLORS[player.position] ?? ''}`}
                                >
                                    {POSITION_LABELS[player.position] ?? player.position}
                                </span>
                            )}
                        </div>

                        {/* Stats físicos */}
                        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-border">
                            <div className="text-center">
                                <p className="text-xl font-bold text-foreground">{age ?? '—'}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Edad</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-foreground">{player.heightCm ?? '—'}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">cm</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-foreground">{player.weightKg ?? '—'}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">kg</p>
                            </div>
                        </div>

                        {/* Career stats */}
                        <div className="grid grid-cols-4 gap-1.5 mt-4 pt-4 border-t border-border">
                            {[
                                { label: 'PJ', value: player.careerStats.matchesPlayed },
                                { label: 'Goles', value: player.careerStats.goals },
                                { label: '🟨', value: player.careerStats.yellowCards },
                                { label: '🟥', value: player.careerStats.redCards },
                            ].map((s) => (
                                <div key={s.label} className="text-center rounded-lg bg-muted py-2 px-1">
                                    <NumberTicker
                                        value={s.value}
                                        className="text-base font-bold text-foreground"
                                    />
                                    <p className="text-[9px] text-muted-foreground mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Datos personales inline */}
                        <div className="mt-4 pt-4 border-t border-border space-y-2.5">
                            {player.dateOfBirth && (
                                <div className="flex items-center gap-2 text-xs">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">Nacimiento</span>
                                    <span className="ml-auto font-medium text-foreground">
                                        {new Date(player.dateOfBirth).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            )}
                            {primaryNation && (
                                <div className="flex items-center gap-2 text-xs">
                                    <Flag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">Nacionalidad</span>
                                    <span className="ml-auto font-medium text-foreground">{primaryNation.country}</span>
                                </div>
                            )}
                            {player.preferredFoot && (
                                <div className="flex items-center gap-2 text-xs">
                                    <Footprints className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">Pie</span>
                                    <span className="ml-auto font-medium text-foreground">{FOOT_LABELS[player.preferredFoot] ?? player.preferredFoot}</span>
                                </div>
                            )}
                            {player.heightCm && (
                                <div className="flex items-center gap-2 text-xs">
                                    <Ruler className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">Altura</span>
                                    <span className="ml-auto font-medium text-foreground">{player.heightCm} cm</span>
                                </div>
                            )}
                            {player.weightKg && (
                                <div className="flex items-center gap-2 text-xs">
                                    <Weight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">Peso</span>
                                    <span className="ml-auto font-medium text-foreground">{player.weightKg} kg</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Col 2: Historial de temporadas */}
                <Card className="lg:row-span-2 flex flex-col">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                            Historial de temporadas
                            {player.seasonRecords.length > 0 && (
                                <span className="ml-2 text-xs text-muted-foreground font-normal">
                                    ({player.seasonRecords.length})
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <PlayerSeasonHistory records={player.seasonRecords} orgSlug={orgSlug} />
                    </CardContent>
                </Card>

                {/* Col 3: Acciones */}
                <Card className="h-fit">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Acciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <EnrollPlayerSheet
                            orgSlug={orgSlug}
                            playerId={player.id}
                            teams={teams}
                            seasons={seasons.filter((s: SeasonRow) => !s.isArchived)}
                        >
                            <Button variant="outline" size="sm" className="w-full justify-start cursor-pointer">
                                <Shield className="mr-2 h-4 w-4" />
                                Enrolar en equipo
                            </Button>
                        </EnrollPlayerSheet>

                        {currentRecord && currentRecord.seasonStats && !currentRecord.seasonStats.isLocked ? (
                            <EditPlayerStatsSheet
                                orgSlug={orgSlug}
                                stats={currentRecord.seasonStats}
                                teamName={currentRecord.team.name}
                                seasonName={currentRecord.season.name}
                            >
                                <Button variant="outline" size="sm" className="w-full justify-start cursor-pointer">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Editar estadísticas
                                </Button>
                            </EditPlayerStatsSheet>
                        ) : (
                            <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Editar estadísticas
                            </Button>
                        )}

                        {currentRecord && (
                            <TransferPlayerSheet
                                orgSlug={orgSlug}
                                currentRecordId={currentRecord.id}
                                currentTeamName={currentRecord.team.name}
                                teams={teams}
                            >
                                <Button variant="outline" size="sm" className="w-full justify-start cursor-pointer">
                                    <Footprints className="mr-2 h-4 w-4" />
                                    Transferir
                                </Button>
                            </TransferPlayerSheet>
                        )}

                        {player.isActive && (
                            <DeactivatePlayerButton orgSlug={orgSlug} playerId={player.id} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
