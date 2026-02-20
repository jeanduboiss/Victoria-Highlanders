import type { PublicMatch } from '@/domains/sports/queries/public-matches.query'

interface MatchesSectionProps {
  matches: PublicMatch[]
}

export function MatchesSection({ matches }: MatchesSectionProps) {
  return (
    <section id="partidos" className="py-20">
      <div className="container mx-auto px-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          — Diseño Figma pendiente —
        </p>
        <h2 className="mt-2 text-3xl font-bold">Partidos</h2>
        <p className="mt-2 text-muted-foreground">{matches.length} partidos recientes</p>
      </div>
    </section>
  )
}
