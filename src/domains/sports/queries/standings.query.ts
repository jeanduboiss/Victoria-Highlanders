import { prisma } from '@/lib/prisma/client'
import type { TeamCategory } from '@prisma/client'

export interface StandingsRow {
  team: {
    id: string
    name: string
    shortName: string | null
    category: TeamCategory
    badgeUrl: string | null
  }
  mp: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  gd: number
  pts: number
}

export async function getStandingsData(
  organizationId: string,
  opts: { seasonId?: string; category?: string; competitionName?: string },
): Promise<StandingsRow[]> {
  const teams = await prisma.team.findMany({
    where: {
      organizationId,
      isActive: true,
      ...(opts.category ? { category: opts.category as TeamCategory } : {}),
    },
    select: { id: true, name: true, shortName: true, category: true, badgeUrl: true },
  })

  if (!teams.length) return []

  const teamIds = teams.map((t) => t.id)

  const matches = await prisma.match.findMany({
    where: {
      organizationId,
      status: 'FINISHED',
      ...(opts.seasonId ? { seasonId: opts.seasonId } : {}),
      ...(opts.competitionName ? { competitionName: opts.competitionName } : {}),
      OR: [{ homeTeamId: { in: teamIds } }, { awayTeamId: { in: teamIds } }],
    },
    select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true },
  })

  const statsMap = new Map<string, { mp: number; w: number; d: number; l: number; gf: number; ga: number }>()
  for (const team of teams) statsMap.set(team.id, { mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 })

  const teamIdSet = new Set(teamIds)

  for (const match of matches) {
    const hs = match.homeScore ?? 0
    const as_ = match.awayScore ?? 0

    if (teamIdSet.has(match.homeTeamId)) {
      const s = statsMap.get(match.homeTeamId)!
      s.mp++
      s.gf += hs
      s.ga += as_
      if (hs > as_) s.w++
      else if (hs === as_) s.d++
      else s.l++
    }

    if (teamIdSet.has(match.awayTeamId)) {
      const s = statsMap.get(match.awayTeamId)!
      s.mp++
      s.gf += as_
      s.ga += hs
      if (as_ > hs) s.w++
      else if (as_ === hs) s.d++
      else s.l++
    }
  }

  const rows: StandingsRow[] = teams.map((team) => {
    const s = statsMap.get(team.id)!
    const gd = s.gf - s.ga
    const pts = s.w * 3 + s.d
    return { team, ...s, gd, pts }
  })

  rows.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.gd !== a.gd) return b.gd - a.gd
    return b.gf - a.gf
  })

  return rows
}

export async function getCompetitionNames(organizationId: string, seasonId?: string): Promise<string[]> {
  const results = await prisma.match.findMany({
    where: {
      organizationId,
      status: 'FINISHED',
      ...(seasonId ? { seasonId } : {}),
      competitionName: { not: null },
    },
    select: { competitionName: true },
    distinct: ['competitionName'],
  })
  return results
    .map((r) => r.competitionName)
    .filter((n): n is string => n !== null)
    .sort()
}
