'use server'

import { actionClient } from '@/lib/safe-action'
import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { generateUniqueSlug } from '@/lib/utils/slug'
import { createEventSchema, updateEventSchema } from '../schemas/event.schema'
import { z } from 'zod'

export const createEventAction = actionClient
  .schema(createEventSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'events', 'write')

    const slug = await generateUniqueSlug(parsedInput.title, ctx.organizationId, 'events')

    const event = await prisma.event.create({
      data: {
        organizationId: ctx.organizationId,
        title: parsedInput.title,
        slug,
        description: parsedInput.description,
        eventType: parsedInput.eventType,
        coverImageUrl: parsedInput.coverImageUrl,
        startDatetime: new Date(parsedInput.startDatetime),
        endDatetime: parsedInput.endDatetime ? new Date(parsedInput.endDatetime) : null,
        venueId: parsedInput.venueId,
        locationText: parsedInput.locationText,
        isFeatured: parsedInput.isFeatured,
        registrationUrl: parsedInput.registrationUrl,
        status: 'DRAFT',
        tags: parsedInput.tagIds.length > 0
          ? { create: parsedInput.tagIds.map(id => ({ tagId: id })) }
          : undefined,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/editorial/events`)
    return event
  })

export const updateEventAction = actionClient
  .schema(updateEventSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'events', 'write')

    const event = await prisma.event.update({
      where: { id: parsedInput.eventId, organizationId: ctx.organizationId },
      data: {
        title: parsedInput.title,
        description: parsedInput.description,
        eventType: parsedInput.eventType,
        coverImageUrl: parsedInput.coverImageUrl,
        startDatetime: new Date(parsedInput.startDatetime),
        endDatetime: parsedInput.endDatetime ? new Date(parsedInput.endDatetime) : null,
        venueId: parsedInput.venueId,
        locationText: parsedInput.locationText,
        isFeatured: parsedInput.isFeatured,
        registrationUrl: parsedInput.registrationUrl,
        tags: {
          deleteMany: {},
          create: parsedInput.tagIds.map(id => ({ tagId: id })),
        },
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/editorial/events`)
    revalidatePath(`/admin/${parsedInput.orgSlug}/editorial/events/${parsedInput.eventId}`)
    return event
  })

export const publishEventAction = actionClient
  .schema(z.object({ orgSlug: z.string(), eventId: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'events', 'write')

    const event = await prisma.event.update({
      where: {
        id: parsedInput.eventId,
        organizationId: ctx.organizationId,
        status: 'DRAFT',
      },
      data: {
        status: 'PUBLISHED',
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/editorial/events`)
    revalidatePath(`/${parsedInput.orgSlug}/events`)
    return event
  })

export const cancelEventAction = actionClient
  .schema(z.object({ orgSlug: z.string(), eventId: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'events', 'write')

    const event = await prisma.event.update({
      where: {
        id: parsedInput.eventId,
        organizationId: ctx.organizationId,
        status: { in: ['DRAFT', 'PUBLISHED'] },
      },
      data: {
        status: 'CANCELLED',
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/editorial/events`)
    revalidatePath(`/${parsedInput.orgSlug}/events`)
    return event
  })

export const finishEventAction = actionClient
  .schema(z.object({ orgSlug: z.string(), eventId: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'events', 'write')

    const event = await prisma.event.update({
      where: {
        id: parsedInput.eventId,
        organizationId: ctx.organizationId,
        status: 'PUBLISHED',
      },
      data: {
        status: 'FINISHED',
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/editorial/events`)
    return event
  })
