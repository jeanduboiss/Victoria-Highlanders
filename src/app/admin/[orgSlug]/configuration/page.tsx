import { requirePermission } from '@/lib/auth'
import { getSiteConfig } from '@/domains/configuration/actions/site-config.actions'
import { redirect } from 'next/navigation'
import { SiteConfigForm } from './_components/site-config-form'

interface Props {
  params: Promise<{ orgSlug: string }>
}

export default async function ConfigurationPage({ params }: Props) {
  const { orgSlug } = await params
  const ctx = await requirePermission(orgSlug, 'site_config', 'read').catch(() => redirect('/login'))

  const config = await getSiteConfig(ctx.organizationId)

  return (
    <div className="space-y-4 py-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración del sitio</h1>
        <p className="text-muted-foreground">
          Los cambios se reflejan en el sitio público inmediatamente.
        </p>
      </div>
      <SiteConfigForm orgSlug={orgSlug} config={config} />
    </div>
  )
}
