export const dynamic = 'force-dynamic'

import { getPublicPlayersAll } from '@/domains/sports/queries/public-players.query'
import type { PublicPlayerFull } from '@/domains/sports/queries/public-players.query'

const POSITION_LABELS: Record<string, string> = {
  GOALKEEPER: 'Porteros',
  DEFENDER: 'Defensas',
  MIDFIELDER: 'Centrocampistas',
  FORWARD: 'Delanteros',
}

const POSITION_ORDER = ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD']

function PlayerCard({ player }: { player: PublicPlayerFull }) {
  const posLabel: Record<string, string> = {
    GOALKEEPER: 'POR',
    DEFENDER: 'DEF',
    MIDFIELDER: 'CEN',
    FORWARD: 'DEL',
  }

  return (
    <div className="group relative flex flex-col overflow-hidden bg-[#111] border border-white/[0.06] hover:border-gold/40 transition-all duration-300">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#161616]">
        {player.photoUrl ? (
          <img
            src={player.photoUrl}
            alt={`${player.firstName} ${player.lastName}`}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-end justify-center pb-4 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]">
            <svg viewBox="0 0 80 90" className="w-20 opacity-10" fill="none">
              <ellipse cx="40" cy="28" rx="18" ry="20" fill="white" />
              <path d="M4 85c0-24 72-24 72 0" fill="white" />
            </svg>
          </div>
        )}
        {player.jerseyNumberDefault && (
          <div className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 bg-gold rounded-full">
            <span className="font-oswald text-[13px] font-bold text-black leading-none">{player.jerseyNumberDefault}</span>
          </div>
        )}
        {player.position && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      <div className="p-3">
        <p className="font-oswald text-[15px] font-bold uppercase text-white leading-tight line-clamp-1">
          {player.firstName} <span className="text-gold">{player.lastName}</span>
        </p>
        {player.position && (
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-white/40 mt-0.5">
            {posLabel[player.position] ?? player.position}
          </p>
        )}
      </div>
    </div>
  )
}

export default async function PlantelPage() {
  const players = await getPublicPlayersAll()

  const grouped = POSITION_ORDER.reduce<Record<string, PublicPlayerFull[]>>((acc, pos) => {
    const inPos = players.filter((p) => p.position === pos)
    if (inPos.length > 0) acc[pos] = inPos
    return acc
  }, {})

  const ungrouped = players.filter((p) => !p.position)

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8 py-12 lg:py-16">
        <div className="mb-10">
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-2">Temporada</p>
          <h1 className="font-oswald text-[36px] sm:text-[48px] font-bold uppercase text-white">El Plantel</h1>
        </div>

        {players.length === 0 ? (
          <div className="flex h-60 items-center justify-center border border-white/5">
            <p className="font-sans text-[13px] text-gray-600">El plantel no está disponible aún</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(grouped).map(([pos, group]) => (
              <div key={pos}>
                <div className="flex items-center gap-4 mb-5">
                  <h2 className="font-oswald text-[13px] font-bold uppercase tracking-[0.2em] text-gold">
                    {POSITION_LABELS[pos] ?? pos}
                  </h2>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="font-sans text-[11px] text-white/30">{group.length}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {group.map((p) => <PlayerCard key={p.id} player={p} />)}
                </div>
              </div>
            ))}

            {ungrouped.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <h2 className="font-oswald text-[13px] font-bold uppercase tracking-[0.2em] text-white/40">Sin posición</h2>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {ungrouped.map((p) => <PlayerCard key={p.id} player={p} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
