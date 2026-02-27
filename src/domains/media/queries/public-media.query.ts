import { prisma } from '@/lib/prisma/client'
import { cache } from 'react'

const getDefaultOrg = cache(async () => {
    const slug = process.env.DEFAULT_ORG_SLUG ?? 'victoria-highlanders'
    return prisma.organization.findUniqueOrThrow({ where: { slug }, select: { id: true } })
})

export async function getPublicMediaTV({ limit = 4 }: { limit?: number } = {}) {
    const org = await getDefaultOrg()
    return prisma.mediaAsset.findMany({
        where: {
            organizationId: org.id,
            isArchived: false,
            OR: [
                { isExternal: true },
                { mimeType: { startsWith: 'video/' } }
            ]
        },
        select: {
            id: true,
            fileName: true,
            publicUrl: true,
            createdAt: true,
            durationSeconds: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
    })
}

export type PublicMediaTVItem = Awaited<ReturnType<typeof getPublicMediaTV>>[number]
