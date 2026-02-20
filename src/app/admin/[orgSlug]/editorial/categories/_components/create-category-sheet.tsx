'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createCategorySchema } from '@/domains/editorial/schemas/article.schema'
import { createCategoryAction } from '@/domains/editorial/actions/article.actions'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type FormValues = z.infer<typeof createCategorySchema>

interface CreateCategorySheetProps {
    orgSlug: string
    children: React.ReactNode
}

export function CreateCategorySheet({ orgSlug, children }: CreateCategorySheetProps) {
    const [open, setOpen] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(createCategorySchema),
        defaultValues: {
            orgSlug,
            name: '',
            description: '',
        },
    })

    const { execute, isPending } = useAction(createCategoryAction, {
        onSuccess: () => {
            toast.success('Categoría creada.')
            form.reset({ orgSlug, name: '', description: '' })
            setOpen(false)
        },
        onError: ({ error }) => {
            toast.error(error.serverError ?? 'Error al crear categoría.')
        },
    })

    function onSubmit(values: FormValues) {
        execute(values)
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full sm:w-[440px] md:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Nueva categoría</SheetTitle>
                    <SheetDescription>Organiza tus artículos en categorías.</SheetDescription>
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
                                        <Input placeholder="Ej: Noticias del club" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción (opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Descripción de la categoría..." rows={3} className="resize-none" {...field} />
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
                                {isPending ? 'Guardando...' : 'Crear categoría'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
