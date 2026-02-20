'use client'

import { useState, useRef } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { createBrowserClient } from '@supabase/ssr'
import { uploadAssetAction } from '@/domains/media/actions/media.actions'
import { generateStoragePath, buildPublicUrl } from '@/lib/utils/storage'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'

interface UploadAssetSheetProps {
  orgSlug: string
  children: React.ReactNode
}

export function UploadAssetSheet({ orgSlug, children }: UploadAssetSheetProps) {
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [altText, setAltText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const { execute } = useAction(uploadAssetAction, {
    onSuccess: () => {
      toast.success('Archivo subido correctamente.')
      setSelectedFile(null)
      setAltText('')
      setOpen(false)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? 'Error al registrar el archivo.')
    },
  })

  async function handleUpload() {
    if (!selectedFile) return
    setIsUploading(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // We need the org ID; fetch it client-side via a minimal API call
      const orgRes = await fetch(`/api/org-id?orgSlug=${orgSlug}`)
      const { organizationId } = await orgRes.json()

      const storagePath = generateStoragePath(organizationId, selectedFile.name)

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(storagePath, selectedFile, { upsert: false })

      if (uploadError) throw new Error(uploadError.message)

      const publicUrl = buildPublicUrl(storagePath)

      execute({
        orgSlug,
        fileName: selectedFile.name,
        fileSizeBytes: selectedFile.size,
        mimeType: selectedFile.type,
        storagePath,
        publicUrl,
        altText: altText || undefined,
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir el archivo.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:w-[440px] md:w-[480px]">
        <SheetHeader>
          <SheetTitle>Subir archivo</SheetTitle>
          <SheetDescription>Sube un archivo a la biblioteca de media.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div>
            <Label htmlFor="file-input">Archivo</Label>
            <div
              className="mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {selectedFile ? (
                <p className="text-sm font-medium">{selectedFile.name}</p>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <p className="text-sm">Haz clic para seleccionar un archivo</p>
                </div>
              )}
            </div>
            <input
              id="file-input"
              ref={fileRef}
              type="file"
              accept="image/*,video/*,application/pdf"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div>
            <Label htmlFor="alt-text">Alt text (opcional)</Label>
            <Input
              id="alt-text"
              placeholder="Descripción de la imagen para accesibilidad"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              disabled={!selectedFile || isUploading}
              onClick={handleUpload}
            >
              {isUploading ? 'Subiendo...' : 'Subir'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
