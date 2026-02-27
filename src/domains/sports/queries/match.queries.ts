/**
 * Sports — Match read queries.
 * Use in React Server Components.
 */

import { prisma } from '@/lib/prisma/client'

export async function getMatchesByOrg(organizationId: string, seasonId?: string) {
  return prisma.match.findMany({
    where: {
      organizationId,
      ...(seasonId ? { seasonId } : {}),
    },
    include: {
      homeTeam: { select: { name: true, badgeUrl: true } },
      awayTeam: { select: { name: true, badgeUrl: true } },
      venue: { select: { name: true } },
      season: { select: { name: true } },
    },
    orderBy: { matchDate: 'desc' },
  })
}

export async function getMatchWithEvents(matchId: string, organizationId: string) {
  return prisma.match.findFirst({
    where: { id: matchId, organizationId },
    include: {
      homeTeam: true,
      awayTeam: true,
      venue: true,
      season: true,
      events: {
        include: {
          player: {
            select: { firstName: true, lastName: true, position: true },
          },
          assistPlayer: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: [{ minute: 'asc' }, { extraTimeMinute: 'asc' }],
      },
    },
  })
}
