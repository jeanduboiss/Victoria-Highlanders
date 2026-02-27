'use server'

import { actionClient } from '@/lib/safe-action'
import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import {
  createPlayerSchema,
  updatePlayerSchema,
  enrollPlayerSchema,
  transferPlayerSchema,
  createTeamSchema,
  createStaffMemberSchema,
  updatePlayerStatsSchema,
} from '../schemas/squad.schema'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// TEAMS
// ---------------------------------------------------------------------------

export const createTeamAction = actionClient
  .schema(createTeamSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'teams', 'write')

    const team = await prisma.team.create({
      data: {
        organizationId: ctx.organizationId,
        name: parsedInput.name,
        shortName: parsedInput.shortName,
        category: parsedInput.category,
        gender: parsedInput.gender,
        description: parsedInput.description,
        foundedYear: parsedInput.foundedYear,
        isExternal: parsedInput.isExternal,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/teams`)
    return team
  })

export const updateTeamAction = actionClient
  .schema(createTeamSchema.extend({ teamId: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'teams', 'write')

    const team = await prisma.team.update({
      where: { id: parsedInput.teamId, organizationId: ctx.organizationId },
      data: {
        name: parsedInput.name,
        shortName: parsedInput.shortName,
        category: parsedInput.category,
        gender: parsedInput.gender,
        description: parsedInput.description,
        isExternal: parsedInput.isExternal,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/teams`)
    return team
  })

// ---------------------------------------------------------------------------
// PLAYERS
// ---------------------------------------------------------------------------

export const createPlayerAction = actionClient
  .schema(createPlayerSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'players', 'write')

    const player = await prisma.$transaction(async (tx) => {
      const p = await tx.player.create({
        data: {
          organizationId: ctx.organizationId,
          firstName: parsedInput.firstName,
          lastName: parsedInput.lastName,
          dateOfBirth: parsedInput.dateOfBirth ? new Date(parsedInput.dateOfBirth) : undefined,
          position: parsedInput.position,
          preferredFoot: parsedInput.preferredFoot,
          heightCm: parsedInput.heightCm,
          weightKg: parsedInput.weightKg,
          biography: parsedInput.biography,
          jerseyNumberDefault: parsedInput.jerseyNumberDefault,
          createdBy: ctx.userId,
          nationalities: {
            create: parsedInput.nationalities,
          },
        },
        include: { nationalities: true },
      })

      // Auto-enroll in team if teamId and seasonId are provided
      if (parsedInput.teamId && parsedInput.seasonId) {
        const record = await tx.playerSeasonRecord.create({
          data: {
            playerId: p.id,
            teamId: parsedInput.teamId,
            seasonId: parsedInput.seasonId,
            jerseyNumber: parsedInput.jerseyNumberDefault,
            transferInDate: new Date(),
            isCurrent: true,
          },
        })

        await tx.playerStatsSeason.create({
          data: {
            playerSeasonRecordId: record.id,
            playerId: p.id,
            teamId: parsedInput.teamId,
            seasonId: parsedInput.seasonId,
          },
        })
      }

      return p
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/players`)
    return player
  })

export const updatePlayerAction = actionClient
  .schema(createPlayerSchema.extend({ playerId: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'players', 'write')

    // Replace nationalities
    await prisma.playerNationality.deleteMany({
      where: { playerId: parsedInput.playerId },
    })

    const player = await prisma.player.update({
      where: { id: parsedInput.playerId, organizationId: ctx.organizationId },
      data: {
        firstName: parsedInput.firstName,
        lastName: parsedInput.lastName,
        dateOfBirth: parsedInput.dateOfBirth ? new Date(parsedInput.dateOfBirth) : undefined,
        position: parsedInput.position,
        preferredFoot: parsedInput.preferredFoot,
        heightCm: parsedInput.heightCm,
        weightKg: parsedInput.weightKg,
        biography: parsedInput.biography,
        jerseyNumberDefault: parsedInput.jerseyNumberDefault,
        updatedBy: ctx.userId,
        nationalities: {
          create: parsedInput.nationalities,
        },
      },
      include: { nationalities: true },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/players`)
    return player
  })

