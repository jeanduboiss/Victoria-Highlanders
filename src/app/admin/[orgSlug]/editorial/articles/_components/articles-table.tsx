'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowRight } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

type Article = {
  id: string
  title: string
  status: string
  isFeatured: boolean
  publishedAt: Date | null
  scheduledAt: Date | null
  createdAt: Date
  categories: { name: string }[]
}

interface ArticlesTableProps {
  articles: Article[]
  orgSlug: string
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  PUBLISHED: 'default',
  DRAFT: 'secondary',
  SCHEDULED: 'outline',
  ARCHIVED: 'destructive',
}

export function ArticlesTable({ articles, orgSlug }: ArticlesTableProps) {
  const t = useTranslations('admin.pages.editorial.articlesTable')
  const locale = useLocale()

  const statusLabels: Record<string, string> = {
    PUBLISHED: t('statusPublished'),
    DRAFT: t('statusDraft'),
    SCHEDULED: t('statusScheduled'),
    ARCHIVED: t('statusArchived'),
  }

  if (articles.length === 0)
    return <p className="text-sm text-muted-foreground py-8 text-center">{t('noArticles')}</p>

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('title')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('categories')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('date')}</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium line-clamp-1">{article.title}</span>
                    {article.isFeatured && (
                      <Badge variant="outline" className="text-xs shrink-0">{t('featured')}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                  {article.categories.length > 0
                    ? article.categories.map((c) => c.name).join(', ')
                    : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANTS[article.status] ?? 'secondary'} className="text-xs">
                    {statusLabels[article.status] ?? article.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground whitespace-nowrap">
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString(locale === 'es' ? 'es-ES' : locale === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : article.scheduledAt
                      ? `${t('prog')} ${new Date(article.scheduledAt).toLocaleDateString(locale === 'es' ? 'es-ES' : locale === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short' })}`
                      : new Date(article.createdAt).toLocaleDateString(locale === 'es' ? 'es-ES' : locale === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/${orgSlug}/editorial/articles/${article.id}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
