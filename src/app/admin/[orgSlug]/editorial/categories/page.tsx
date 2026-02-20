import { requirePermission } from '@/lib/auth'
import { getCategoriesByOrg } from '@/domains/editorial/queries/editorial.queries'
import { redirect } from 'next/navigation'
import { CategoriesTable } from './_components/categories-table'
import { CreateCategorySheet } from './_components/create-category-sheet'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Props {
    params: Promise<{ orgSlug: string }>
}

export default async function CategoriesPage({ params }: Props) {
    const { orgSlug } = await params
    const ctx = await requirePermission(orgSlug, 'articles', 'read').catch(() => redirect('/login'))

    const categories = await getCategoriesByOrg(ctx.organizationId)

    return (
        <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
                    <p className="text-muted-foreground">{categories.length} categoría(s) registradas.</p>
                </div>
                <CreateCategorySheet orgSlug={orgSlug}>
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva categoría
                    </Button>
                </CreateCategorySheet>
            </div>
            <CategoriesTable categories={categories} />
        </div>
    )
}
