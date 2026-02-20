import type { PublicArticle } from '@/domains/editorial/queries/public-articles.query'

interface NewsSectionProps {
  articles: PublicArticle[]
}

export function NewsSection({ articles }: NewsSectionProps) {
  return (
    <section id="noticias" className="py-20">
      <div className="container mx-auto px-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          — Diseño Figma pendiente —
        </p>
        <h2 className="mt-2 text-3xl font-bold">Últimas Noticias</h2>
        <p className="mt-2 text-muted-foreground">{articles.length} artículos publicados</p>
      </div>
    </section>
  )
}
