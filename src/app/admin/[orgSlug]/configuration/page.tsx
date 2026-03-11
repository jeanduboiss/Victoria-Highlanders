import { requirePermission } from '@/lib/auth'
import { getSiteConfig } from '@/domains/configuration/actions/site-config.actions'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { SiteConfigForm } from './_components/site-config-form'
import { HeroConfigForm } from './_components/hero-config-form'
import { SponsorsForm } from './_components/sponsors-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { prisma } from '@/lib/prisma/client'

interface Props {
  params: Promise<{ orgSlug: string }>
}

export default async function ConfigurationPage({ params }: Props) {
  const t = await getTranslations('admin.pages')
  const { orgSlug } = await params
  const ctx = await requirePermission(orgSlug, 'site_config', 'read').catch(() => redirect('/login'))

  const [config, articles, matches] = await Promise.all([
    getSiteConfig(ctx.organizationId),
    prisma.article.findMany({
      where: { organizationId: ctx.organizationId, status: 'PUBLISHED' },
      select: { id: true, title: true },
      orderBy: { publishedAt: 'desc' },
      take: 30,
    }),
    prisma.match.findMany({
      where: { organizationId: ctx.organizationId, status: 'SCHEDULED' },
      select: {
        id: true,
        matchDate: true,
        homeTeam: { select: { name: true, shortName: true } },
        awayTeam: { select: { name: true, shortName: true } },
      },
      orderBy: { matchDate: 'asc' },
      take: 20,
    }),
  ])
  const siteName = config?.siteName ?? 'Victoria Highlanders FC'
  const rawSponsors = config?.sponsorsJson
  const sponsors = Array.isArray(rawSponsors) ? rawSponsors as { name: string; logoUrl: string; websiteUrl?: string }[] : []

  return (
    <div className="space-y-4 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('configuration.title')}</h1>
        <p className="text-muted-foreground">
          {t('configuration.desc')}
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">{t('configuration.tabs.general')}</TabsTrigger>
          <TabsTrigger value="hero">{t('configuration.tabs.hero')}</TabsTrigger>
          <TabsTrigger value="sponsors">{t('configuration.tabs.sponsors')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SiteConfigForm orgSlug={orgSlug} config={config} />
        </TabsContent>

        <TabsContent value="hero">
          <HeroConfigForm
            orgSlug={orgSlug}
            siteName={siteName}
            config={config}
            articles={articles}
            matches={matches}
          />
        </TabsContent>

        <TabsContent value="sponsors">
          <SponsorsForm
            orgSlug={orgSlug}
            siteName={siteName}
            initialSponsors={sponsors}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
