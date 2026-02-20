'use client'

import Image from 'next/image'
import { FolderOpen, FileText, Film, Music, File } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Asset = {
  id: string
  fileName: string
  mimeType: string
  publicUrl: string
  fileSize: number
  width: number | null
  height: number | null
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
  if (mimeType.startsWith('video/')) return <Film className="h-8 w-8 text-muted-foreground" />
  if (mimeType.startsWith('audio/')) return <Music className="h-8 w-8 text-muted-foreground" />
  if (mimeType === 'application/pdf') return <FileText className="h-8 w-8 text-muted-foreground" />
  return <File className="h-8 w-8 text-muted-foreground" />
}

export function MediaGrid({ assets, folders, orgSlug }: MediaGridProps) {
  if (folders.length === 0 && assets.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <FolderOpen className="h-10 w-10" />
        <p className="text-sm">La biblioteca está vacía. Sube tu primer archivo.</p>
      </div>
    )

  return (
    <div className="space-y-4">
      {folders.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Carpetas</p>
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
          <p className="text-sm font-medium text-muted-foreground mb-2">Archivos</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {assets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                <div className="aspect-square relative bg-muted flex items-center justify-center">
                  {asset.mimeType.startsWith('image/') ? (
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
                </div>
                <div className="p-2">
                  <p className="text-xs truncate font-medium">{asset.fileName}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(asset.fileSize)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
