import { prisma } from '@/lib/prisma/client'

/** Obtiene un artículo completo con categorías y tags */
export async function getArticleById(articleId: string, organizationId: string) {
    return prisma.article.findFirst({
        where: { id: articleId, organizationId },
        include: {
            author: { select: { id: true, email: true } },
            ArticleCategories: {
                include: {
                    article_categories: true,
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
        },
    })
}

/** Obtiene todos los artículos de la organización */
export async function getArticlesByOrg(organizationId: string) {
    return prisma.article.findMany({
        where: { organizationId },
        orderBy: { updatedAt: 'desc' },
        include: {
            author: { select: { email: true } },
            ArticleCategories: {
                include: {
                    article_categories: {
                        select: { name: true },
                    },
                },
            },
            _count: { select: { tags: true, ArticleCategories: true } },
        },
    })
}

/** Obtiene todas las categorías de artículos de la organización */
export async function getCategoriesByOrg(organizationId: string) {
    return prisma.articleCategory.findMany({
        where: { organizationId },
        orderBy: { name: 'asc' },
        include: {
            _count: { select: { ArticleCategories: true } },
        },
    })
}

/** Obtiene todos los tags de la organización */
export async function getTagsByOrg(organizationId: string) {
    return prisma.tag.findMany({
        where: { organizationId },
        orderBy: { name: 'asc' },
        include: {
            _count: { select: { articles: true, events: true } },
        },
    })
}

/** Obtiene todos los eventos de la organización */
export async function getEventsByOrg(organizationId: string) {
    return prisma.event.findMany({
        where: { organizationId },
        orderBy: { startDatetime: 'desc' },
        include: {
            tags: {
                select: {
                    tag: { select: { id: true, name: true } },
                },
            },
        },
    })
}

/** Obtiene evento por ID */
export async function getEventById(eventId: string, organizationId: string) {
    return prisma.event.findFirst({
        where: { id: eventId, organizationId },
        include: {
            tags: {
                select: {
                    tag: { select: { id: true, name: true } },
                },
            },
        },
    })
}
