import { Users, Trophy, Newspaper, CalendarRange, Bell } from 'lucide-react'
import Link from 'next/link'
import { requireOrgAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { KpiCard } from '@/components/admin/dashboard/kpi-card'
import { NextMatchWidget } from '@/components/admin/dashboard/next-match-widget'
import { RecentArticlesWidget } from '@/components/admin/dashboard/recent-articles-widget'
import { ActivityFeed, type ActivityItem } from '@/components/admin/dashboard/activity-feed'

interface DashboardPageProps {
  params: Promise<{ orgSlug: string }>
}

async function getDashboardData(organizationId: string) {
  const [playerCount, publishedMatchCount, articleCount, upcomingEventCount, pendingMemberCount, nextMatch, recentArticles] =
    await Promise.all([
      prisma.player.count({ where: { organizationId, isActive: true } }),
      prisma.match.count({ where: { organizationId, status: 'FINISHED' } }),
      prisma.article.count({ where: { organizationId, status: 'PUBLISHED' } }),
      prisma.event.count({
        where: { organizationId, status: 'PUBLISHED', startDatetime: { gte: new Date() } },
      }),
      prisma.organizationMember.count({ where: { organizationId, status: 'PENDING' } }),
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

  const recentActivity: ActivityItem[] = []

  const tActivity = await getTranslations('admin.dashboard')
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
      description: `${tActivity('matchFinished')}: ${m.homeTeam.name} ${m.homeScore ?? '?'} – ${m.awayScore ?? '?'} ${m.awayTeam.name}`,
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
      description: `${tActivity('articlePublished')}: "${a.title}"`,
      createdAt: a.publishedAt ?? new Date(),
    })
  })

  recentActivity.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return {
    kpis: { playerCount, publishedMatchCount, articleCount, upcomingEventCount, pendingMemberCount },
    nextMatch,
    recentArticles,
    latestActivity: recentActivity.slice(0, 6),
  }
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { orgSlug } = await params
  const locale = await getLocale()
  const t = await getTranslations('admin.dashboard')
  const ctx = await requireOrgAccess(orgSlug).catch(() => redirect('/login'))

  const { kpis, nextMatch, recentArticles, latestActivity } = await getDashboardData(ctx.organizationId)

  const firstName = ctx.email.split('@')[0]
  const today = new Date().toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'fr' ? 'fr-FR' : 'es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6 py-4">
      {kpis.pendingMemberCount > 0 && (
        <Link
          href={`/admin/${orgSlug}/users`}
          className="flex items-center gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 hover:bg-amber-500/15 transition-colors"
        >
          <Bell className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300 flex-1">
            <span className="font-semibold">{kpis.pendingMemberCount} {kpis.pendingMemberCount === 1 ? t('pendingMembers') : t('pendingMembersPlural')}</span>
            {' '}{t('pendingApproval')}
          </p>
          <span className="text-xs text-amber-400/60 font-medium uppercase tracking-wide shrink-0">{t('view')} →</span>
        </Link>
      )}

      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight capitalize">
            {t('welcome')} {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">{today}</p>
        </div>
        <p className="text-xs text-muted-foreground bg-muted rounded-full px-3 py-1 self-start sm:self-auto">
          {ctx.organizationName}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={t('kpi.activePlayers')}
          value={kpis.playerCount}
          icon={Users}
          description={t('kpi.activePlayersDesc')}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <KpiCard
          title={t('kpi.matchesPlayed')}
          value={kpis.publishedMatchCount}
          icon={Trophy}
          description={t('kpi.matchesPlayedDesc')}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-500/10"
        />
        <KpiCard
          title={t('kpi.publishedArticles')}
          value={kpis.articleCount}
          icon={Newspaper}
          description={t('kpi.publishedArticlesDesc')}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-500/10"
        />
        <KpiCard
          title={t('kpi.upcomingEvents')}
          value={kpis.upcomingEventCount}
          icon={CalendarRange}
          description={t('kpi.upcomingEventsDesc')}
          iconColor="text-violet-600 dark:text-violet-400"
          iconBg="bg-violet-500/10"
        />
      </div>

      {/* Widgets row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NextMatchWidget orgSlug={orgSlug} match={nextMatch} locale={locale} />
        <RecentArticlesWidget orgSlug={orgSlug} articles={recentArticles} locale={locale} />
        <ActivityFeed items={latestActivity} locale={locale} />
      </div>
    </div>
  )
}
