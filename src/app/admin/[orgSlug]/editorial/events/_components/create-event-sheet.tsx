'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createEventSchema } from '@/domains/editorial/schemas/event.schema'
import { createEventAction } from '@/domains/editorial/actions/event.actions'
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
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type FormValues = z.infer<typeof createEventSchema>

interface TagItem {
    id: string
    name: string
}

interface CreateEventSheetProps {
    orgSlug: string
    tags: TagItem[]
    children: React.ReactNode
}

const EVENT_TYPES = [
    { value: 'MATCH', label: 'Día de partido' },
    { value: 'TRAINING', label: 'Entrenamiento' },
    { value: 'SOCIAL', label: 'Social' },
    { value: 'MEMBERSHIP', label: 'Membresía' },
    { value: 'PRESS', label: 'Prensa' },
    { value: 'CHARITY', label: 'Caridad' },
    { value: 'OTHER', label: 'Otro' },
] as const

export function CreateEventSheet({ orgSlug, tags, children }: CreateEventSheetProps) {
    const [open, setOpen] = useState(false)
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

    const form = useForm<FormValues>({
        resolver: zodResolver(createEventSchema),
        defaultValues: {
            orgSlug,
            title: '',
            description: '',
            eventType: 'OTHER',
            locationText: '',
            tagIds: [],
        },
    })

    const { execute, isPending } = useAction(createEventAction, {
        onSuccess: () => {
            toast.success('Evento creado correctamente.')
            form.reset()
            setSelectedTagIds([])
            setOpen(false)
        },
        onError: ({ error }) => {
            toast.error(error.serverError ?? 'Error al crear evento.')
        },
    })

    function onSubmit(values: FormValues) {
        execute({ ...values, tagIds: selectedTagIds })
    }

    function toggleTag(id: string) {
        setSelectedTagIds((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        )
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Nuevo evento</SheetTitle>
                    <SheetDescription>Crea un evento para la comunidad.</SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nombre del evento" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Descripción del evento..." rows={3} className="resize-none" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="eventType"
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {EVENT_TYPES.map((t) => (
                                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="locationText"
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>Lugar</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Estadio" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDatetime"
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>Inicio</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDatetime"
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>Fin (opcional)</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Tags selection */}
                        {tags.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Tags</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
                                            className="cursor-pointer text-xs transition-colors"
                                            onClick={() => toggleTag(tag.id)}
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isPending}>
                                {isPending ? 'Guardando...' : 'Crear evento'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
