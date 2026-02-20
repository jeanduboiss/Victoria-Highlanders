import { requirePermission } from '@/lib/auth'
import { getTagsByOrg } from '@/domains/editorial/queries/editorial.queries'
import { redirect } from 'next/navigation'
import { TagsTable } from './_components/tags-table'
import { CreateTagSheet } from './_components/create-tag-sheet'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Props {
    params: Promise<{ orgSlug: string }>
}

export default async function TagsPage({ params }: Props) {
    const { orgSlug } = await params
    const ctx = await requirePermission(orgSlug, 'articles', 'read').catch(() => redirect('/login'))

    const tags = await getTagsByOrg(ctx.organizationId)

    return (
        <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
                    <p className="text-muted-foreground">{tags.length} tag(s) registrados.</p>
                </div>
                <CreateTagSheet orgSlug={orgSlug}>
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo tag
                    </Button>
                </CreateTagSheet>
            </div>
            <TagsTable tags={tags} />
        </div>
    )
}
