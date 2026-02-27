import { prisma } from '@/lib/prisma/client'

export async function getPagesByOrg(organizationId: string) {
  return prisma.page.findMany({
    where: { organizationId },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getPageById(pageId: string, organizationId: string) {
  return prisma.page.findFirst({
    where: { id: pageId, organizationId },
  })
}
