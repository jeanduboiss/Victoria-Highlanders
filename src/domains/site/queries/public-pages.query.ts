import { prisma } from '@/lib/prisma/client'

export interface PublicNavItem {
  id: string
  label: string
  href: string
}

const DEFAULT_NAV_ITEMS: PublicNavItem[] = [
  { id: 'nav-noticias', label: 'Noticias', href: '/noticias' },
  { id: 'nav-plantel', label: 'Plantel', href: '/plantel' },
  { id: 'nav-partidos', label: 'Partidos', href: '/partidos' },
  { id: 'nav-galeria', label: 'Galería', href: '/galeria' },
]

export async function getPublicPageBySlug(slug: string) {
  return prisma.page.findFirst({
    where: { slug, status: 'PUBLISHED' },
  })
}

export async function getPublicNavItems(orgSlug: string): Promise<PublicNavItem[]> {
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: {
      siteConfiguration: { select: { navJson: true } },
    },
  })

  const navJson = org?.siteConfiguration?.navJson
  if (!navJson || !Array.isArray(navJson)) return DEFAULT_NAV_ITEMS

  return (navJson as { id: string; label: string; href: string; isVisible: boolean }[])
    .filter((item) => item.isVisible)
    .map(({ id, label, href }) => ({ id, label, href }))
}

export { DEFAULT_NAV_ITEMS }
