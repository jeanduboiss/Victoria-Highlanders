import { requirePermission } from '@/lib/auth'
import { getSiteConfig } from '@/domains/configuration/actions/site-config.actions'
import { redirect } from 'next/navigation'
import { SiteConfigForm } from './_components/site-config-form'
import { HeroConfigForm } from './_components/hero-config-form'
import { SponsorsForm } from './_components/sponsors-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { prisma } from '@/lib/prisma/client'

interface Props {
  params: Promise<{ orgSlug: string }>
}

export default async function ConfigurationPage({ params }: Props) {
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
        <h1 className="text-2xl font-bold tracking-tight">Configuración del sitio</h1>
        <p className="text-muted-foreground">
          Los cambios se reflejan en el sitio público inmediatamente.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
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
