import { prisma } from '@/lib/prisma/client'
import { cache } from 'react'

const getDefaultOrg = cache(async () => {
  const slug = process.env.DEFAULT_ORG_SLUG
  if (!slug) throw new Error('DEFAULT_ORG_SLUG no está definido')
  return prisma.organization.findUniqueOrThrow({ where: { slug }, select: { id: true } })
})

export async function getPublicPlayers({ limit = 8 }: { limit?: number } = {}) {
  const org = await getDefaultOrg()
  return prisma.player.findMany({
    where: { organizationId: org.id, isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      position: true,
      photoUrl: true,
      jerseyNumberDefault: true,
      nationalities: { where: { isPrimary: true }, select: { country: true } },
    },
    orderBy: [{ position: 'asc' }, { lastName: 'asc' }],
    take: limit,
  })
}

export type PublicPlayer = Awaited<ReturnType<typeof getPublicPlayers>>[number]
