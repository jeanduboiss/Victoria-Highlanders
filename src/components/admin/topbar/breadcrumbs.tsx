'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import React from 'react'

const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Admin',
  sports: 'Deportes',
  matches: 'Partidos',
  players: 'Jugadores',
  teams: 'Equipos',
  seasons: 'Temporadas',
  editorial: 'Editorial',
  articles: 'Artículos',
  events: 'Eventos',
  categories: 'Categorías',
  tags: 'Tags',
  media: 'Media',
  users: 'Usuarios',
  configuration: 'Configuración',
  new: 'Nuevo',
  edit: 'Editar',
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function labelFor(segment: string) {
  if (UUID_REGEX.test(segment)) return 'Detalle'
  return SEGMENT_LABELS[segment] ?? segment
}

export function AdminBreadcrumbs() {
  const pathname = usePathname()

  // Split and filter empty segments
  const segments = pathname.split('/').filter(Boolean)

  // Build cumulative paths for each segment
  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = labelFor(segment)
    const isLast = index === segments.length - 1
    return { href, label, isLast }
  })

  // Skip the first two segments (admin + orgSlug) from display if desired
  // Keep admin + orgSlug visible so user knows their org
  // slice(2) removes "admin" + orgSlug — show only content path
  const visibleCrumbs = crumbs.slice(2)

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap overflow-hidden">
        {visibleCrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
