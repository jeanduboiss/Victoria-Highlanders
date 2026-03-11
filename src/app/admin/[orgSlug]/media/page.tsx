import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { MediaGrid } from './_components/media-grid'
import { UploadAssetSheet } from './_components/upload-asset-sheet'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

interface Props {
  params: Promise<{ orgSlug: string }>
}

export default async function MediaPage({ params }: Props) {
  const t = await getTranslations('admin.pages')
  const { orgSlug } = await params
  const ctx = await requirePermission(orgSlug, 'media', 'read').catch(() => redirect('/login'))

  const [assets, folders] = await Promise.all([
    prisma.mediaAsset.findMany({
      where: { organizationId: ctx.organizationId, isArchived: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.mediaFolder.findMany({
      where: { organizationId: ctx.organizationId, parentId: null },
      orderBy: { name: 'asc' },
    }),
  ])

  const mappedAssets = assets.map((asset) => ({
    ...asset,
    fileSize: Number(asset.fileSizeBytes),
  }))

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('media.title')}</h1>
          <p className="text-muted-foreground">{t('media.desc', { count: assets.length })}</p>
        </div>
        <UploadAssetSheet orgSlug={orgSlug}>
          <Button size="sm">
            <Upload className="mr-2 h-4 w-4" />
            {t('media.upload')}
          </Button>
        </UploadAssetSheet>
      </div>
      <MediaGrid assets={mappedAssets} folders={folders} orgSlug={orgSlug} />
    </div>
  )
}
