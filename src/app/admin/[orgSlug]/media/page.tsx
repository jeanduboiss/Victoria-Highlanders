import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import { MediaGrid } from './_components/media-grid'
import { UploadAssetSheet } from './_components/upload-asset-sheet'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

interface Props {
  params: Promise<{ orgSlug: string }>
}

export default async function MediaPage({ params }: Props) {
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
          <h1 className="text-2xl font-bold tracking-tight">Biblioteca de Media</h1>
          <p className="text-muted-foreground">{assets.length} asset(s) en la raíz.</p>
        </div>
        <UploadAssetSheet orgSlug={orgSlug}>
          <Button size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Subir archivo
          </Button>
        </UploadAssetSheet>
      </div>
      <MediaGrid assets={mappedAssets} folders={folders} orgSlug={orgSlug} />
    </div>
  )
}
