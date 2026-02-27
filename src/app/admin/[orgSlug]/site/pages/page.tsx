import { requirePermission } from '@/lib/auth'
import { getPagesByOrg } from '@/domains/site/queries/page.queries'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/admin/page-header'
import { PagesTable } from './_components/pages-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ orgSlug: string }>
}

export default async function SitePagesPage({ params }: Props) {
  const { orgSlug } = await params
  const ctx = await requirePermission(orgSlug, 'pages', 'read').catch(() => redirect('/login'))

  const pages = await getPagesByOrg(ctx.organizationId)

  return (
    <div className="space-y-4 py-4">
      <PageHeader
        title="Páginas"
        description={`${pages.length} página${pages.length !== 1 ? 's' : ''} creada${pages.length !== 1 ? 's' : ''}`}
        action={
          <Button size="sm" asChild className="cursor-pointer">
            <Link href={`/admin/${orgSlug}/site/pages/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva página
            </Link>
          </Button>
        }
      />
      <PagesTable pages={pages} orgSlug={orgSlug} />
    </div>
  )
}
