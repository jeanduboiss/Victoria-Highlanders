'use client'

import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { updateLiveScoreAction } from '@/domains/sports/actions/match.actions'
import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface LiveScoreControlsProps {
  orgSlug: string
  matchId: string
  homeTeamName: string
  awayTeamName: string
  homeScore: number
  awayScore: number
}

export function LiveScoreControls({
  orgSlug,
  matchId,
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
}: LiveScoreControlsProps) {
  const router = useRouter()
  const { execute, isPending } = useAction(updateLiveScoreAction, {
    onSuccess: () => router.refresh(),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al actualizar marcador'),
  })

  function update(newHome: number, newAway: number) {
    execute({ orgSlug, matchId, homeScore: newHome, awayScore: newAway })
  }

  return (
    <div className="rounded-xl border bg-card p-3">
      <p className="text-xs text-muted-foreground font-medium mb-3 text-center">Marcador manual</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-xs text-center text-muted-foreground truncate">{homeTeamName}</p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={isPending || homeScore <= 0}
              onClick={() => update(homeScore - 1, awayScore)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-xl font-black tabular-nums w-8 text-center">{homeScore}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={isPending}
              onClick={() => update(homeScore + 1, awayScore)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-center text-muted-foreground truncate">{awayTeamName}</p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={isPending || awayScore <= 0}
              onClick={() => update(homeScore, awayScore - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-xl font-black tabular-nums w-8 text-center">{awayScore}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={isPending}
              onClick={() => update(homeScore, awayScore + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
