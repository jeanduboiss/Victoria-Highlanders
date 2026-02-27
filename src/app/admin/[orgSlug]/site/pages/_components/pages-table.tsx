'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { deletePageAction } from '@/domains/site/actions/page.actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Page } from '@prisma/client'

interface Props {
  pages: Page[]
  orgSlug: string
}

export function PagesTable({ pages, orgSlug }: Props) {
  const router = useRouter()

  const { execute: deletePage } = useAction(deletePageAction, {
    onSuccess: () => {
      toast.success('Página eliminada.')
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al eliminar.'),
  })

  if (!pages.length)
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        No hay páginas creadas aún
      </div>
    )

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Actualizado</TableHead>
            <TableHead className="w-24 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.id}>
              <TableCell className="font-medium">{page.title}</TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/p/{page.slug}</code>
              </TableCell>
              <TableCell>
                <Badge
                  variant={page.status === 'PUBLISHED' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {page.status === 'PUBLISHED' ? 'Publicada' : 'Borrador'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(page.updatedAt))}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {page.status === 'PUBLISHED' && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                      <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <Link href={`/admin/${orgSlug}/site/pages/${page.id}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar página?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. La página &ldquo;{page.title}&rdquo; será eliminada permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deletePage({ orgSlug, pageId: page.id })}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
  )
}
