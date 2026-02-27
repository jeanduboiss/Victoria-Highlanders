import { prisma } from '@/lib/prisma/client'
import { cache } from 'react'

const getDefaultOrg = cache(async () => {
  const slug = process.env.DEFAULT_ORG_SLUG ?? 'victoria-highlanders'
  return prisma.organization.findUniqueOrThrow({ where: { slug }, select: { id: true } })
})

export async function getPublicPlayers({ limit = 8 }: { limit?: number } = {}) {
  const org = await getDefaultOrg()
  return prisma.player.findMany({
    where: { organizationId: org.id, isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      position: true,
      photoUrl: true,
      jerseyNumberDefault: true,
      nationalities: { where: { isPrimary: true }, select: { country: true } },
    },
    orderBy: [{ position: 'asc' }, { lastName: 'asc' }],
    take: limit,
  })
}

export type PublicPlayer = Awaited<ReturnType<typeof getPublicPlayers>>[number]

export async function getPublicPlayersAll() {
  const org = await getDefaultOrg()
  return prisma.player.findMany({
    where: { organizationId: org.id, isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      position: true,
      photoUrl: true,
      jerseyNumberDefault: true,
      heightCm: true,
      biography: true,
      nationalities: { where: { isPrimary: true }, select: { country: true } },
    },
    orderBy: [{ position: 'asc' }, { lastName: 'asc' }],
  })
}

export type PublicPlayerFull = Awaited<ReturnType<typeof getPublicPlayersAll>>[number]

import type { TeamCategory } from '@prisma/client'

export async function getRosterFilters() {
  const org = await getDefaultOrg()
  const [seasons, teams] = await Promise.all([
    prisma.season.findMany({
      where: { organizationId: org.id },
      select: { id: true, name: true, isCurrent: true },
      orderBy: { startDate: 'desc' }
    }),
    prisma.team.findMany({
      where: { organizationId: org.id, isActive: true, isExternal: false },
      select: { id: true, name: true, category: true },
      orderBy: { name: 'asc' }
    })
  ])
  return { seasons, teams }
}

export async function getPublicRoster({ seasonId, category }: { seasonId?: string, category?: TeamCategory }) {
  const org = await getDefaultOrg()

  let targetSeasonId = seasonId
  if (!targetSeasonId) {
    const currentSeason = await prisma.season.findFirst({
      where: { organizationId: org.id, isCurrent: true }
    })
    if (currentSeason) targetSeasonId = currentSeason.id
  }

  const targetCategory = category ?? 'FIRST_TEAM'

  const records = await prisma.playerSeasonRecord.findMany({
    where: {
      seasonId: targetSeasonId,
      team: { category: targetCategory, organizationId: org.id },
      status: 'ACTIVE'
    },
    select: {
      id: true,
      jerseyNumber: true,
      player: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          position: true,
          photoUrl: true,
          nationalities: { where: { isPrimary: true }, select: { country: true } }
        }
      },
      seasonStats: {
        select: { goals: true }
      }
    },
    orderBy: [
      { player: { position: 'asc' } },
      { player: { lastName: 'asc' } }
    ]
  })

  const playerMap = new Map()

  for (const record of records) {
    const pid = record.player.id
    if (!playerMap.has(pid)) {
      playerMap.set(pid, {
        id: pid,
        recordId: record.id,
        firstName: record.player.firstName,
        lastName: record.player.lastName,
        position: record.player.position,
        photoUrl: record.player.photoUrl,
        jerseyNumber: record.jerseyNumber,
        country: record.player.nationalities[0]?.country ?? null,
        goals: record.seasonStats?.goals ?? 0
      })
    } else {
      const existing = playerMap.get(pid)
      if (record.jerseyNumber != null && existing.jerseyNumber == null) {
        existing.jerseyNumber = record.jerseyNumber
      }
      if (record.seasonStats?.goals) {
        existing.goals += record.seasonStats.goals
      }
    }
  }

  return Array.from(playerMap.values())
}

export type PublicRosterPlayer = Awaited<ReturnType<typeof getPublicRoster>>[number]
