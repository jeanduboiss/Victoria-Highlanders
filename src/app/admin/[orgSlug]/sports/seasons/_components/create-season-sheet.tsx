'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createSeasonSchema } from '@/domains/sports/schemas/season.schema'
import { createSeasonAction } from '@/domains/sports/actions/season.actions'
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
import { DatePicker } from '@/components/ui/date-picker'
import { toast } from 'sonner'

type FormValues = z.infer<typeof createSeasonSchema>

interface CreateSeasonSheetProps {
    orgSlug: string
    children: React.ReactNode
}

export function CreateSeasonSheet({ orgSlug, children }: CreateSeasonSheetProps) {
    const [open, setOpen] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(createSeasonSchema),
        defaultValues: {
            orgSlug,
            name: '',
            shortName: '',
            startDate: '',
            endDate: '',
        },
    })

    const { execute, isPending } = useAction(createSeasonAction, {
        onSuccess: () => {
            toast.success('Temporada creada correctamente.')
            form.reset({ orgSlug, name: '', shortName: '', startDate: '', endDate: '' })
            setOpen(false)
        },
        onError: ({ error }) => {
            toast.error(error.serverError ?? 'Error al crear temporada.')
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
                    <SheetTitle>Nueva temporada</SheetTitle>
                    <SheetDescription>Define el período competitivo de la organización.</SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: 2025-2026" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="shortName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre corto (opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: 25/26" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha inicio</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Inicio"
                                                fromYear={2000}
                                                toYear={2050}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha fin</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Fin"
                                                fromYear={2000}
                                                toYear={2050}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isPending}>
                                {isPending ? 'Guardando...' : 'Crear temporada'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
