'use client'

import { useAction } from 'next-safe-action/hooks'
import { deactivatePlayerAction } from '@/domains/sports/actions/squad.actions'
import { Button } from '@/components/ui/button'
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
import { toast } from 'sonner'
import { UserMinus } from 'lucide-react'

interface DeactivatePlayerButtonProps {
    orgSlug: string
    playerId: string
}

export function DeactivatePlayerButton({ orgSlug, playerId }: DeactivatePlayerButtonProps) {
    const { execute, isPending } = useAction(deactivatePlayerAction, {
        onSuccess: () => toast.success('Jugador desactivado.'),
        onError: ({ error }: any) => toast.error(error.serverError ?? 'Error al desactivar.'),
    })

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start text-destructive hover:text-destructive">
                    <UserMinus className="mr-2 h-4 w-4" />
                    Desactivar jugador
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Desactivar este jugador?</AlertDialogTitle>
                    <AlertDialogDescription>
                        El jugador se marcará como inactivo. Los registros históricos se mantendrán intactos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => execute({ orgSlug, playerId })}
                        disabled={isPending}
                    >
                        {isPending ? 'Procesando...' : 'Desactivar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
