'use client'

import { useTranslations } from 'next-intl'

import Image from 'next/image'
import { FolderOpen, FileText, Film, Music, File, Link as LinkIcon, Copy, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useAction } from 'next-safe-action/hooks'
import { archiveAssetAction } from '@/domains/media/actions/media.actions'

type Asset = {
  id: string
  fileName: string
  mimeType: string
  publicUrl: string
  fileSize: number
  width: number | null
  height: number | null
  isExternal: boolean
}

type Folder = {
  id: string
  name: string
}

interface MediaGridProps {
  assets: Asset[]
  folders: Folder[]
  orgSlug: string
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function AssetIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === 'url/external') return <LinkIcon className="h-8 w-8 text-muted-foreground" />
  if (mimeType.startsWith('video/')) return <Film className="h-8 w-8 text-muted-foreground" />
  if (mimeType.startsWith('audio/')) return <Music className="h-8 w-8 text-muted-foreground" />
  if (mimeType === 'application/pdf') return <FileText className="h-8 w-8 text-muted-foreground" />
  return <File className="h-8 w-8 text-muted-foreground" />
}

export function MediaGrid({ assets, folders, orgSlug }: MediaGridProps) {
  const t = useTranslations('admin.pages.media')
  const { execute: archiveAsset } = useAction(archiveAssetAction, {
    onSuccess: () => toast.success(t('deleteSuccess')),
    onError: ({ error }) => toast.error(error.serverError ?? t('deleteError')),
  })

  if (folders.length === 0 && assets.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <FolderOpen className="h-10 w-10" />
        <p className="text-sm">{t('noAssets')}</p>
      </div>
    )

  function handleCopy(e: React.MouseEvent, url: string) {
    e.stopPropagation()
    navigator.clipboard.writeText(url)
    toast.success(t('urlCopied'))
  }

  return (
    <div className="space-y-4">
      {folders.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{t('folders')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {folders.map((folder) => (
              <Card
                key={folder.id}
                className="p-3 flex flex-col items-center gap-2 cursor-pointer hover:bg-accent transition-colors"
              >
                <FolderOpen className="h-8 w-8 text-primary" />
                <span className="text-xs text-center truncate w-full">{folder.name}</span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {assets.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{t('files')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {assets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                <div className="aspect-square relative bg-muted flex items-center justify-center">
                  {asset.isExternal ? (
                    <img
                      src={asset.publicUrl}
                      alt={asset.fileName}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                        e.currentTarget.parentElement?.classList.add('fallback-icon-container')
                      }}
                    />
                  ) : asset.mimeType.startsWith('image/') ? (
                    <Image
                      src={asset.publicUrl}
                      alt={asset.fileName}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  ) : (
                    <AssetIcon mimeType={asset.mimeType} />
                  )}
                  {asset.isExternal && (
                    <Badge variant="secondary" className="absolute top-2 right-2 flex gap-1 z-10 bg-black/50 text-white hover:bg-black/50">
                      <LinkIcon className="w-3 h-3" /> URL
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-1 p-2">
                  <p className="text-xs truncate font-medium" title={asset.fileName}>{asset.fileName}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">{formatBytes(asset.fileSize)}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleCopy(e, asset.publicUrl)}
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        title={t('copyUrl')}
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(t('confirmDelete'))) {
                            archiveAsset({ orgSlug, assetId: asset.id })
                          }
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                        title={t('deleteAsset')}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
