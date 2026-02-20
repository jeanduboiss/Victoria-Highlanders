'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { addMatchEventSchema } from '@/domains/sports/schemas/match.schema'
import { addMatchEventAction } from '@/domains/sports/actions/match.actions'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type FormValues = z.infer<typeof addMatchEventSchema>

interface Player {
    id: string
    firstName: string
    lastName: string
    position: string | null
}

interface AddMatchEventSheetProps {
    orgSlug: string
    matchId: string
    players: Player[]
    children: React.ReactNode
}

const EVENT_TYPES = [
    { value: 'GOAL', label: '⚽ Gol' },
    { value: 'OWN_GOAL', label: '⚽ Autogol' },
    { value: 'PENALTY_SCORED', label: '⚽ Penal anotado' },
    { value: 'PENALTY_MISSED', label: '❌ Penal fallado' },
    { value: 'YELLOW_CARD', label: '🟨 Tarjeta amarilla' },
    { value: 'RED_CARD', label: '🟥 Tarjeta roja' },
    { value: 'YELLOW_RED_CARD', label: '🟨🟥 Doble amarilla' },
    { value: 'SUBSTITUTION_IN', label: '🔼 Sustitución (entra)' },
    { value: 'SUBSTITUTION_OUT', label: '🔽 Sustitución (sale)' },
] as const

export function AddMatchEventSheet({ orgSlug, matchId, players, children }: AddMatchEventSheetProps) {
    const [open, setOpen] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(addMatchEventSchema),
        defaultValues: {
            orgSlug,
            matchId,
            playerId: '',
            minute: 1,
        },
    })

    const { execute, isPending } = useAction(addMatchEventAction, {
        onSuccess: () => {
            toast.success('Evento agregado. Estadísticas recalculadas.')
            form.reset({ orgSlug, matchId, minute: 1 })
            setOpen(false)
        },
        onError: ({ error }) => {
            toast.error(error.serverError ?? 'Error al agregar evento.')
        },
    })

    function onSubmit(values: FormValues) {
        execute(values)
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Agregar evento</SheetTitle>
                    <SheetDescription>Registra un gol, tarjeta o sustitución.</SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                        <FormField
                            control={form.control}
                            name="playerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Jugador</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona jugador" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[300px]">
                                            {players.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.firstName} {p.lastName}
                                                    {p.position && (
                                                        <span className="text-muted-foreground ml-2 text-xs">
                                                            ({p.position})
                                                        </span>
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="eventType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de evento</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {EVENT_TYPES.map((t) => (
                                                <SelectItem key={t.value} value={t.value}>
                                                    {t.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="minute"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Minuto</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={120}
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="extraTimeMinute"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tiempo añadido</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={30}
                                                placeholder="Opcional"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción (opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ej: Gol de cabeza tras centro desde la derecha"
                                            className="resize-none"
                                            rows={2}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-2 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isPending}>
                                {isPending ? 'Guardando...' : 'Agregar evento'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
