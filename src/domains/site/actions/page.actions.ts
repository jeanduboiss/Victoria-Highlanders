'use server'

import { actionClient } from '@/lib/safe-action'
import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { createPageSchema, updatePageSchema, publishPageSchema, deletePageSchema } from '../schemas/page.schema'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

export const createPageAction = actionClient
  .schema(createPageSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'pages', 'write')

    const baseSlug = slugify(parsedInput.title)
    const existing = await prisma.page.findFirst({
      where: { organizationId: ctx.organizationId, slug: { startsWith: baseSlug } },
      orderBy: { createdAt: 'desc' },
    })
    const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug

    const page = await prisma.page.create({
      data: {
        organizationId: ctx.organizationId,
        title: parsedInput.title,
        slug,
        content: parsedInput.content ?? {},
        coverImageUrl: parsedInput.coverImageUrl || null,
        metaTitle: parsedInput.metaTitle || null,
        metaDescription: parsedInput.metaDescription || null,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/site/pages`)
    return page
  })

export const updatePageAction = actionClient
  .schema(updatePageSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'pages', 'write')

    const page = await prisma.page.update({
      where: { id: parsedInput.pageId, organizationId: ctx.organizationId },
      data: {
        ...(parsedInput.title !== undefined ? { title: parsedInput.title } : {}),
        ...(parsedInput.content !== undefined ? { content: parsedInput.content } : {}),
        coverImageUrl: parsedInput.coverImageUrl !== undefined ? (parsedInput.coverImageUrl || null) : undefined,
        metaTitle: parsedInput.metaTitle !== undefined ? (parsedInput.metaTitle || null) : undefined,
        metaDescription: parsedInput.metaDescription !== undefined ? (parsedInput.metaDescription || null) : undefined,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/site/pages`)
    revalidatePath(`/p/${page.slug}`)
    return page
  })

export const publishPageAction = actionClient
  .schema(publishPageSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'pages', 'write')

    const page = await prisma.page.update({
      where: { id: parsedInput.pageId, organizationId: ctx.organizationId },
      data: { status: 'PUBLISHED' },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/site/pages`)
    revalidatePath(`/p/${page.slug}`)
    return page
  })

export const unpublishPageAction = actionClient
  .schema(publishPageSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'pages', 'write')

    const page = await prisma.page.update({
      where: { id: parsedInput.pageId, organizationId: ctx.organizationId },
      data: { status: 'DRAFT' },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/site/pages`)
    revalidatePath(`/p/${page.slug}`)
    return page
  })

export const deletePageAction = actionClient
  .schema(deletePageSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'pages', 'delete')

    const page = await prisma.page.delete({
      where: { id: parsedInput.pageId, organizationId: ctx.organizationId },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/site/pages`)
    revalidatePath(`/p/${page.slug}`)
    revalidatePath(`/`)
    return page
  })
