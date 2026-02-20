'use server'

import { actionClient } from '@/lib/safe-action'
import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { generateUniqueSlug } from '@/lib/utils/slug'
import {
  createArticleSchema,
  updateArticleSchema,
  scheduleArticleSchema,
  createCategorySchema,
  createTagSchema,
} from '../schemas/article.schema'
import { z } from 'zod'

export const createArticleAction = actionClient
  .schema(createArticleSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'articles', 'write')

    const slug = await generateUniqueSlug(parsedInput.title, ctx.organizationId, 'articles')

    const article = await prisma.article.create({
      data: {
        organizationId: ctx.organizationId,
        authorId: ctx.userId,
        title: parsedInput.title,
        slug,
        excerpt: parsedInput.excerpt,
        content: parsedInput.content as any,
        coverImageUrl: parsedInput.coverImageUrl,
        isFeatured: parsedInput.isFeatured,
        metaTitle: parsedInput.metaTitle,
        metaDescription: parsedInput.metaDescription,
        status: 'DRAFT',
        createdBy: ctx.userId,
        ArticleCategories: parsedInput.categoryIds.length > 0
          ? { create: parsedInput.categoryIds.map(id => ({ B: id })) }
          : undefined,
        tags: parsedInput.tagIds.length > 0
          ? { create: parsedInput.tagIds.map(id => ({ tagId: id })) }
          : undefined,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/editorial/articles`)
    return article
  })

export const updateArticleAction = actionClient
  .schema(updateArticleSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'articles', 'write')

    // If admin provides a custom slug, ensure it's unique (excluding this article)
    const slug = parsedInput.slug
      ? await generateUniqueSlug(parsedInput.slug, ctx.organizationId, 'articles', parsedInput.articleId)
      : undefined

    const article = await prisma.article.update({
      where: { id: parsedInput.articleId, organizationId: ctx.organizationId },
      data: {
        title: parsedInput.title,
        ...(slug ? { slug } : {}),
        excerpt: parsedInput.excerpt,
        content: parsedInput.content as any,
        coverImageUrl: parsedInput.coverImageUrl,
        isFeatured: parsedInput.isFeatured,
        metaTitle: parsedInput.metaTitle,
        metaDescription: parsedInput.metaDescription,
        updatedBy: ctx.userId,
        ArticleCategories: {
          deleteMany: {},
          create: parsedInput.categoryIds.map(id => ({ B: id })),
        },
        tags: {
          deleteMany: {},
          create: parsedInput.tagIds.map(id => ({ tagId: id })),
        },
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/editorial/articles`)
    revalidatePath(`/admin/${parsedInput.orgSlug}/editorial/articles/${parsedInput.articleId}`)
    return article
  })

export const publishArticleAction = actionClient
  .schema(z.object({ orgSlug: z.string(), articleId: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'articles', 'write')

    const article = await prisma.article.update({
      where: {
        id: parsedInput.articleId,
        organizationId: ctx.organizationId,
        status: { in: ['DRAFT', 'SCHEDULED'] },
      },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        scheduledAt: null,
        updatedBy: ctx.userId,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/editorial/articles`)
    revalidatePath(`/${parsedInput.orgSlug}/news`)
    return article
  })

export const scheduleArticleAction = actionClient
  .schema(scheduleArticleSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'articles', 'write')

    const article = await prisma.article.update({
      where: {
        id: parsedInput.articleId,
        organizationId: ctx.organizationId,
        status: 'DRAFT',
      },
      data: {
        status: 'SCHEDULED',
        scheduledAt: new Date(parsedInput.scheduledAt),
        updatedBy: ctx.userId,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/editorial/articles`)
    return article
  })

export const archiveArticleAction = actionClient
  .schema(z.object({ orgSlug: z.string(), articleId: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'articles', 'write')

    const article = await prisma.article.update({
      where: {
        id: parsedInput.articleId,
        organizationId: ctx.organizationId,
        status: 'PUBLISHED',
      },
      data: {
        status: 'ARCHIVED',
        updatedBy: ctx.userId,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/editorial/articles`)
    revalidatePath(`/${parsedInput.orgSlug}/news`)
    return article
  })

export const deleteArticleAction = actionClient
  .schema(z.object({ orgSlug: z.string(), articleId: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    // Only CLUB_ADMIN can delete; enforced by requiring 'delete' action
    const ctx = await requirePermission(parsedInput.orgSlug, 'articles', 'delete')

    // Only DRAFT articles can be deleted
    await prisma.article.delete({
      where: {
        id: parsedInput.articleId,
        organizationId: ctx.organizationId,
        status: 'DRAFT',
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/editorial/articles`)
    return { success: true }
  })

export const createCategoryAction = actionClient
  .schema(createCategorySchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'categories', 'write')

    const slug = await generateUniqueSlug(parsedInput.name, ctx.organizationId, 'article_categories')

    const category = await prisma.articleCategory.create({
      data: {
        organizationId: ctx.organizationId,
        name: parsedInput.name,
        slug,
        description: parsedInput.description,
        color: parsedInput.color,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/editorial/categories`)
    return category
  })

export const createTagAction = actionClient
  .schema(createTagSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'tags', 'write')

    const slug = await generateUniqueSlug(parsedInput.name, ctx.organizationId, 'tags')

    const tag = await prisma.tag.create({
      data: {
        organizationId: ctx.organizationId,
        name: parsedInput.name,
        slug,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/editorial/tags`)
    return tag
  })
