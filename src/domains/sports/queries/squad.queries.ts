/**
 * Sports — Squad read queries.
 * Use in React Server Components for data fetching.
 */

import { prisma } from '@/lib/prisma/client'

export async function getTeamsByOrg(organizationId: string) {
  return prisma.team.findMany({
    where: { organizationId, isActive: true },
    orderBy: { name: 'asc' },
  })
}

export async function getPlayersByOrg(organizationId: string) {
  return prisma.player.findMany({
    where: { organizationId },
    include: { nationalities: true },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })
}

export async function getPlayerWithHistory(playerId: string, organizationId: string) {
  const player = await prisma.player.findFirst({
    where: { id: playerId, organizationId },
    include: {
      nationalities: true,
      seasonRecords: {
        include: {
          team: { select: { name: true, category: true } },
          season: { select: { name: true, isArchived: true } },
          seasonStats: true,
        },
        orderBy: { transferInDate: 'desc' },
      },
    },
  })
  if (!player) return null
  const careerStats = {
    matchesPlayed: player.seasonRecords.reduce((acc, r) => acc + (r.seasonStats?.matchesPlayed ?? 0), 0),
    goals: player.seasonRecords.reduce((acc, r) => acc + (r.seasonStats?.goals ?? 0), 0),
    yellowCards: player.seasonRecords.reduce((acc, r) => acc + (r.seasonStats?.yellowCards ?? 0), 0),
    redCards: player.seasonRecords.reduce((acc, r) => acc + (r.seasonStats?.redCards ?? 0), 0),
  }
  return { ...player, careerStats }
}

export async function getCurrentSquad(teamId: string, seasonId: string) {
  return prisma.playerSeasonRecord.findMany({
    where: { teamId, seasonId, isCurrent: true },
    include: {
      player: {
        include: { nationalities: { where: { isPrimary: true } } },
      },
      seasonStats: true,
    },
    orderBy: [{ jerseyNumber: 'asc' }],
  })
}

export async function getActiveSeasonByOrg(organizationId: string) {
  return prisma.season.findFirst({
    where: { organizationId, isCurrent: true },
  })
}

export async function getSeasonsByOrg(organizationId: string) {
  return prisma.season.findMany({
    where: { organizationId },
    orderBy: { startDate: 'desc' },
  })
}
