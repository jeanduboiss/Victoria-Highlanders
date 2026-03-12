import { requirePermission } from '@/lib/auth'
import {  redirect  } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { PageHeader } from '@/components/admin/page-header'
import { NavMenuEditor } from './_components/nav-menu-editor'
import { prisma } from '@/lib/prisma/client'
import { getPagesByOrg } from '@/domains/site/queries/page.queries'
import type { NavItem } from '@/domains/configuration/actions/nav.actions'

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'nav-noticias', type: 'fixed', label: 'Noticias', href: '/noticias', isVisible: true },
  { id: 'nav-plantel', type: 'fixed', label: 'Plantel', href: '/plantel', isVisible: true },
  { id: 'nav-partidos', type: 'fixed', label: 'Partidos', href: '/partidos', isVisible: true },
  { id: 'nav-galeria', type: 'fixed', label: 'Galería', href: '/galeria', isVisible: true },
]

interface Props {
  params: Promise<{ orgSlug: string }>
}

export default async function NavMenuPage({ params }: Props) {
  const t = await getTranslations('admin.pages')
  const { orgSlug } = await params
  const ctx = await requirePermission(orgSlug, 'site_config', 'read').catch(() => redirect('/login'))

  const [config, pages] = await Promise.all([
    prisma.siteConfiguration.findUnique({
      where: { organizationId: ctx.organizationId },
      select: { navJson: true },
    }),
    getPagesByOrg(ctx.organizationId),
  ])

  const rawNavJson = config?.navJson
  const navItems: NavItem[] =
    Array.isArray(rawNavJson) ? (rawNavJson as NavItem[]) : DEFAULT_NAV_ITEMS

  return (
    <div className="space-y-4 py-4">
      <PageHeader
        title={t('site.menu')}
        description={t('site.menuDesc')}
      />
      <NavMenuEditor items={navItems} pages={pages} orgSlug={orgSlug} />
    </div>
  )
}
