import { Users, Trophy, Newspaper, CalendarRange } from 'lucide-react'
import { requireOrgAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import { KpiCard } from '@/components/admin/dashboard/kpi-card'
import { NextMatchWidget } from '@/components/admin/dashboard/next-match-widget'
import { RecentArticlesWidget } from '@/components/admin/dashboard/recent-articles-widget'
import { ActivityFeed, type ActivityItem } from '@/components/admin/dashboard/activity-feed'

interface DashboardPageProps {
  params: Promise<{ orgSlug: string }>
}

async function getDashboardData(organizationId: string, orgSlug: string) {
  const [playerCount, publishedMatchCount, articleCount, upcomingEventCount, nextMatch, recentArticles] =
    await Promise.all([
      prisma.player.count({ where: { organizationId, isActive: true } }),
      prisma.match.count({ where: { organizationId, status: 'FINISHED' } }),
      prisma.article.count({ where: { organizationId, status: 'PUBLISHED' } }),
      prisma.event.count({
        where: { organizationId, status: 'PUBLISHED', startDatetime: { gte: new Date() } },
      }),
      prisma.match.findFirst({
        where: { organizationId, status: 'SCHEDULED', matchDate: { gte: new Date() } },
        orderBy: { matchDate: 'asc' },
        include: {
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } },
          venue: { select: { name: true } },
        },
      }),
      prisma.article.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, status: true, publishedAt: true, slug: true },
      }),
    ])

  // Build a synthetic activity feed from recent DB activity
  const recentActivity: ActivityItem[] = []

  const recentFinishedMatches = await prisma.match.findMany({
    where: { organizationId, status: 'FINISHED' },
    orderBy: { updatedAt: 'desc' },
    take: 3,
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
    },
  })
  recentFinishedMatches.forEach((m) => {
    recentActivity.push({
      id: `match-${m.id}`,
      type: 'match_finished',
      description: `${m.homeTeam.name} ${m.homeScore ?? '?'} – ${m.awayScore ?? '?'} ${m.awayTeam.name}`,
      createdAt: m.updatedAt,
    })
  })

  const recentPublishedArticles = await prisma.article.findMany({
    where: { organizationId, status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: { id: true, title: true, publishedAt: true },
  })
  recentPublishedArticles.forEach((a) => {
    recentActivity.push({
      id: `article-${a.id}`,
      type: 'article_published',
      description: `Artículo publicado: "${a.title}"`,
      createdAt: a.publishedAt ?? new Date(),
    })
  })

  // Sort activity by date desc and take top 6
  recentActivity.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  const latestActivity = recentActivity.slice(0, 6)

  return {
    kpis: { playerCount, publishedMatchCount, articleCount, upcomingEventCount },
    nextMatch,
    recentArticles,
    latestActivity,
  }
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { orgSlug } = await params
  const ctx = await requireOrgAccess(orgSlug).catch(() => redirect('/login'))

  const { kpis, nextMatch, recentArticles, latestActivity } = await getDashboardData(
    ctx.organizationId,
    orgSlug
  )

  const firstName = ctx.email.split('@')[0]

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Bienvenido, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Resumen del club · Victoria Highlanders FC
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Jugadores activos"
          value={kpis.playerCount}
          icon={Users}
          description="En el pool de la organización"
        />
        <KpiCard
          title="Partidos jugados"
          value={kpis.publishedMatchCount}
          icon={Trophy}
          description="Finalizados esta temporada"
        />
        <KpiCard
          title="Artículos publicados"
          value={kpis.articleCount}
          icon={Newspaper}
          description="En el sitio web"
        />
        <KpiCard
          title="Eventos próximos"
          value={kpis.upcomingEventCount}
          icon={CalendarRange}
          description="Publicados y futuros"
        />
      </div>

      {/* Widgets row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NextMatchWidget orgSlug={orgSlug} match={nextMatch} />
        <RecentArticlesWidget orgSlug={orgSlug} articles={recentArticles} />
        <ActivityFeed items={latestActivity} />
      </div>
    </div>
  )
}
