import Link from 'next/link'
import { Newspaper, ArrowRight, FileText, Clock } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  DRAFT: 'bg-muted text-muted-foreground border-border',
  SCHEDULED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  ARCHIVED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
}

export function RecentArticlesWidget({ orgSlug, articles }: RecentArticlesWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Newspaper className="h-4 w-4" />
          Últimos Artículos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
            <FileText className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No hay artículos aún.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {articles.map((article) => (
              <li key={article.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/${orgSlug}/editorial/articles/${article.id}`}
                    className="text-sm font-medium hover:text-primary transition-colors line-clamp-1 cursor-pointer"
                  >
                    {article.title}
                  </Link>
                  {article.publishedAt && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="size-3" />
                      {new Date(article.publishedAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    'text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0',
                    STATUS_STYLES[article.status] ?? STATUS_STYLES.DRAFT
                  )}
                >
                  {STATUS_LABELS[article.status] ?? article.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" asChild className="w-full cursor-pointer">
          <Link href={`/admin/${orgSlug}/editorial/articles`}>
            Ver todos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
