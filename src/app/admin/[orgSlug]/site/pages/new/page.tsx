import { requirePermission } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PageEditorForm } from '../_components/page-editor-form'

interface Props {
  params: Promise<{ orgSlug: string }>
}

export default async function NewSitePagePage({ params }: Props) {
  const { orgSlug } = await params
  await requirePermission(orgSlug, 'pages', 'write').catch(() => redirect('/login'))

  return (
    <div className="py-4">
      <PageEditorForm orgSlug={orgSlug} />
    </div>
  )
}
