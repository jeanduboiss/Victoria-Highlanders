import { requirePermission } from '@/lib/auth'
import { getArticlesByOrg } from '@/domains/editorial/queries/editorial.queries'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ArticlesTable } from './_components/articles-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ orgSlug: string }>
}

export default async function ArticlesPage({ params }: Props) {
  const t = await getTranslations('admin.pages')
  const { orgSlug } = await params
  const ctx = await requirePermission(orgSlug, 'articles', 'read').catch(() => redirect('/login'))

  const rawArticles = await getArticlesByOrg(ctx.organizationId)
  const articles = rawArticles.map((a: any) => ({
    ...a,
    categories: a.ArticleCategories.map((ac: any) => ac.article_categories)
  }))

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('editorial.articlesTitle')}</h1>
          <p className="text-muted-foreground">{articles.length} {t('editorial.articlesRegistered')}</p>
        </div>
        <Button size="sm" asChild>
          <Link href={`/admin/${orgSlug}/editorial/articles/new`}>
            <Plus className="mr-2 h-4 w-4" />
            {t('editorial.newArticle')}
          </Link>
        </Button>
      </div>
      <ArticlesTable articles={articles} orgSlug={orgSlug} />
    </div>
  )
}
