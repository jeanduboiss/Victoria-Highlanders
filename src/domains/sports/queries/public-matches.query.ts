import { prisma } from '@/lib/prisma/client'
import { cache } from 'react'

const getDefaultOrg = cache(async () => {
  const slug = process.env.DEFAULT_ORG_SLUG ?? 'victoria-highlanders'
  return prisma.organization.findUniqueOrThrow({ where: { slug }, select: { id: true } })
})

export async function getPublicMatches({ limit = 5 }: { limit?: number } = {}) {
  const org = await getDefaultOrg()
  return prisma.match.findMany({
    where: { organizationId: org.id },
    select: {
      id: true,
      matchDate: true,
      status: true,
      homeScore: true,
      awayScore: true,
      competitionName: true,
      isHomeGame: true,
      round: true,
      homeTeam: { select: { name: true, badgeUrl: true } },
      awayTeam: { select: { name: true, badgeUrl: true } },
      venue: { select: { name: true } },
    },
    orderBy: { matchDate: 'desc' },
    take: limit,
  })
}

export type PublicMatch = Awaited<ReturnType<typeof getPublicMatches>>[number]

export async function getPublicMatchBar() {
  const org = await getDefaultOrg()

  const [latestResult, nextMatch] = await Promise.all([
    prisma.match.findFirst({
      where: { organizationId: org.id, status: 'FINISHED' },
      select: {
        homeScore: true,
        awayScore: true,
        homeTeam: { select: { name: true, shortName: true, badgeUrl: true } },
        awayTeam: { select: { name: true, shortName: true, badgeUrl: true } },
      },
      orderBy: { matchDate: 'desc' },
    }),
    prisma.match.findFirst({
      where: { organizationId: org.id, status: 'SCHEDULED' },
      select: {
        id: true,
        matchDate: true,
        homeTeam: { select: { name: true, shortName: true, badgeUrl: true } },
        awayTeam: { select: { name: true, shortName: true, badgeUrl: true } },
        venue: { select: { name: true } },
        isHomeGame: true,
      },
      orderBy: { matchDate: 'asc' },
    }),
  ])

  return { latestResult, nextMatch }
}

export type PublicMatchBar = Awaited<ReturnType<typeof getPublicMatchBar>>

export async function getPublicMatchesAll() {
  const org = await getDefaultOrg()
  return prisma.match.findMany({
    where: { organizationId: org.id },
    select: {
      id: true,
      matchDate: true,
      status: true,
      homeScore: true,
      awayScore: true,
      competitionName: true,
      isHomeGame: true,
      round: true,
      homeTeam: { select: { name: true, shortName: true, badgeUrl: true } },
      awayTeam: { select: { name: true, shortName: true, badgeUrl: true } },
      venue: { select: { name: true } },
    },
    orderBy: { matchDate: 'asc' },
  })
}

export type PublicMatchFull = Awaited<ReturnType<typeof getPublicMatchesAll>>[number]
