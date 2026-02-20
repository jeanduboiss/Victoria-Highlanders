'use server'

import { actionClient } from '@/lib/safe-action'
import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { createSeasonSchema, activateSeasonSchema, archiveSeasonSchema } from '../schemas/season.schema'

export const createSeasonAction = actionClient
  .schema(createSeasonSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'seasons', 'write')

    const season = await prisma.season.create({
      data: {
        organizationId: ctx.organizationId,
        name: parsedInput.name,
        shortName: parsedInput.shortName,
        startDate: new Date(parsedInput.startDate),
        endDate: new Date(parsedInput.endDate),
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/seasons`)
    return season
  })

export const activateSeasonAction = actionClient
  .schema(activateSeasonSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'seasons', 'write')

    // The DB trigger enforce_single_current_season handles deactivating others
    const season = await prisma.season.update({
      where: { id: parsedInput.seasonId, organizationId: ctx.organizationId },
      data: { isCurrent: true },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/seasons`)
    return season
  })

export const archiveSeasonAction = actionClient
  .schema(archiveSeasonSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'seasons', 'write')

    // The DB trigger prevent_archive_current_season blocks archiving the active season
    // The DB trigger auto_lock_on_season_archive locks all records automatically
    const season = await prisma.season.update({
      where: {
        id: parsedInput.seasonId,
        organizationId: ctx.organizationId,
        isArchived: false, // Safety check
      },
      data: { isArchived: true, isCurrent: false },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/seasons`)
    return season
  })
