/**
 * Player statistics recalculation.
 * Recalculates PlayerStatsSeason from scratch by summing all MatchEvents.
 * Called after match finalization or event add/remove.
 */

import { prisma } from '@/lib/prisma/client'

interface StatsAccumulator {
  matchesPlayed: number
  matchesStarted: number
  minutesPlayed: number
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  cleanSheets: number
  goalsConceded: number
  saves: number
}

/**
 * Recalculates all PlayerStatsSeason records for every player
 * involved in a specific match.
 *
 * Called after:
 * - Match result updated (FINISHED)
 * - MatchEvent added or removed
 */
export async function recalculateStatsForMatch(matchId: string): Promise<void> {
  const match = await prisma.match.findUniqueOrThrow({
    where: { id: matchId },
    select: { seasonId: true, organizationId: true },
  })

  const events = await prisma.matchEvent.findMany({
    where: { matchId },
    select: { playerId: true, assistPlayerId: true },
  })

  const playerIds = [
    ...new Set([
      ...events.map((e) => e.playerId),
      ...events.filter((e) => e.assistPlayerId).map((e) => e.assistPlayerId!),
    ]),
  ]

  // Recalculate stats for each player in this match
  await Promise.all(
    playerIds.map((playerId) =>
      recalculatePlayerStats(playerId, match.seasonId),
    ),
  )
}

/**
 * Recalculates PlayerStatsSeason for a single player in a season.
 * Aggregates ALL MatchEvents for the player across the entire season.
 * Stats are split per PlayerSeasonRecord (transfer-aware).
 */
export async function recalculatePlayerStats(
  playerId: string,
  seasonId: string,
): Promise<void> {
  // Get all season records for this player (may have multiple from transfers)
  const records = await prisma.playerSeasonRecord.findMany({
    where: { playerId, seasonId },
    select: { id: true, teamId: true, isLocked: true },
  })

  for (const record of records) {
    // Skip locked records (archived season)
    if (record.isLocked) continue

    const matchFilter = {
      seasonId,
      status: 'FINISHED' as const,
      OR: [{ homeTeamId: record.teamId }, { awayTeamId: record.teamId }],
    }

    const [matchEvents, assistCount] = await Promise.all([
      prisma.matchEvent.findMany({
        where: { playerId, match: matchFilter },
        select: { eventType: true, matchId: true },
      }),
      prisma.matchEvent.count({
        where: {
          assistPlayerId: playerId,
          eventType: { in: ['GOAL', 'PENALTY_SCORED'] },
          match: matchFilter,
        },
      }),
    ])

    const stats = computeStats(matchEvents)
    stats.assists = assistCount

    // Upsert PlayerStatsSeason
    await prisma.playerStatsSeason.upsert({
      where: { playerSeasonRecordId: record.id },
      update: stats,
      create: {
        playerSeasonRecordId: record.id,
        playerId,
        teamId: record.teamId,
        seasonId,
        ...stats,
      },
    })
  }
}

function computeStats(
  events: { eventType: string; matchId: string }[],
): StatsAccumulator {
  const matchIds = new Set(events.map((e) => e.matchId))

  return events.reduce<StatsAccumulator>(
    (acc, event) => {
      switch (event.eventType) {
        case 'GOAL':
        case 'PENALTY_SCORED':
          acc.goals++
          break
        case 'YELLOW_CARD':
          acc.yellowCards++
          break
        case 'RED_CARD':
        case 'YELLOW_RED_CARD':
          acc.redCards++
          break
        case 'SUBSTITUTION_IN':
          acc.matchesPlayed++
          break
        case 'SUBSTITUTION_OUT':
          // Player started if they were subbed out (implies they started)
          acc.matchesStarted++
          acc.minutesPlayed += event.eventType === 'SUBSTITUTION_OUT' ? 0 : 90
          break
      }
      return acc
    },
    {
      matchesPlayed: matchIds.size,
      matchesStarted: 0,
      minutesPlayed: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
      goalsConceded: 0,
      saves: 0,
    },
  )
}
