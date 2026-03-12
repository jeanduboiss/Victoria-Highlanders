'use client'

import { useTranslations } from 'next-intl'

import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { Star, Pencil, Trash2, Globe, Pin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { TestimonialSheet } from './testimonial-sheet'
import { toggleTestimonialAction, deleteTestimonialAction } from '@/domains/site/actions/testimonials.actions'

type Testimonial = {
  id: string
  authorName: string
  authorRole: string | null
  authorAvatarUrl: string | null
  content: string
  rating: number
  isPublished: boolean
  isFeatured: boolean
  source: string
  externalUrl: string | null
  createdAt: Date
}

interface Props {
  testimonials: Testimonial[]
  orgSlug: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-3 h-3 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  )
}

export function TestimonialsTable({ testimonials, orgSlug }: Props) {
  const t = useTranslations('admin.pages.site.testimonialsTable')

  const { execute: toggle } = useAction(toggleTestimonialAction, {
    onError: ({ error }) => toast.error(error.serverError ?? t('errorUpdate')),
  })

  const { execute: remove, isPending: isRemoving } = useAction(deleteTestimonialAction, {
    onSuccess: () => toast.success(t('successDelete')),
    onError: ({ error }) => toast.error(error.serverError ?? t('errorDelete')),
  })

  if (testimonials.length === 0)
    return (
      <div className="rounded-md border">
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t('noTestimonials')}
        </p>
      </div>
    )

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('author')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('content')}</TableHead>
              <TableHead>{t('rating')}</TableHead>
              <TableHead>{t('source')}</TableHead>
              <TableHead className="text-center">{t('published')}</TableHead>
              <TableHead className="text-center">{t('featured')}</TableHead>
              <TableHead className="text-right pr-4">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-0">
                    {item.authorAvatarUrl ? (
                      <img src={item.authorAvatarUrl} alt={item.authorName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold">
                        {item.authorName[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.authorName}</p>
                      {item.authorRole && <p className="text-xs text-muted-foreground truncate">{item.authorRole}</p>}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell max-w-[280px]">
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                </TableCell>

                <TableCell>
                  <StarRating rating={item.rating} />
                </TableCell>

                <TableCell>
                  {item.source === 'GOOGLE' ? (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Globe className="w-3 h-3" />
                      {t('sourceGoogle')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">{t('sourceManual')}</Badge>
                  )}
                </TableCell>

                <TableCell className="text-center">
                  <Switch
                    checked={item.isPublished}
                    onCheckedChange={(value) => {
                      toggle({ orgSlug, id: item.id, field: 'isPublished', value })
                      toast.success(value ? t('publishedToast') : t('unpublishedToast'))
                    }}
                  />
                </TableCell>

                <TableCell className="text-center">
                  <Switch
                    checked={item.isFeatured}
                    disabled={!item.isPublished}
                    onCheckedChange={(value) => {
                      toggle({ orgSlug, id: item.id, field: 'isFeatured', value })
                      toast.success(value ? t('featuredToast') : t('unfeaturedToast'))
                    }}
                  />
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {item.source === 'GOOGLE' && item.externalUrl && (
                      <a
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {item.source === 'MANUAL' && (
                      <TestimonialSheet orgSlug={orgSlug} testimonial={item}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </TestimonialSheet>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={isRemoving}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('deleteDesc', { name: item.authorName })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => remove({ orgSlug, id: item.id })}
                          >
                            {t('delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
