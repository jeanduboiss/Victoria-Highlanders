'use server'

import { actionClient } from '@/lib/safe-action'
import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { recalculateStatsForMatch } from '@/lib/utils/stats'
import {
  scheduleMatchSchema,
  updateMatchResultSchema,
  addMatchEventSchema,
  removeMatchEventSchema,
} from '../schemas/match.schema'
import { z } from 'zod'

export const scheduleMatchAction = actionClient
  .schema(scheduleMatchSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'matches', 'write')

    const match = await prisma.match.create({
      data: {
        organizationId: ctx.organizationId,
        seasonId: parsedInput.seasonId,
        homeTeamId: parsedInput.homeTeamId,
        awayTeamId: parsedInput.awayTeamId,
        competitionName: parsedInput.competitionName,
        matchDate: new Date(parsedInput.matchDate),
        venueId: parsedInput.venueId,
        matchDay: parsedInput.matchDay,
        round: parsedInput.round,
        isHomeGame: parsedInput.isHomeGame,
        notes: parsedInput.notes,
        createdBy: ctx.userId,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/matches`)
    return match
  })

export const updateMatchResultAction = actionClient
  .schema(updateMatchResultSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'matches', 'write')

    const match = await prisma.match.update({
      where: { id: parsedInput.matchId, organizationId: ctx.organizationId },
      data: {
        homeScore: parsedInput.homeScore,
        awayScore: parsedInput.awayScore,
        status: 'FINISHED',
        updatedBy: ctx.userId,
      },
    })

    // Recalculate stats for all players involved in this match
    await recalculateStatsForMatch(parsedInput.matchId)

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/matches`)
    return match
  })

export const addMatchEventAction = actionClient
  .schema(addMatchEventSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'match_events', 'write')

    const event = await prisma.matchEvent.create({
      data: {
        matchId: parsedInput.matchId,
        playerId: parsedInput.playerId,
        eventType: parsedInput.eventType,
        minute: parsedInput.minute,
        extraTimeMinute: parsedInput.extraTimeMinute,
        description: parsedInput.description,
      },
    })

    // Recalculate stats after adding event
    await recalculateStatsForMatch(parsedInput.matchId)

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/matches/${parsedInput.matchId}`)
    return event
  })

export const removeMatchEventAction = actionClient
  .schema(removeMatchEventSchema)
  .action(async ({ parsedInput }) => {
    await requirePermission(parsedInput.orgSlug, 'match_events', 'write')

    const event = await prisma.matchEvent.findUniqueOrThrow({
      where: { id: parsedInput.eventId },
      select: { matchId: true },
    })

    await prisma.matchEvent.delete({ where: { id: parsedInput.eventId } })

    // Recalculate stats after removing event
    await recalculateStatsForMatch(event.matchId)

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/matches/${event.matchId}`)
    return { success: true }
  })

export const updateMatchStatusAction = actionClient
  .schema(z.object({
    orgSlug: z.string(),
    matchId: z.string().uuid(),
    status: z.enum(['POSTPONED', 'CANCELLED', 'ABANDONED']),
  }))
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'matches', 'write')

    const match = await prisma.match.update({
      where: { id: parsedInput.matchId, organizationId: ctx.organizationId },
      data: { status: parsedInput.status, updatedBy: ctx.userId },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/sports/matches`)
    return match
  })
