import { requirePermission } from '@/lib/auth'
import { getPageById } from '@/domains/site/queries/page.queries'
import { redirect, notFound } from 'next/navigation'
import { PageEditorForm } from '../_components/page-editor-form'

interface Props {
  params: Promise<{ orgSlug: string; pageId: string }>
}

export default async function EditSitePagePage({ params }: Props) {
  const { orgSlug, pageId } = await params
  const ctx = await requirePermission(orgSlug, 'pages', 'write').catch(() => redirect('/login'))

  const page = await getPageById(pageId, ctx.organizationId)
  if (!page) notFound()

  return (
    <div className="py-4">
      <PageEditorForm orgSlug={orgSlug} page={page} />
    </div>
  )
}
