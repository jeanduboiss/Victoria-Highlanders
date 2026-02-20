'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updatePlayerStatsSchema } from '@/domains/sports/schemas/squad.schema'
import { updatePlayerStatsAction } from '@/domains/sports/actions/squad.actions'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
    Target,
    HandHelping,
    Clock,
    Play,
    Timer,
    CircleAlert,
    CircleX,
    ShieldCheck,
    Goal,
    Hand,
} from 'lucide-react'

type FormValues = z.infer<typeof updatePlayerStatsSchema>

interface PlayerStats {
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

interface EditPlayerStatsSheetProps {
    orgSlug: string
    stats: PlayerStats
    teamName: string
    seasonName: string
    children: React.ReactNode
}

const STAT_FIELDS = [
    { name: 'matchesPlayed' as const, label: 'Partidos jugados', icon: Play, group: 'participation' },
    { name: 'matchesStarted' as const, label: 'Partidos titular', icon: Timer, group: 'participation' },
    { name: 'minutesPlayed' as const, label: 'Minutos jugados', icon: Clock, group: 'participation' },
    { name: 'goals' as const, label: 'Goles', icon: Target, group: 'offense' },
    { name: 'assists' as const, label: 'Asistencias', icon: HandHelping, group: 'offense' },
    { name: 'yellowCards' as const, label: 'Tarjetas amarillas', icon: CircleAlert, group: 'discipline' },
    { name: 'redCards' as const, label: 'Tarjetas rojas', icon: CircleX, group: 'discipline' },
    { name: 'cleanSheets' as const, label: 'Porterías imbatidas', icon: ShieldCheck, group: 'defense' },
    { name: 'goalsConceded' as const, label: 'Goles recibidos', icon: Goal, group: 'defense' },
    { name: 'saves' as const, label: 'Atajadas', icon: Hand, group: 'defense' },
] as const

const STAT_GROUPS = [
    { key: 'participation', label: 'Participación' },
    { key: 'offense', label: 'Ofensiva' },
    { key: 'discipline', label: 'Disciplina' },
    { key: 'defense', label: 'Defensa / Portero' },
]

export function EditPlayerStatsSheet({ orgSlug, stats, teamName, seasonName, children }: EditPlayerStatsSheetProps) {
    const [open, setOpen] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(updatePlayerStatsSchema),
        defaultValues: {
            orgSlug,
            statsId: stats.id,
            matchesPlayed: stats.matchesPlayed,
            matchesStarted: stats.matchesStarted,
            minutesPlayed: stats.minutesPlayed,
            goals: stats.goals,
            assists: stats.assists,
            yellowCards: stats.yellowCards,
            redCards: stats.redCards,
            cleanSheets: stats.cleanSheets,
            goalsConceded: stats.goalsConceded,
            saves: stats.saves,
        },
    })

    const { execute, isPending } = useAction(updatePlayerStatsAction, {
        onSuccess: () => {
            toast.success('Estadísticas actualizadas correctamente.')
            setOpen(false)
        },
        onError: ({ error }) => {
            toast.error(error.serverError ?? 'Error al actualizar las estadísticas.')
        },
    })

    function onSubmit(values: FormValues) {
        execute(values)
    }

    if (stats.isLocked) return null

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full sm:w-[440px] md:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Editar estadísticas</SheetTitle>
                    <SheetDescription>
                        {teamName} • {seasonName}
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-6">
                        {STAT_GROUPS.map((group) => {
                            const fields = STAT_FIELDS.filter((f) => f.group === group.key)
                            if (fields.length === 0) return null

                            return (
                                <div key={group.key}>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                        {group.label}
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {fields.map((statField) => (
                                            <FormField
                                                key={statField.name}
                                                control={form.control}
                                                name={statField.name}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-1.5 text-xs">
                                                            <statField.icon className="size-3.5 text-muted-foreground" />
                                                            {statField.label}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                className="h-9"
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                                value={field.value ?? 0}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <Separator className="mt-4" />
                                </div>
                            )
                        })}

                        <div className="flex gap-2 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isPending}>
                                {isPending ? 'Guardando...' : 'Guardar estadísticas'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
