'use client'

import { useState, useEffect } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { upsertTestimonialAction } from '@/domains/site/actions/testimonials.actions'

const schema = z.object({
  orgSlug: z.string(),
  id: z.string().uuid().optional(),
  authorName: z.string().min(1, 'Requerido').max(120),
  authorRole: z.string().max(80).optional(),
  authorAvatarUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  content: z.string().min(10, 'Mínimo 10 caracteres').max(1000),
  rating: z.number().int().min(1).max(5),
})

type FormValues = z.infer<typeof schema>

interface Testimonial {
  id: string
  authorName: string
  authorRole: string | null
  authorAvatarUrl: string | null
  content: string
  rating: number
}

interface Props {
  orgSlug: string
  testimonial?: Testimonial
  children: React.ReactNode
}

export function TestimonialSheet({ orgSlug, testimonial, children }: Props) {
  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      orgSlug,
      id: testimonial?.id,
      authorName: testimonial?.authorName ?? '',
      authorRole: testimonial?.authorRole ?? '',
      authorAvatarUrl: testimonial?.authorAvatarUrl ?? '',
      content: testimonial?.content ?? '',
      rating: testimonial?.rating ?? 5,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        orgSlug,
        id: testimonial?.id,
        authorName: testimonial?.authorName ?? '',
        authorRole: testimonial?.authorRole ?? '',
        authorAvatarUrl: testimonial?.authorAvatarUrl ?? '',
        content: testimonial?.content ?? '',
        rating: testimonial?.rating ?? 5,
      })
    }
  }, [open])

  const { execute, isPending } = useAction(upsertTestimonialAction, {
    onSuccess: () => {
      toast.success(testimonial ? 'Testimonio actualizado.' : 'Testimonio creado.')
      setOpen(false)
    },
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al guardar.'),
  })

  const rating = form.watch('rating')

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:w-[480px]">
        <SheetHeader>
          <SheetTitle>{testimonial ? 'Editar testimonio' : 'Nuevo testimonio'}</SheetTitle>
          <SheetDescription>Testimonios publicados aparecen en el sitio web público.</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => execute(v))} className="space-y-4 mt-6">
            <FormField control={form.control} name="authorName" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del autor</FormLabel>
                <FormControl><Input placeholder="Ej: Juan Pérez" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="authorRole" render={({ field }) => (
              <FormItem>
                <FormLabel>Rol / descripción <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                <FormControl><Input placeholder="Ej: Hincha de toda la vida" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="authorAvatarUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>URL de foto <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormItem>
              <FormLabel>Calificación</FormLabel>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => form.setValue('rating', n)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
                    />
                  </button>
                ))}
              </div>
            </FormItem>

            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel>Testimonio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Escribe el testimonio aquí..."
                    className="min-h-[120px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? 'Guardando...' : testimonial ? 'Guardar cambios' : 'Crear testimonio'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
