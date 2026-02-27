'use client'

import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { updateMatchResultAction } from '@/domains/sports/actions/match.actions'
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
import { Button } from '@/components/ui/button'
import { Flag } from 'lucide-react'
import { toast } from 'sonner'

interface FinishMatchDialogProps {
  orgSlug: string
  matchId: string
  homeTeamName: string
  awayTeamName: string
  homeScore: number
  awayScore: number
}

export function FinishMatchDialog({
  orgSlug,
  matchId,
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
}: FinishMatchDialogProps) {
  const router = useRouter()
  const { execute, isPending } = useAction(updateMatchResultAction, {
    onSuccess: () => {
      toast.success('Partido finalizado. Estadísticas actualizadas.')
      router.push(`/admin/${orgSlug}/sports/matches/${matchId}`)
    },
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al finalizar partido'),
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs border-red-500/30 text-red-500 hover:bg-red-500/10">
          <Flag className="mr-1.5 h-3 w-3" />
          Finalizar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Finalizar el partido?</AlertDialogTitle>
          <AlertDialogDescription>
            Se registrará el resultado final:{' '}
            <strong>{homeTeamName} {homeScore} – {awayScore} {awayTeamName}</strong>.
            Las estadísticas de jugadores se calcularán automáticamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => execute({ orgSlug, matchId, homeScore, awayScore })}
          >
            {isPending ? 'Finalizando...' : 'Confirmar resultado'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