export const deactivatePlayerAction = actionClient
  .schema(z.object({ orgSlug: z.string(), playerId: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'players', 'write')

    const player = await prisma.player.update({
      where: { id: parsedInput.playerId, organizationId: ctx.organizationId },
      data: { isActive: false, updatedBy: ctx.userId },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/players`)
    return player
  })

// ---------------------------------------------------------------------------
// SEASON ENROLLMENT & TRANSFERS
// ---------------------------------------------------------------------------

export const enrollPlayerAction = actionClient
  .schema(enrollPlayerSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'players', 'write')

    // Verify season belongs to org and is not archived
    const season = await prisma.season.findFirstOrThrow({
      where: {
        id: parsedInput.seasonId,
        organizationId: ctx.organizationId,
        isArchived: false,
      },
    })

    // Create PlayerSeasonRecord + empty PlayerStatsSeason in transaction
    const record = await prisma.$transaction(async (tx) => {
      const r = await tx.playerSeasonRecord.create({
        data: {
          playerId: parsedInput.playerId,
          teamId: parsedInput.teamId,
          seasonId: season.id,
          jerseyNumber: parsedInput.jerseyNumber,
          contractType: parsedInput.contractType,
          transferInDate: new Date(parsedInput.transferInDate),
          isCurrent: true,
        },
      })

      await tx.playerStatsSeason.create({
        data: {
          playerSeasonRecordId: r.id,
          playerId: parsedInput.playerId,
          teamId: parsedInput.teamId,
          seasonId: season.id,
        },
      })

      return r
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/players`)
    return record
  })

export const transferPlayerAction = actionClient
  .schema(transferPlayerSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'players', 'write')

    const currentRecord = await prisma.playerSeasonRecord.findUniqueOrThrow({
      where: { id: parsedInput.currentRecordId },
      include: { season: true },
    })

    if (currentRecord.isLocked || currentRecord.season.isArchived) {
      throw new Error('Cannot transfer player in an archived season.')
    }

    const newRecord = await prisma.$transaction(async (tx) => {
      // Close current record
      await tx.playerSeasonRecord.update({
        where: { id: parsedInput.currentRecordId },
        data: {
          transferOutDate: new Date(parsedInput.transferDate),
          isCurrent: false,
        },
      })

      // Create new record for destination team
      const r = await tx.playerSeasonRecord.create({
        data: {
          playerId: currentRecord.playerId,
          teamId: parsedInput.newTeamId,
          seasonId: currentRecord.seasonId,
          jerseyNumber: parsedInput.jerseyNumber,
          contractType: currentRecord.contractType,
          transferInDate: new Date(parsedInput.transferDate),
          isCurrent: true,
        },
      })

      // Create empty stats for the new period
      await tx.playerStatsSeason.create({
        data: {
          playerSeasonRecordId: r.id,
          playerId: currentRecord.playerId,
          teamId: parsedInput.newTeamId,
          seasonId: currentRecord.seasonId,
        },
      })

      return r
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/players`)
    return newRecord
  })

// ---------------------------------------------------------------------------
// STAFF
// ---------------------------------------------------------------------------

export const createStaffMemberAction = actionClient
  .schema(createStaffMemberSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'staff', 'write')

    const member = await prisma.staffMember.create({
      data: {
        organizationId: ctx.organizationId,
        teamId: parsedInput.teamId,
        firstName: parsedInput.firstName,
        lastName: parsedInput.lastName,
        role: parsedInput.role,
        nationality: parsedInput.nationality,
        dateOfBirth: parsedInput.dateOfBirth ? new Date(parsedInput.dateOfBirth) : undefined,
        biography: parsedInput.biography,
        startDate: parsedInput.startDate ? new Date(parsedInput.startDate) : undefined,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/teams`)
    return member
  })

// ---------------------------------------------------------------------------
// PLAYER STATS
// ---------------------------------------------------------------------------

export const updatePlayerStatsAction = actionClient
  .schema(updatePlayerStatsSchema)
  .action(async ({ parsedInput }) => {
    await requirePermission(parsedInput.orgSlug, 'players', 'write')

    const stats = await prisma.playerStatsSeason.update({
      where: { id: parsedInput.statsId },
      data: {
        matchesPlayed: parsedInput.matchesPlayed,
        matchesStarted: parsedInput.matchesStarted,
        minutesPlayed: parsedInput.minutesPlayed,
        goals: parsedInput.goals,
        assists: parsedInput.assists,
        yellowCards: parsedInput.yellowCards,
        redCards: parsedInput.redCards,
        cleanSheets: parsedInput.cleanSheets,
        goalsConceded: parsedInput.goalsConceded,
        saves: parsedInput.saves,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/players`)
    return stats
  })
