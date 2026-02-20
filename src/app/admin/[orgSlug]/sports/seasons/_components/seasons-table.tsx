'use client'

import { useAction } from 'next-safe-action/hooks'
import { activateSeasonAction, archiveSeasonAction } from '@/domains/sports/actions/season.actions'
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { Check, Archive, Lock, Sparkles } from 'lucide-react'

interface Season {
    id: string
    name: string
    shortName: string | null
    startDate: Date
    endDate: Date
    isCurrent: boolean
    isArchived: boolean
}

interface SeasonsTableProps {
    seasons: Season[]
    orgSlug: string
}

export function SeasonsTable({ seasons, orgSlug }: SeasonsTableProps) {
    const { execute: executeActivate, isPending: isActivating } = useAction(activateSeasonAction, {
        onSuccess: () => toast.success('Temporada activada.'),
        onError: ({ error }: any) => toast.error(error.serverError ?? 'Error al activar.'),
    })

    const { execute: executeArchive, isPending: isArchiving } = useAction(archiveSeasonAction, {
        onSuccess: () => toast.success('Temporada archivada. Registros bloqueados.'),
        onError: ({ error }: any) => toast.error(error.serverError ?? 'Error al archivar.'),
    })

    if (seasons.length === 0)
        return <p className="text-sm text-muted-foreground py-8 text-center">No hay temporadas registradas.</p>

    return (
        <TooltipProvider>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Temporada</TableHead>
                            <TableHead>Período</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {seasons.map((season) => (
                            <TableRow key={season.id} className={season.isArchived ? 'opacity-50' : ''}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <p className="font-medium">{season.name}</p>
                                            {season.shortName && (
                                                <p className="text-xs text-muted-foreground">{season.shortName}</p>
                                            )}
                                        </div>
                                        {season.isCurrent && (
                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                                                <Sparkles className="mr-1 h-2.5 w-2.5" />
                                                Activa
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                    {new Date(season.startDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                                    {' → '}
                                    {new Date(season.endDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                                </TableCell>
                                <TableCell>
                                    {season.isArchived ? (
                                        <Badge variant="secondary" className="text-xs">
                                            <Lock className="mr-1 h-3 w-3" />
                                            Archivada
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-xs">
                                            Abierta
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {!season.isCurrent && !season.isArchived && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-emerald-500 hover:text-emerald-600"
                                                        onClick={() => executeActivate({ orgSlug, seasonId: season.id })}
                                                        disabled={isActivating}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Marcar como activa</TooltipContent>
                                            </Tooltip>
                                        )}
                                        {!season.isArchived && !season.isCurrent && (
                                            <AlertDialog>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                                disabled={isArchiving}
                                                            >
                                                                <Archive className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Archivar temporada</TooltipContent>
                                                </Tooltip>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Archivar temporada &ldquo;{season.name}&rdquo;?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción bloqueará todos los registros de jugadores de la temporada.
                                                            Los datos se preservarán como historial inmutable. Esta acción no se puede deshacer.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            onClick={() => executeArchive({ orgSlug, seasonId: season.id })}
                                                        >
                                                            Archivar permanentemente
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TooltipProvider>
    )
}
