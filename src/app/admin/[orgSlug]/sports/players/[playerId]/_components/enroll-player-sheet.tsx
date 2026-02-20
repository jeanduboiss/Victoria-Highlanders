'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { enrollPlayerSchema } from '@/domains/sports/schemas/squad.schema'
import { enrollPlayerAction } from '@/domains/sports/actions/squad.actions'
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
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { toast } from 'sonner'

type FormValues = z.infer<typeof enrollPlayerSchema>

interface Team {
    id: string
    name: string
    category: string
}

interface Season {
    id: string
    name: string
}

interface EnrollPlayerSheetProps {
    orgSlug: string
    playerId: string
    teams: Team[]
    seasons: Season[]
    children: React.ReactNode
}

export function EnrollPlayerSheet({ orgSlug, playerId, teams, seasons, children }: EnrollPlayerSheetProps) {
    const [open, setOpen] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(enrollPlayerSchema),
        defaultValues: {
            orgSlug,
            playerId,
            teamId: '',
            seasonId: '',
            contractType: 'AMATEUR' as const,
            transferInDate: new Date().toISOString().split('T')[0],
        },
    })

    const { execute, isPending } = useAction(enrollPlayerAction, {
        onSuccess: () => {
            toast.success('Jugador enrolado correctamente.')
            form.reset({ orgSlug, playerId, contractType: 'AMATEUR', transferInDate: new Date().toISOString().split('T')[0] })
            setOpen(false)
        },
        onError: ({ error }) => {
            toast.error(error.serverError ?? 'Error al enrolar jugador.')
        },
    })

    function onSubmit(values: FormValues) {
        execute(values)
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full sm:w-[440px] md:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Enrolar en equipo</SheetTitle>
                    <SheetDescription>Asigna al jugador a un equipo y temporada activa.</SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                        <FormField
                            control={form.control}
                            name="teamId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Equipo</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona equipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {teams.map((t) => (
                                                <SelectItem key={t.id} value={t.id}>
                                                    {t.name}
                                                    <span className="text-muted-foreground ml-2 text-xs">({t.category})</span>
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
                            name="seasonId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Temporada</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona temporada" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {seasons.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
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
                                name="jerseyNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dorsal</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={99}
                                                placeholder="Nro"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contractType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contrato</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PROFESSIONAL">Profesional</SelectItem>
                                                <SelectItem value="AMATEUR">Amateur</SelectItem>
                                                <SelectItem value="YOUTH">Juvenil</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="transferInDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha de incorporación</FormLabel>
                                    <FormControl>
                                        <DatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Fecha de incorporación"
                                            fromYear={2000}
                                            toYear={2050}
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
                                {isPending ? 'Guardando...' : 'Enrolar'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
