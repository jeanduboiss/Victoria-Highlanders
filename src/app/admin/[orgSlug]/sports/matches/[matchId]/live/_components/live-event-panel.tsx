'use client'

import { useState, useEffect } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { addMatchEventAction } from '@/domains/sports/actions/match.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { X } from 'lucide-react'

interface Player {
  id: string
  firstName: string
  lastName: string
  position: string | null
  jerseyNumber?: number | null
}

interface LiveEventPanelProps {
  orgSlug: string
  matchId: string
  players: Player[]
  liveStartedAt: Date | null
}

const EVENT_ACTIONS = [
  { value: 'GOAL', label: '⚽ Gol', needsAssist: true },
  { value: 'PENALTY_SCORED', label: '⚽ Penal', needsAssist: true },
  { value: 'YELLOW_CARD', label: '🟨 Amarilla', needsAssist: false },
  { value: 'RED_CARD', label: '🟥 Roja', needsAssist: false },
  { value: 'YELLOW_RED_CARD', label: '🟨🟥 2ª Amarilla', needsAssist: false },
  { value: 'SUBSTITUTION_IN', label: '🔼 Entra', needsAssist: false },
  { value: 'SUBSTITUTION_OUT', label: '🔽 Sale', needsAssist: false },
  { value: 'OWN_GOAL', label: '⚽ Autogol', needsAssist: false },
  { value: 'PENALTY_MISSED', label: '❌ Penal fallado', needsAssist: false },
] as const

function getCurrentMinute(liveStartedAt: Date | null): number {
  if (!liveStartedAt) return 1
  return Math.max(1, Math.floor((Date.now() - new Date(liveStartedAt).getTime()) / 60000) + 1)
}

export function LiveEventPanel({ orgSlug, matchId, players, liveStartedAt }: LiveEventPanelProps) {
  const router = useRouter()
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [assistPlayerId, setAssistPlayerId] = useState<string>('')
  const [minute, setMinute] = useState(() => getCurrentMinute(liveStartedAt))

  useEffect(() => {
    if (selectedEvent) setMinute(getCurrentMinute(liveStartedAt))
  }, [selectedEvent, liveStartedAt])

  const { execute, isPending } = useAction(addMatchEventAction, {
    onSuccess: () => {
      toast.success('Evento registrado')
      setSelectedPlayerId(null)
      setSelectedEvent(null)
      setAssistPlayerId('')
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al registrar evento'),
  })

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId)
  const eventConfig = EVENT_ACTIONS.find((e) => e.value === selectedEvent)

  function handleConfirm() {
    if (!selectedPlayerId || !selectedEvent) return
    execute({
      orgSlug,
      matchId,
      playerId: selectedPlayerId,
      eventType: selectedEvent as Parameters<typeof execute>[0]['eventType'],
      minute,
      assistPlayerId: assistPlayerId || undefined,
    })
  }

  if (selectedPlayerId && selectedEvent) {
    return (
      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Confirmar evento para</p>
            <p className="font-semibold text-sm">
              {selectedPlayer?.firstName} {selectedPlayer?.lastName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => { setSelectedEvent(null); setAssistPlayerId('') }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-lg bg-muted px-4 py-3 text-center">
          <span className="text-2xl">{eventConfig?.label}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Minuto</p>
            <Input
              type="number"
              min={1}
              max={120}
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="text-center font-mono font-bold"
            />
          </div>
        </div>

        {eventConfig?.needsAssist && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Asistencia (opcional)</p>
            <Select value={assistPlayerId} onValueChange={setAssistPlayerId}>
              <SelectTrigger>
                <SelectValue placeholder="Sin asistencia" />
              </SelectTrigger>
              <SelectContent className="max-h-[250px]">
                {players
                  .filter((p) => p.id !== selectedPlayerId)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => { setSelectedEvent(null); setAssistPlayerId('') }}
          >
            Atrás
          </Button>
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? 'Guardando...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    )
  }

  if (selectedPlayerId) {
    return (
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Jugador seleccionado</p>
            <p className="font-semibold">
              {selectedPlayer?.firstName} {selectedPlayer?.lastName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedPlayerId(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground font-medium">¿Qué ocurrió?</p>
        <div className="grid grid-cols-2 gap-2">
          {EVENT_ACTIONS.map((action) => (
            <Button
              key={action.value}
              variant="outline"
              className="h-auto py-3 text-sm font-medium justify-start"
              onClick={() => setSelectedEvent(action.value)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <p className="text-xs text-muted-foreground font-medium">Selecciona un jugador</p>
      <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {players.map((player) => (
          <button
            key={player.id}
            onClick={() => setSelectedPlayerId(player.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg border bg-background px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent hover:border-foreground/20 active:scale-95',
            )}
          >
            {player.jerseyNumber != null && (
              <span className="font-mono text-xs font-bold text-muted-foreground w-5 text-center shrink-0">
                {player.jerseyNumber}
              </span>
            )}
            <span className="truncate font-medium">
              {player.firstName} {player.lastName}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
