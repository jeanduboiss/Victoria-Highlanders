'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createTeamSchema } from '@/domains/sports/schemas/squad.schema'
import { createTeamAction } from '@/domains/sports/actions/squad.actions'
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
    FormDescription,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
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

type FormValues = z.infer<typeof createTeamSchema>

interface CreateTeamSheetProps {
    orgSlug: string
    children: React.ReactNode
}

const CATEGORIES = [
    { value: 'FIRST_TEAM', label: 'Primer equipo' },
    { value: 'RESERVE', label: 'Reserva' },
    { value: 'U23', label: 'Sub-23' },
    { value: 'U20', label: 'Sub-20' },
    { value: 'U18', label: 'Sub-18' },
    { value: 'U16', label: 'Sub-16' },
    { value: 'U14', label: 'Sub-14' },
    { value: 'U12', label: 'Sub-12' },
    { value: 'WOMEN', label: 'Femenino' },
    { value: 'FUTSAL', label: 'Futsal' },
] as const

export function CreateTeamSheet({ orgSlug, children }: CreateTeamSheetProps) {
    const [open, setOpen] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(createTeamSchema),
        defaultValues: {
            orgSlug,
            name: '',
            shortName: '',
            gender: 'MALE',
            description: '',
            isExternal: false,
        },
    })

    const { execute, isPending } = useAction(createTeamAction, {
        onSuccess: () => {
            toast.success('Equipo creado correctamente.')
            form.reset({ orgSlug, name: '', shortName: '', gender: 'MALE', description: '', isExternal: false })
            setOpen(false)
        },
        onError: ({ error }) => {
            toast.error(error.serverError ?? 'Error al crear equipo.')
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
                    <SheetTitle>Nuevo equipo</SheetTitle>
                    <SheetDescription>Registra un equipo dentro de la organización.</SheetDescription>
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
                                        <Input placeholder="Ej: Victoria Highlanders FC" {...field} />
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
                                        <Input placeholder="Ej: VHF" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categoría</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {CATEGORIES.map((c) => (
                                                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Género</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="MALE">Masculino</SelectItem>
                                                <SelectItem value="FEMALE">Femenino</SelectItem>
                                                <SelectItem value="MIXED">Mixto</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                            placeholder="Descripción del equipo..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isExternal"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 border rounded-md">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Es un equipo rival (Externo)
                                        </FormLabel>
                                        <FormDescription className="text-xs">
                                            Márcarlo si este equipo pertenece a la liga pero no a nuestra institución (Para crear historiales de partidos de liga).
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-2 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isPending}>
                                {isPending ? 'Guardando...' : 'Crear equipo'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
