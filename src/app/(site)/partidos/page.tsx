export const dynamic = 'force-dynamic'

import { MapPin, Calendar } from 'lucide-react'
import { getPublicMatchesAll } from '@/domains/sports/queries/public-matches.query'
import type { PublicMatchFull } from '@/domains/sports/queries/public-matches.query'
import { getSiteConfigBySlug } from '@/domains/configuration/actions/site-config.actions'

function MatchRow({ match }: { match: PublicMatchFull }) {
  const isFinished = match.status === 'FINISHED'
  const isScheduled = match.status === 'SCHEDULED'
  const date = new Date(match.matchDate)

  return (
    <div className="grid grid-cols-[56px_1fr_auto] sm:grid-cols-[56px_1fr_120px_auto] items-center gap-4 py-4 px-4 sm:px-5 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors">
      <div className="text-center">
        <p className="font-oswald text-[10px] font-bold uppercase text-white/40">
          {date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
        </p>
        <p className="font-oswald text-[24px] font-bold text-white leading-none">{date.getDate()}</p>
        <p className="font-sans text-[10px] text-white/30">{date.getFullYear()}</p>
      </div>

      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="font-sans text-[13px] font-semibold text-white">{match.homeTeam.shortName ?? match.homeTeam.name}</p>
          {isFinished ? (
            <span className="font-oswald text-[18px] font-bold text-gold px-2">
              {match.homeScore} — {match.awayScore}
            </span>
          ) : (
            <span className="font-sans text-[11px] font-bold text-white/20 px-2">vs</span>
          )}
          <p className="font-sans text-[13px] font-semibold text-white">{match.awayTeam.shortName ?? match.awayTeam.name}</p>
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {match.venue && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-white/30">
              <MapPin className="w-2.5 h-2.5" />
              {match.venue.name}
            </span>
          )}
          {match.competitionName && (
            <span className="text-[11px] text-white/20">{match.competitionName}</span>
          )}
          {match.round && (
            <span className="text-[11px] text-white/20">Jornada {match.round}</span>
          )}
        </div>
      </div>

      <div className="hidden sm:block text-right">
        {isScheduled && (
          <p className="font-sans text-[12px] text-white/40">
            {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      <div>
        <span className={`font-sans text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${isFinished
            ? 'bg-gold/10 text-gold'
            : isScheduled
              ? 'bg-white/5 text-white/40'
              : 'bg-white/5 text-white/30'
          }`}>
          {isFinished ? 'Final' : isScheduled ? 'Prog.' : match.status}
        </span>
      </div>
    </div>
  )
}

export default async function PartidosPage() {
  const slug = process.env.DEFAULT_ORG_SLUG ?? 'victoria-highlanders'

  const [matches, config] = await Promise.all([
    getPublicMatchesAll(),
    getSiteConfigBySlug(slug)
  ])

  const hideResults = config?.hideResults ?? false

  const upcoming = matches.filter((m) => m.status === 'SCHEDULED')
  const finished = hideResults ? [] : matches.filter((m) => m.status === 'FINISHED').reverse()
  const others = matches.filter((m) => m.status !== 'SCHEDULED' && m.status !== 'FINISHED')

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8 py-12 lg:py-16">
        <div className="mb-10">
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-2">Temporada</p>
          <h1 className="font-oswald text-[36px] sm:text-[48px] font-bold uppercase text-white">Partidos</h1>
        </div>

        {matches.length === 0 || (hideResults && upcoming.length === 0) ? (
          <div className="flex h-60 items-center justify-center border border-white/5 bg-white/[0.02] rounded">
            <p className="font-sans text-[13px] font-bold tracking-widest uppercase text-gray-500">No hay partidos programados</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${hideResults ? 'max-w-3xl mx-auto' : 'lg:grid-cols-2'} gap-8`}>
            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-gold" />
                  <p className="font-oswald text-[13px] font-bold uppercase tracking-widest text-gold">Próximos</p>
                  <span className="font-sans text-[11px] text-white/30 ml-1">({upcoming.length})</span>
                </div>
                <div className="bg-[#111] border border-white/[0.06] divide-y-0">
                  {upcoming.map((m) => <MatchRow key={m.id} match={m} />)}
                </div>
              </div>
            )}

            {finished.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-gold" />
                  </span>
                  <p className="font-oswald text-[13px] font-bold uppercase tracking-widest text-white/60">Resultados</p>
                  <span className="font-sans text-[11px] text-white/30 ml-1">({finished.length})</span>
                </div>
                <div className="bg-[#111] border border-white/[0.06] divide-y-0">
                  {finished.map((m) => <MatchRow key={m.id} match={m} />)}
                </div>
              </div>
            )}

            {others.length > 0 && (
              <div className="lg:col-span-2">
                <div className="bg-[#111] border border-white/[0.06] divide-y-0">
                  {others.map((m) => <MatchRow key={m.id} match={m} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
