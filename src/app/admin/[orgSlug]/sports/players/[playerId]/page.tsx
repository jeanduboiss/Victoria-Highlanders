import { requirePermission } from '@/lib/auth'
import { getPlayerWithHistory, getTeamsByOrg, getSeasonsByOrg } from '@/domains/sports/queries/squad.queries'

type PlayerData = NonNullable<Awaited<ReturnType<typeof getPlayerWithHistory>>>
type SeasonRow = Awaited<ReturnType<typeof getSeasonsByOrg>>[number]
import { redirect, notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    ArrowLeft,
    Calendar,
    Ruler,
    Weight,
    Footprints,
    User,
    Shield,
    UserMinus,
} from 'lucide-react'
import Link from 'next/link'
import { PlayerSeasonHistory } from './_components/player-season-history'
import { EnrollPlayerSheet } from './_components/enroll-player-sheet'
import { TransferPlayerSheet } from './_components/transfer-player-sheet'
import { DeactivatePlayerButton } from './_components/deactivate-player-button'

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
        <div className="space-y-6 py-4">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="shrink-0">
                    <Link href={`/admin/${orgSlug}/sports/players`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight truncate">
                            {player.firstName} {player.lastName}
                        </h1>
                        <Badge variant={player.isActive ? 'default' : 'secondary'} className="text-xs shrink-0">
                            {player.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                    </div>
                    {player.position && (
                        <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium mt-1 ${POSITION_COLORS[player.position] ?? ''}`}
                        >
                            {POSITION_LABELS[player.position] ?? player.position}
                        </span>
                    )}
                </div>
            </div>

            {/* Player card + info grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Columna izquierda — Perfil del jugador */}
                <div className="space-y-6">
                    {/* Card de perfil visual */}
                    <Card className="overflow-hidden border-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                {/* Avatar placeholder */}
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/5 ring-2 ring-white/10 mb-4">
                                    {player.jerseyNumberDefault ? (
                                        <span className="text-3xl font-black text-white">{player.jerseyNumberDefault}</span>
                                    ) : (
                                        <User className="h-10 w-10 text-zinc-400" />
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-white">
                                    {player.firstName} {player.lastName}
                                </h2>
                                {currentRecord && (
                                    <p className="text-sm text-zinc-400 mt-1">
                                        {currentRecord.team.name} • #{currentRecord.jerseyNumber ?? '—'}
                                    </p>
                                )}
                            </div>

                            {/* Stats rápidos */}
                            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{age ?? '—'}</p>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Edad</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{player.heightCm ?? '—'}</p>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider">cm</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{player.weightKg ?? '—'}</p>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider">kg</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detalles personales */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Datos personales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {player.dateOfBirth && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">Nacimiento</span>
                                    <span className="ml-auto font-medium">
                                        {new Date(player.dateOfBirth).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            )}
                            {primaryNation && (
                                <div className="flex items-center gap-3">
                                    <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">Nacionalidad</span>
                                    <span className="ml-auto font-medium">{primaryNation.country}</span>
                                </div>
                            )}
                            {player.preferredFoot && (
                                <div className="flex items-center gap-3">
                                    <Footprints className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">Pie</span>
                                    <span className="ml-auto font-medium">{FOOT_LABELS[player.preferredFoot] ?? player.preferredFoot}</span>
                                </div>
                            )}
                            {player.heightCm && (
                                <div className="flex items-center gap-3">
                                    <Ruler className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">Altura</span>
                                    <span className="ml-auto font-medium">{player.heightCm} cm</span>
                                </div>
                            )}
                            {player.weightKg && (
                                <div className="flex items-center gap-3">
                                    <Weight className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">Peso</span>
                                    <span className="ml-auto font-medium">{player.weightKg} kg</span>
                                </div>
                            )}
                            {player.biography && (
                                <>
                                    <Separator />
                                    <p className="text-muted-foreground text-xs leading-relaxed">{player.biography}</p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Acciones */}
                    <Card>
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
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Shield className="mr-2 h-4 w-4" />
                                    Enrolar en equipo
                                </Button>
                            </EnrollPlayerSheet>

                            {currentRecord && (
                                <TransferPlayerSheet
                                    orgSlug={orgSlug}
                                    currentRecordId={currentRecord.id}
                                    currentTeamName={currentRecord.team.name}
                                    teams={teams}
                                >
                                    <Button variant="outline" size="sm" className="w-full justify-start">
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

                {/* Columna derecha — Historial de temporadas */}
                <div className="lg:col-span-2">
                    <Card>
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
                        <CardContent>
                            <PlayerSeasonHistory records={player.seasonRecords} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
