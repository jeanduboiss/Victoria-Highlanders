import Link from 'next/link'
import { Newspaper, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Article {
  id: string
  title: string
  status: string
  publishedAt: Date | null
  slug: string
}

interface RecentArticlesWidgetProps {
  orgSlug: string
  articles: Article[]
}

const STATUS_LABELS: Record<string, string> = {
  PUBLISHED: 'Publicado',
  DRAFT: 'Borrador',
  SCHEDULED: 'Programado',
  ARCHIVED: 'Archivado',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  PUBLISHED: 'default',
  DRAFT: 'secondary',
  SCHEDULED: 'outline',
  ARCHIVED: 'destructive',
}

export function RecentArticlesWidget({ orgSlug, articles }: RecentArticlesWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Newspaper className="h-4 w-4" />
          Últimos Artículos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay artículos aún.</p>
        ) : (
          <ul className="space-y-3">
            {articles.map((article) => (
              <li key={article.id} className="flex items-start justify-between gap-2">
                <Link
                  href={`/admin/${orgSlug}/editorial/articles/${article.id}`}
                  className="text-sm font-medium hover:underline line-clamp-1 flex-1"
                >
                  {article.title}
                </Link>
                <Badge
                  variant={STATUS_VARIANTS[article.status] ?? 'secondary'}
                  className="text-xs shrink-0"
                >
                  {STATUS_LABELS[article.status] ?? article.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" asChild className="w-full">
          <Link href={`/admin/${orgSlug}/editorial/articles`}>
            Ver todos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
