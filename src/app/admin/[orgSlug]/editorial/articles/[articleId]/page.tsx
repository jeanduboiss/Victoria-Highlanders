import { requirePermission } from '@/lib/auth'
import { getArticleById, getCategoriesByOrg, getTagsByOrg } from '@/domains/editorial/queries/editorial.queries'
import { redirect, notFound } from 'next/navigation'
import { ArticleEditorForm } from '../_components/article-editor-form'

interface Props {
    params: Promise<{ orgSlug: string; articleId: string }>
}

export default async function EditArticlePage({ params }: Props) {
    const { orgSlug, articleId } = await params
    const ctx = await requirePermission(orgSlug, 'articles', 'write').catch(() => redirect('/login'))

    const [article, categories, tags] = await Promise.all([
        getArticleById(articleId, ctx.organizationId),
        getCategoriesByOrg(ctx.organizationId),
        getTagsByOrg(ctx.organizationId),
    ])

    if (!article) notFound()

    return (
        <div className="py-4">
            <ArticleEditorForm
                orgSlug={orgSlug}
                article={{
                    ...article,
                    status: article.status as string,
                    categories: article.ArticleCategories.map((ac: any) => ac.article_categories),
                    tags: article.tags.map((at: any) => at.tag),
                }}
                categories={categories.map((c: any) => ({
                    ...c,
                    _count: { articles: c._count.ArticleCategories },
                }))}
                tags={tags}
            />
        </div>
    )
}
