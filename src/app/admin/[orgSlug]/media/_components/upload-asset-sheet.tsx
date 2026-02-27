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
import { Upload, Link as LinkIcon, AlertCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface UploadAssetSheetProps {
  orgSlug: string
  children: React.ReactNode
}

export function UploadAssetSheet({ orgSlug, children }: UploadAssetSheetProps) {
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [externalUrl, setExternalUrl] = useState('')
  const [activeTab, setActiveTab] = useState('local')
  const [altText, setAltText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

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
    if (activeTab === 'local' && !selectedFile) return
    if (activeTab === 'url' && (!externalUrl || !externalUrl.startsWith('http'))) {
      toast.error('Por favor, ingresa una URL válida que comience con http/https.')
      return
    }

    if (activeTab === 'local' && selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      toast.error('El archivo excede el límite de 5 MB.')
      return
    }

    setIsUploading(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // We need the org ID; fetch it client-side via a minimal API call
      const orgRes = await fetch(`/api/org-id?orgSlug=${orgSlug}`)
      const { organizationId } = await orgRes.json()

      if (activeTab === 'local' && selectedFile) {
        // Upload local file to Supabase
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
          externalUrl: undefined,
          isExternal: false,
          altText: altText || undefined,
        })
      } else if (activeTab === 'url' && externalUrl) {
        // Just register external URL
        const fileName = externalUrl.split('/').pop()?.split('?')[0] || 'imagen_externa'

        execute({
          orgSlug,
          fileName: fileName,
          fileSizeBytes: undefined,
          mimeType: undefined,
          storagePath: undefined,
          publicUrl: externalUrl,
          externalUrl: externalUrl,
          isExternal: true,
          altText: altText || undefined,
        })
      }
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="local">Dispositivo</TabsTrigger>
              <TabsTrigger value="url">Por URL</TabsTrigger>
            </TabsList>

            <TabsContent value="local" className="space-y-4 pt-4">
              <div>
                <Label htmlFor="file-input">Archivo</Label>
                <div
                  className="mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      {selectedFile.size > MAX_FILE_SIZE && (
                        <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> Excede el límite de 5MB
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-8 w-8" />
                      <p className="text-sm">Haz clic para seleccionar un archivo</p>
                      <p className="text-xs text-muted-foreground mt-1">Límite máximo: 5 MB</p>
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
            </TabsContent>

            <TabsContent value="url" className="space-y-4 pt-4">
              <div>
                <Label htmlFor="url-input">URL del recurso (Google Drive / Internet)</Label>
                <div className="flex items-center mt-2 relative">
                  <LinkIcon className="absolute left-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://..."
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Los enlaces externos no ocupan espacio en el servidor pero deben ser accesibles públicamente.
                </p>
              </div>
            </TabsContent>
          </Tabs>

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
              disabled={isUploading || (activeTab === 'local' ? (!selectedFile || selectedFile.size > MAX_FILE_SIZE) : !externalUrl)}
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
