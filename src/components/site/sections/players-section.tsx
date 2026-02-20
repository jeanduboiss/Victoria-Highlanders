import type { PublicPlayer } from '@/domains/sports/queries/public-players.query'

interface PlayersSectionProps {
  players: PublicPlayer[]
}

export function PlayersSection({ players }: PlayersSectionProps) {
  return (
    <section id="plantilla" className="py-20">
      <div className="container mx-auto px-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          — Diseño Figma pendiente —
        </p>
        <h2 className="mt-2 text-3xl font-bold">Plantilla</h2>
        <p className="mt-2 text-muted-foreground">{players.length} jugadores activos</p>
      </div>
    </section>
  )
}
