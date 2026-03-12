'use client'

import { useState, useEffect } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('admin.pages.site.newTestimonialSheet')
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
      toast.success(testimonial ? t('successEdit') : t('successNew'))
      setOpen(false)
    },
    onError: ({ error }) => toast.error(error.serverError ?? t('error')),
  })

  const rating = form.watch('rating')

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:w-[480px]">
        <SheetHeader>
          <SheetTitle>{testimonial ? t('titleEdit') : t('titleNew')}</SheetTitle>
          <SheetDescription>{t('desc')}</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => execute(v))} className="space-y-4 mt-6">
            <FormField control={form.control} name="authorName" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('authorName')}</FormLabel>
                <FormControl><Input placeholder={t('authorPlaceholder')} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="authorRole" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('authorRole')}</FormLabel>
                <FormControl><Input placeholder={t('authorRolePlaceholder')} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="authorAvatarUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('authorAvatar')}</FormLabel>
                <FormControl><Input placeholder={t('avatarPlaceholder')} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormItem>
              <FormLabel>{t('rating')}</FormLabel>
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
                <FormLabel>{t('content')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('contentPlaceholder')}
                    className="min-h-[120px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? t('saving') : testimonial ? t('save') : t('create')}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
