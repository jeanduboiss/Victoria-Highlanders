'use client'

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
  const { execute: toggle } = useAction(toggleTestimonialAction, {
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al actualizar.'),
  })

  const { execute: remove, isPending: isRemoving } = useAction(deleteTestimonialAction, {
    onSuccess: () => toast.success('Testimonio eliminado.'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al eliminar.'),
  })

  if (testimonials.length === 0)
    return (
      <div className="rounded-md border">
        <p className="py-12 text-center text-sm text-muted-foreground">
          No hay testimonios aún. Crea el primero.
        </p>
      </div>
    )

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Autor</TableHead>
              <TableHead className="hidden md:table-cell">Testimonio</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead className="text-center">Publicado</TableHead>
              <TableHead className="text-center">Destacado</TableHead>
              <TableHead className="text-right pr-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-0">
                    {t.authorAvatarUrl ? (
                      <img src={t.authorAvatarUrl} alt={t.authorName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold">
                        {t.authorName[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{t.authorName}</p>
                      {t.authorRole && <p className="text-xs text-muted-foreground truncate">{t.authorRole}</p>}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell max-w-[280px]">
                  <p className="text-sm text-muted-foreground line-clamp-2">{t.content}</p>
                </TableCell>

                <TableCell>
                  <StarRating rating={t.rating} />
                </TableCell>

                <TableCell>
                  {t.source === 'GOOGLE' ? (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Globe className="w-3 h-3" />
                      Google
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Manual</Badge>
                  )}
                </TableCell>

                <TableCell className="text-center">
                  <Switch
                    checked={t.isPublished}
                    onCheckedChange={(value) => {
                      toggle({ orgSlug, id: t.id, field: 'isPublished', value })
                      toast.success(value ? 'Publicado.' : 'Despublicado.')
                    }}
                  />
                </TableCell>

                <TableCell className="text-center">
                  <Switch
                    checked={t.isFeatured}
                    disabled={!t.isPublished}
                    onCheckedChange={(value) => {
                      toggle({ orgSlug, id: t.id, field: 'isFeatured', value })
                      toast.success(value ? 'Marcado como destacado.' : 'Quitado de destacados.')
                    }}
                  />
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {t.source === 'GOOGLE' && t.externalUrl && (
                      <a
                        href={t.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {t.source === 'MANUAL' && (
                      <TestimonialSheet orgSlug={orgSlug} testimonial={t}>
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
                          <AlertDialogTitle>¿Eliminar testimonio?</AlertDialogTitle>
                          <AlertDialogDescription>
                            El testimonio de <strong>{t.authorName}</strong> será eliminado permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => remove({ orgSlug, id: t.id })}
                          >
                            Eliminar
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
