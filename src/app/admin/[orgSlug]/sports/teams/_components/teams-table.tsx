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
import { Shield } from 'lucide-react'

interface Team {
    id: string
    name: string
    shortName: string | null
    category: string
    gender: string
    description: string | null
}

interface TeamsTableProps {
    teams: Team[]
    orgSlug: string
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

const CATEGORY_COLORS: Record<string, string> = {
    FIRST_TEAM: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    RESERVE: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    WOMEN: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    FUTSAL: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
}

const GENDER_LABELS: Record<string, string> = {
    MALE: 'Masculino',
    FEMALE: 'Femenino',
    MIXED: 'Mixto',
}

export function TeamsTable({ teams, orgSlug }: TeamsTableProps) {
    if (teams.length === 0)
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center rounded-xl border bg-card">
                <Shield className="size-10 text-muted-foreground/40" />
                <div>
                    <p className="text-sm font-medium">No hay equipos registrados</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Crea el primer equipo para comenzar.</p>
                </div>
            </div>
        )

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
                <div
                    key={team.id}
                    className="group relative rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20 cursor-default"
                >
                    {/* Icono */}
                    <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5">
                            <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[team.category] ?? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                }`}
                        >
                            {CATEGORY_LABELS[team.category] ?? team.category}
                        </span>
                    </div>

                    {/* Info */}
                    <div className="mt-3">
                        <h3 className="font-semibold text-sm">{team.name}</h3>
                        {team.shortName && (
                            <p className="text-xs text-muted-foreground">{team.shortName}</p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <Badge variant="outline" className="text-[10px]">
                            {GENDER_LABELS[team.gender] ?? team.gender}
                        </Badge>
                        {team.description && (
                            <p className="text-[10px] text-muted-foreground truncate flex-1">{team.description}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
