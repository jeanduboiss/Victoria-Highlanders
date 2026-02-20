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

function labelFor(segment: string) {
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
  const visibleCrumbs = crumbs.slice(1) // remove "admin" prefix segment

  return (
    <Breadcrumb>
      <BreadcrumbList>
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
