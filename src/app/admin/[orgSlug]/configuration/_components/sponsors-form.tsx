'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { updateSiteConfigAction } from '@/domains/configuration/actions/site-config.actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Trash2, Plus, ArrowUp, ArrowDown, Pencil } from 'lucide-react'

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
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const { execute, isPending } = useAction(updateSiteConfigAction, {
    onSuccess: () => toast.success('Sponsors guardados.'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al guardar.'),
  })

  function addOrUpdateSponsor() {
    if (!newName.trim() || !newLogoUrl.trim()) {
      toast.error('El nombre y la URL del logo son obligatorios.')
      return
    }

    const newSponsor = {
      name: newName.trim(),
      logoUrl: newLogoUrl.trim(),
      websiteUrl: newWebsiteUrl.trim() || undefined
    }

    if (editingIndex !== null) {
      setSponsors((prev) => {
        const copy = [...prev]
        copy[editingIndex] = newSponsor
        return copy
      })
      setEditingIndex(null)
    } else {
      setSponsors((prev) => [...prev, newSponsor])
    }

    setNewName('')
    setNewLogoUrl('')
    setNewWebsiteUrl('')
  }

  function removeSponsor(index: number) {
    if (editingIndex === index) {
      setEditingIndex(null)
      setNewName('')
      setNewLogoUrl('')
      setNewWebsiteUrl('')
    }
    setSponsors((prev) => prev.filter((_, i) => i !== index))
  }

  function editSponsor(index: number) {
    const s = sponsors[index]
    setNewName(s.name)
    setNewLogoUrl(s.logoUrl)
    setNewWebsiteUrl(s.websiteUrl ?? '')
    setEditingIndex(index)
  }

  function moveSponsor(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === sponsors.length - 1) return

    setSponsors((prev) => {
      const copy = [...prev]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      const temp = copy[index]
      copy[index] = copy[targetIndex]
      copy[targetIndex] = temp
      return copy
    })
  }

  function cancelEdit() {
    setEditingIndex(null)
    setNewName('')
    setNewLogoUrl('')
    setNewWebsiteUrl('')
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
          <div key={i} className={`flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors ${editingIndex === i ? 'bg-primary/10 border-primary/30' : 'bg-muted/30'}`}>
            <div className="flex flex-col gap-0.5 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-muted"
                disabled={i === 0 || editingIndex !== null}
                onClick={() => moveSponsor(i, 'up')}
              >
                <ArrowUp className="h-3 w-3 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-muted"
                disabled={i === sponsors.length - 1 || editingIndex !== null}
                onClick={() => moveSponsor(i, 'down')}
              >
                <ArrowDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>

            <img
              src={s.logoUrl}
              alt={s.name}
              className="h-8 w-16 object-contain grayscale opacity-80"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.name}</p>
              <p className="text-xs text-muted-foreground truncate">{s.websiteUrl || 'Sin enlace web'}</p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => editSponsor(i)}
                disabled={editingIndex === i}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => removeSponsor(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className={`rounded-md border p-4 space-y-3 transition-colors ${editingIndex !== null ? 'border-primary/50 bg-primary/5' : ''}`}>
        <p className="text-sm font-medium">{editingIndex !== null ? 'Editar sponsor' : 'Agregar sponsor'}</p>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Nombre (ej. Nike)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input placeholder="URL del logo" value={newLogoUrl} onChange={(e) => setNewLogoUrl(e.target.value)} />
        </div>
        <Input placeholder="URL del sitio web (opcional)" value={newWebsiteUrl} onChange={(e) => setNewWebsiteUrl(e.target.value)} />

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addOrUpdateSponsor} type="button" className={editingIndex !== null ? 'border-primary/50 text-primary' : ''}>
            {editingIndex !== null ? 'Guardar Cambios' : <><Plus className="h-3.5 w-3.5 mr-1.5" /> Agregar</>}
          </Button>
          {editingIndex !== null && (
            <Button variant="ghost" size="sm" onClick={cancelEdit} type="button">
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <Button onClick={save} disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar sponsors'}
      </Button>
    </div>
  )
}
