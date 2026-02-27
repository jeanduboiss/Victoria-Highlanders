'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GripVertical, Plus, Save } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { updateNavAction, type NavItem } from '@/domains/configuration/actions/nav.actions'
import { toast } from 'sonner'
import type { Page } from '@prisma/client'

interface Props {
  items: NavItem[]
  pages: Page[]
  orgSlug: string
}

function SortableItem({
  item,
  onToggle,
}: {
  item: NavItem
  onToggle: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <Switch
        checked={item.isVisible}
        onCheckedChange={() => onToggle(item.id)}
        className="shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${!item.isVisible ? 'text-muted-foreground line-through' : ''}`}>
          {item.label}
        </p>
        <p className="text-xs text-muted-foreground">{item.href}</p>
      </div>

      <Badge variant="outline" className="text-xs shrink-0">
        {item.type === 'fixed' ? 'Fijo' : 'Página'}
      </Badge>
    </div>
  )
}

export function NavMenuEditor({ items: initialItems, pages, orgSlug }: Props) {
  const [items, setItems] = useState<NavItem[]>(initialItems)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const { execute: saveNav, isPending } = useAction(updateNavAction, {
    onSuccess: () => toast.success('Menú guardado.'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al guardar.'),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id)
        const newIndex = prev.findIndex((i) => i.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  function toggleVisibility(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isVisible: !item.isVisible } : item))
    )
  }

  const itemIds = items.map((i) => i.id)

  const availablePages = pages.filter(
    (p) => p.status === 'PUBLISHED' && !items.some((item) => item.pageId === p.id)
  )

  function addPage(page: Page) {
    const newItem: NavItem = {
      id: `page-${page.id}`,
      type: 'page',
      label: page.title,
      href: `/p/${page.slug}`,
      pageId: page.id,
      isVisible: true,
    }
    setItems((prev) => [...prev, newItem])
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Arrastra para reordenar. Usa el switch para mostrar u ocultar.
          </p>
          <Button size="sm" onClick={() => saveNav({ orgSlug, items })} disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? 'Guardando...' : 'Guardar menú'}
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="relative group">
                  <SortableItem item={item} onToggle={toggleVisibility} />
                  {item.type === 'page' && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-xs text-destructive hover:text-destructive/80 transition-opacity"
                    >
                      quitar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {items.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground border rounded-lg border-dashed">
            No hay items en el menú
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Páginas disponibles</h3>
        <p className="text-xs text-muted-foreground">
          Páginas publicadas que aún no están en el menú
        </p>
        {availablePages.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            Todas las páginas publicadas ya están en el menú
          </p>
        ) : (
          <div className="space-y-2">
            {availablePages.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{page.title}</p>
                  <p className="text-xs text-muted-foreground">/p/{page.slug}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => addPage(page)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
