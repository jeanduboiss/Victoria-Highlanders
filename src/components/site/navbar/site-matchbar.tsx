import { getPublicMatchBar } from '@/domains/sports/queries/public-matches.query'

function shortName(team: { name: string; shortName: string | null }) {
  return team.shortName ?? team.name.slice(0, 4).toUpperCase()
}

function formatMatchDate(date: Date) {
  return new Intl.DateTimeFormat('es-CL', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Santiago',
  }).format(new Date(date))
}

export async function SiteMatchbar() {
  const { latestResult, nextMatch } = await getPublicMatchBar()

  if (!latestResult && !nextMatch) return null

  return (
    <div className="bg-site-bg-bar border-b border-white/10">
      <div className="mx-auto flex h-[63px] max-w-[1280px] items-center gap-6 px-4 lg:px-8">

        {latestResult && (
          <div className="flex items-center gap-3">
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-gold">
              Último resultado
            </span>
            <div className="flex items-center gap-2">
              <span className="font-oswald text-[18px] font-bold text-white">
                {shortName(latestResult.homeTeam)}
              </span>
              <div className="flex h-[38px] w-[57px] items-center justify-center bg-site-bg-surface">
                <span className="font-oswald text-[18px] font-bold text-white">
                  {latestResult.homeScore} - {latestResult.awayScore}
                </span>
              </div>
              <span className="font-oswald text-[18px] font-bold text-white/50">
                {shortName(latestResult.awayTeam)}
              </span>
            </div>
          </div>
        )}

        {latestResult && nextMatch && (
          <div className="h-8 w-px bg-site-bg-surface" />
        )}

        {nextMatch && (
          <div className="flex items-center gap-3">
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-gold">
              Próximo partido
            </span>
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-sans text-[12px] font-bold text-white">
                  vs {nextMatch.isHomeGame ? shortName(nextMatch.awayTeam) : shortName(nextMatch.homeTeam)}
                </span>
                <span className="font-sans text-[10px] text-white/50">
                  {formatMatchDate(nextMatch.matchDate)}
                  {nextMatch.venue ? ` · ${nextMatch.venue.name}` : ''}
                </span>
              </div>
              <a
                href="/partidos"
                className="flex h-[26px] items-center justify-center border border-white/20 px-3 font-sans text-[11px] font-bold uppercase text-white hover:border-gold hover:text-gold transition-colors"
              >
                Preview
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
