'use client'

import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { startMatchLiveAction } from '@/domains/sports/actions/match.actions'
import { Button } from '@/components/ui/button'
import { Radio } from 'lucide-react'
import { toast } from 'sonner'

interface StartMatchLiveButtonProps {
  orgSlug: string
  matchId: string
}

export function StartMatchLiveButton({ orgSlug, matchId }: StartMatchLiveButtonProps) {
  const router = useRouter()
  const { execute, isPending } = useAction(startMatchLiveAction, {
    onSuccess: () => {
      toast.success('¡Partido iniciado en vivo!')
      router.push(`/admin/${orgSlug}/sports/matches/${matchId}/live`)
    },
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al iniciar partido'),
  })

  return (
    <Button
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
      disabled={isPending}
      onClick={() => execute({ orgSlug, matchId })}
    >
      <Radio className="mr-2 h-4 w-4" />
      {isPending ? 'Iniciando...' : 'Iniciar partido en vivo'}
    </Button>
  )
}
