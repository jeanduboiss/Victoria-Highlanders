'use server'

import { z } from 'zod'
import { actionClient } from '@/lib/safe-action'
import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'

const baseSchema = z.object({ orgSlug: z.string() })

const upsertSchema = baseSchema.extend({
  id: z.string().uuid().optional(),
  authorName: z.string().min(1).max(120),
  authorRole: z.string().max(80).optional(),
  authorAvatarUrl: z.string().url().optional().or(z.literal('')),
  content: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5).default(5),
})

const toggleSchema = baseSchema.extend({
  id: z.string().uuid(),
  field: z.enum(['isPublished', 'isFeatured']),
  value: z.boolean(),
})

const deleteSchema = baseSchema.extend({ id: z.string().uuid() })

export const upsertTestimonialAction = actionClient
  .schema(upsertSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'testimonials', 'write')

    const data = {
      organizationId: ctx.organizationId,
      authorName: parsedInput.authorName,
      authorRole: parsedInput.authorRole || null,
      authorAvatarUrl: parsedInput.authorAvatarUrl || null,
      content: parsedInput.content,
      rating: parsedInput.rating,
    }

    if (parsedInput.id) {
      await prisma.testimonial.update({
        where: { id: parsedInput.id, organizationId: ctx.organizationId },
        data,
      })
    } else {
      await prisma.testimonial.create({ data })
    }

    revalidatePath(`/admin/${parsedInput.orgSlug}/site/testimonials`)
    return { success: true }
  })

export const toggleTestimonialAction = actionClient
  .schema(toggleSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'testimonials', 'write')

    await prisma.testimonial.update({
      where: { id: parsedInput.id, organizationId: ctx.organizationId },
      data: { [parsedInput.field]: parsedInput.value },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/site/testimonials`)
    return { success: true }
  })

export const deleteTestimonialAction = actionClient
  .schema(deleteSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'testimonials', 'delete')

    await prisma.testimonial.delete({
      where: { id: parsedInput.id, organizationId: ctx.organizationId },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/site/testimonials`)
    return { success: true }
  })
