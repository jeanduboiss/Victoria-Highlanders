'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { bulkAddMatchEventsAction } from '@/domains/sports/actions/match.actions'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Plus, Trash2, ClipboardList } from 'lucide-react'

interface Player {
  id: string
  firstName: string
  lastName: string
  position: string | null
}

interface BulkMatchEventsSheetProps {
  orgSlug: string
  matchId: string
  players: Player[]
  children: React.ReactNode
}

const EVENT_TYPES = [
  { value: 'GOAL', label: '⚽ Gol', hasAssist: true },
  { value: 'OWN_GOAL', label: '⚽ Autogol', hasAssist: false },
  { value: 'PENALTY_SCORED', label: '⚽ Penal anotado', hasAssist: true },
  { value: 'PENALTY_MISSED', label: '❌ Penal fallado', hasAssist: false },
  { value: 'YELLOW_CARD', label: '🟨 Tarjeta amarilla', hasAssist: false },
  { value: 'RED_CARD', label: '🟥 Tarjeta roja', hasAssist: false },
  { value: 'YELLOW_RED_CARD', label: '🟨🟥 Doble amarilla', hasAssist: false },
  { value: 'SUBSTITUTION_IN', label: '🔼 Sustitución (entra)', hasAssist: false },
  { value: 'SUBSTITUTION_OUT', label: '🔽 Sustitución (sale)', hasAssist: false },
] as const

type EventType = (typeof EVENT_TYPES)[number]['value']

interface EventRow {
  id: number
  minute: number
  playerId: string
  eventType: EventType | ''
  assistPlayerId: string
}

let rowCounter = 0

function createRow(): EventRow {
  return { id: ++rowCounter, minute: 1, playerId: '', eventType: '', assistPlayerId: '' }
}

function isRowComplete(row: EventRow): boolean {
  return row.playerId !== '' && row.eventType !== '' && row.minute >= 1
}

export function BulkMatchEventsSheet({
  orgSlug,
  matchId,
  players,
  children,
}: BulkMatchEventsSheetProps) {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<EventRow[]>(() => [createRow(), createRow(), createRow()])

  const { execute, isPending } = useAction(bulkAddMatchEventsAction, {
    onSuccess: ({ data }) => {
      toast.success(`${data?.count ?? rows.length} incidencia(s) guardadas correctamente.`)
      setRows([createRow(), createRow(), createRow()])
      setOpen(false)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? 'Error al guardar incidencias.')
    },
  })

  function updateRow(id: number, patch: Partial<EventRow>) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const updated = { ...r, ...patch }
        if (patch.eventType !== undefined) updated.assistPlayerId = ''
        return updated
      }),
    )
  }

  function removeRow(id: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev))
  }

  function addRow() {
    setRows((prev) => [...prev, createRow()])
  }

  function handleSubmit() {
    const complete = rows.filter(isRowComplete)
    if (complete.length === 0) {
      toast.error('Completa al menos una incidencia antes de guardar.')
      return
    }
    execute({
      orgSlug,
      matchId,
      events: complete.map((r) => ({
        playerId: r.playerId,
        eventType: r.eventType as EventType,
        minute: r.minute,
        assistPlayerId: r.assistPlayerId || undefined,
      })),
    })
  }

  const completeCount = rows.filter(isRowComplete).length

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:w-[560px] md:w-[680px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Entrada manual de incidencias
          </SheetTitle>
          <SheetDescription>
            Registra múltiples incidencias del partido de una sola vez. Las filas incompletas se ignorarán.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {rows.map((row, idx) => {
            const eventConfig = EVENT_TYPES.find((e) => e.value === row.eventType)
            const showAssist = eventConfig?.hasAssist === true

            return (
              <div key={row.id} className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Incidencia {idx + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-[64px_1fr_1fr] gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Min.</p>
                    <Input
                      type="number"
                      min={1}
                      max={120}
                      value={row.minute}
                      onChange={(e) => updateRow(row.id, { minute: Number(e.target.value) })}
                      className="text-center font-mono h-9"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Jugador</p>
                    <Select
                      value={row.playerId}
                      onValueChange={(v) => updateRow(row.id, { playerId: v })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[260px]">
                        {players.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.firstName} {p.lastName}
                            {p.position && (
                              <span className="text-muted-foreground ml-1 text-xs">
                                ({p.position})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                    <Select
                      value={row.eventType}
                      onValueChange={(v) => updateRow(row.id, { eventType: v as EventType })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {showAssist && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Asistencia (opcional)</p>
                    <Select
                      value={row.assistPlayerId}
                      onValueChange={(v) => updateRow(row.id, { assistPlayerId: v })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Sin asistencia" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[260px]">
                        {players
                          .filter((p) => p.id !== row.playerId)
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.firstName} {p.lastName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )
          })}

          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed text-muted-foreground hover:text-foreground"
            onClick={addRow}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Agregar incidencia
          </Button>
        </div>

        <Separator className="my-5" />

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={isPending || completeCount === 0}
            onClick={handleSubmit}
          >
            {isPending
              ? 'Guardando...'
              : completeCount > 0
                ? `Guardar ${completeCount} incidencia${completeCount !== 1 ? 's' : ''}`
                : 'Guardar incidencias'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
