'use client'

import { useAction } from 'next-safe-action/hooks'
import { removeMatchEventAction } from '@/domains/sports/actions/match.actions'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

interface MatchEvent {
    id: string
    eventType: string
    minute: number
    extraTimeMinute: number | null
    description: string | null
    player: {
        firstName: string
        lastName: string
        position: string | null
    }
}

interface MatchEventsTimelineProps {
    events: MatchEvent[]
    orgSlug: string
}

const EVENT_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
    GOAL: { icon: '⚽', label: 'Gol', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    OWN_GOAL: { icon: '⚽', label: 'Autogol', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
    YELLOW_CARD: { icon: '🟨', label: 'Amarilla', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    RED_CARD: { icon: '🟥', label: 'Roja', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
    YELLOW_RED_CARD: { icon: '🟨🟥', label: 'Doble amarilla', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
    SUBSTITUTION_IN: { icon: '🔼', label: 'Entra', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    SUBSTITUTION_OUT: { icon: '🔽', label: 'Sale', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
    PENALTY_SCORED: { icon: '⚽', label: 'Penal anotado', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    PENALTY_MISSED: { icon: '❌', label: 'Penal fallado', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
}

export function MatchEventsTimeline({ events, orgSlug }: MatchEventsTimelineProps) {
    const { execute, isPending } = useAction(removeMatchEventAction, {
        onSuccess: () => toast.success('Evento eliminado. Estadísticas actualizadas.'),
        onError: ({ error }) => toast.error(error.serverError ?? 'Error al eliminar evento.'),
    })

    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                    <span className="text-2xl">⚽</span>
                </div>
                <p className="text-sm text-muted-foreground">No hay eventos registrados</p>
                <p className="text-xs text-muted-foreground mt-1">Agrega goles, tarjetas y sustituciones</p>
            </div>
        )
    }

    return (
        <div className="relative space-y-0">
            {/* Línea vertical de timeline */}
            <div className="absolute left-[23px] top-3 bottom-3 w-px bg-border" />

            {events.map((event, i) => {
                const config = EVENT_CONFIG[event.eventType] ?? {
                    icon: '📋',
                    label: event.eventType,
                    color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
                }

                const minuteStr = event.extraTimeMinute
                    ? `${event.minute}+${event.extraTimeMinute}'`
                    : `${event.minute}'`

                return (
                    <div key={event.id} className="relative flex items-start gap-4 py-3 group">
                        {/* Indicador de timeline */}
                        <div className="relative z-10 flex h-[46px] w-[46px] shrink-0 items-center justify-center">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm ${config.color}`}>
                                <span className="text-base">{config.icon}</span>
                            </div>
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0 pt-1">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-muted-foreground tabular-nums">
                                    {minuteStr}
                                </span>
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {config.label}
                                </span>
                            </div>
                            <p className="text-sm font-medium mt-0.5">
                                {event.player.firstName} {event.player.lastName}
                            </p>
                            {event.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                            )}
                        </div>

                        {/* Botón eliminar */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Eliminar este evento?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Se eliminará el evento &ldquo;{config.label}&rdquo; de {event.player.firstName} {event.player.lastName} al minuto {minuteStr}. Las estadísticas se recalcularán automáticamente.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            onClick={() => execute({ orgSlug, eventId: event.id })}
                                            disabled={isPending}
                                        >
                                            {isPending ? 'Eliminando...' : 'Eliminar'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
