import { requirePermission } from '@/lib/auth'
import { getCategoriesByOrg, getTagsByOrg } from '@/domains/editorial/queries/editorial.queries'
import { redirect } from 'next/navigation'
import { ArticleEditorForm } from '../_components/article-editor-form'

interface Props {
    params: Promise<{ orgSlug: string }>
}

export default async function NewArticlePage({ params }: Props) {
    const { orgSlug } = await params
    const ctx = await requirePermission(orgSlug, 'articles', 'write').catch(() => redirect('/login'))

    const [categories, tags] = await Promise.all([
        getCategoriesByOrg(ctx.organizationId),
        getTagsByOrg(ctx.organizationId),
    ])

    return (
        <div className="py-4">
            <ArticleEditorForm
                orgSlug={orgSlug}
                categories={categories.map((c: any) => ({
                    ...c,
                    _count: { articles: c._count.ArticleCategories },
                }))}
                tags={tags}
            />
        </div>
    )
}
