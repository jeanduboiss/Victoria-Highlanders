import { prisma } from '@/lib/prisma/client'
import { cache } from 'react'

const getDefaultOrg = cache(async () => {
  const slug = process.env.DEFAULT_ORG_SLUG
  if (!slug) throw new Error('DEFAULT_ORG_SLUG no está definido')
  return prisma.organization.findUniqueOrThrow({ where: { slug }, select: { id: true } })
})

export async function getPublicArticles({ limit = 3 }: { limit?: number } = {}) {
  const org = await getDefaultOrg()
  return prisma.article.findMany({
    where: { organizationId: org.id, status: 'PUBLISHED' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
      isFeatured: true,
      author: { select: { email: true } },
      ArticleCategories: {
        include: { article_categories: { select: { name: true, slug: true } } },
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  })
}

export type PublicArticle = Awaited<ReturnType<typeof getPublicArticles>>[number]
