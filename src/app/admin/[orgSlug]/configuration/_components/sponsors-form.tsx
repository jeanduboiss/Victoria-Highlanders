'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { updateSiteConfigAction } from '@/domains/configuration/actions/site-config.actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Trash2, Plus, GripVertical } from 'lucide-react'

interface Sponsor {
  name: string
  logoUrl: string
  websiteUrl?: string
}

interface SponsorsFormProps {
  orgSlug: string
  siteName: string
  initialSponsors: Sponsor[]
}

export function SponsorsForm({ orgSlug, siteName, initialSponsors }: SponsorsFormProps) {
  const [sponsors, setSponsors] = useState<Sponsor[]>(initialSponsors)
  const [newName, setNewName] = useState('')
  const [newLogoUrl, setNewLogoUrl] = useState('')
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('')

  const { execute, isPending } = useAction(updateSiteConfigAction, {
    onSuccess: () => toast.success('Sponsors guardados.'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al guardar.'),
  })

  function addSponsor() {
    if (!newName.trim() || !newLogoUrl.trim()) {
      toast.error('El nombre y la URL del logo son obligatorios.')
      return
    }
    setSponsors((prev) => [...prev, { name: newName.trim(), logoUrl: newLogoUrl.trim(), websiteUrl: newWebsiteUrl.trim() || undefined }])
    setNewName('')
    setNewLogoUrl('')
    setNewWebsiteUrl('')
  }

  function removeSponsor(index: number) {
    setSponsors((prev) => prev.filter((_, i) => i !== index))
  }

  function save() {
    execute({ orgSlug, siteName, sponsorsJson: sponsors })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-3">
        {sponsors.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
            No hay sponsors configurados. Agrega el primero abajo.
          </p>
        )}
        {sponsors.map((s, i) => (
          <div key={i} className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2.5">
            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
            <img
              src={s.logoUrl}
              alt={s.name}
              className="h-7 w-16 object-contain grayscale"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.name}</p>
              <p className="text-xs text-muted-foreground truncate">{s.websiteUrl || '—'}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
              onClick={() => removeSponsor(i)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-md border p-4 space-y-3">
        <p className="text-sm font-medium">Agregar sponsor</p>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Nombre (ej. Nike)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input placeholder="URL del logo" value={newLogoUrl} onChange={(e) => setNewLogoUrl(e.target.value)} />
        </div>
        <Input placeholder="URL del sitio web (opcional)" value={newWebsiteUrl} onChange={(e) => setNewWebsiteUrl(e.target.value)} />
        <Button variant="outline" size="sm" onClick={addSponsor} type="button">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Agregar
        </Button>
      </div>

      <Button onClick={save} disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar sponsors'}
      </Button>
    </div>
  )
}
