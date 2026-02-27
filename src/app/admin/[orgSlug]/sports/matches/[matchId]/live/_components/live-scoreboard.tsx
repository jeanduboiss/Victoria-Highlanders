'use client'

import { useEffect, useState } from 'react'
import { Radio } from 'lucide-react'

interface LiveScoreboardProps {
  homeTeamName: string
  awayTeamName: string
  homeScore: number | null
  awayScore: number | null
  liveStartedAt: Date | null
}

export function LiveScoreboard({
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
  liveStartedAt,
}: LiveScoreboardProps) {
  const [minute, setMinute] = useState(1)

  useEffect(() => {
    if (!liveStartedAt) return

    const compute = () => {
      const elapsed = Date.now() - new Date(liveStartedAt).getTime()
      setMinute(Math.max(1, Math.floor(elapsed / 60000) + 1))
    }

    compute()
    const id = setInterval(compute, 1000)
    return () => clearInterval(id)
  }, [liveStartedAt])

  return (
    <div className="rounded-xl border-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 overflow-hidden">
      <div className="flex items-center justify-center gap-2 py-2 border-b border-white/5">
        <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">En vivo</span>
        <span className="text-xs text-zinc-500 font-mono">{minute}&apos;</span>
      </div>

      <div className="grid grid-cols-3 items-center py-6 px-4">
        <div className="text-center">
          <p className="font-bold text-white text-sm leading-tight">{homeTeamName}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Local</p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-black text-white tabular-nums">{homeScore ?? 0}</span>
          <span className="text-xl font-light text-zinc-600">:</span>
          <span className="text-4xl font-black text-white tabular-nums">{awayScore ?? 0}</span>
        </div>

        <div className="text-center">
          <p className="font-bold text-white text-sm leading-tight">{awayTeamName}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Visitante</p>
        </div>
      </div>
    </div>
  )
}
