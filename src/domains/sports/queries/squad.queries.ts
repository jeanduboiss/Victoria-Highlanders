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
  return prisma.player.findFirst({
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
