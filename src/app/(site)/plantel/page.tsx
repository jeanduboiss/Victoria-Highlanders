export const dynamic = 'force-dynamic'

import { getPublicRoster, getRosterFilters } from '@/domains/sports/queries/public-players.query'
import type { PublicRosterPlayer } from '@/domains/sports/queries/public-players.query'
import type { TeamCategory } from '@prisma/client'
import { RosterFilter } from '@/components/site/plantel/roster-filter'

const POSITION_LABELS: Record<string, string> = {
  GOALKEEPER: 'Porteros',
  DEFENDER: 'Defensas',
  MIDFIELDER: 'Centrocampistas',
  FORWARD: 'Delanteros',
}

const POSITION_ORDER = ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD']

function PlayerCard({ player }: { player: PublicRosterPlayer }) {
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
        {player.jerseyNumber && (
          <div className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 bg-gold rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            <span className="font-oswald text-[13px] font-bold text-black leading-none">{player.jerseyNumber}</span>
          </div>
        )}

        {/* BLOQUE YEPK: Highlight Goals */}
        {(player.goals ?? 0) > 0 && (
          <div className="absolute top-3 left-3 flex items-center justify-center gap-1.5 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded shadow-md border border-white/10">
            <span className="text-[10px]">⚽</span>
            <span className="font-oswald text-[11px] font-bold text-gold">{player.goals}</span>
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
        <div className="flex justify-between items-center mt-0.5">
          {player.position && (
            <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-white/40">
              {posLabel[player.position] ?? player.position}
            </p>
          )}
          {player.country && (
            <span className="font-sans text-[10px] uppercase text-white/20 tracking-wider">
              {player.country}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface PageProps {
  searchParams?: Promise<{ season?: string; category?: string }>
}

export default async function PlantelPage(props: PageProps) {
  const searchParams = await props.searchParams
  const rawSeason = searchParams?.season
  const rawCategoryString = searchParams?.category

  // Cast to valid enum implicitly via types, defaulting to FIRST_TEAM
  const currentCategory = (rawCategoryString && rawCategoryString !== '')
    ? (rawCategoryString as TeamCategory)
    : 'FIRST_TEAM'

  const { seasons, teams } = await getRosterFilters()

  // Use explicit season if provided, else current
  let computedSeasonId = rawSeason
  if (!computedSeasonId) {
    const active = seasons.find(s => s.isCurrent)
    if (active) computedSeasonId = active.id
  }

  // Fetch the players based on selected season and category
  const players = await getPublicRoster({
    seasonId: computedSeasonId,
    category: currentCategory
  })

  const grouped = POSITION_ORDER.reduce<Record<string, PublicRosterPlayer[]>>((acc, pos) => {
    const inPos = players.filter((p) => p.position === pos)
    if (inPos.length > 0) acc[pos] = inPos
    return acc
  }, {})

  const ungrouped = players.filter((p) => !p.position)

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8 py-12 lg:py-16">
        <div className="mb-4">
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-2">Temporada Roster</p>
          <h1 className="font-oswald text-[36px] sm:text-[48px] font-bold uppercase text-white">El Plantel</h1>
        </div>

        {/* Filter component YEPK */}
        <RosterFilter
          seasons={seasons}
          teams={teams}
          currentSeasonId={computedSeasonId}
          currentCategory={currentCategory}
        />

        {players.length === 0 ? (
          <div className="flex h-60 items-center justify-center border border-white/5 rounded bg-white/[0.02]">
            <p className="font-sans text-[13px] text-gray-500 uppercase tracking-widest font-bold">No hay jugadores registrados para este filtro</p>
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
                  <span className="font-sans text-[11px] font-bold text-white/30">{group.length}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {group.map((p) => <PlayerCard key={p.recordId} player={p} />)}
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
                  {ungrouped.map((p) => <PlayerCard key={p.recordId} player={p} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
