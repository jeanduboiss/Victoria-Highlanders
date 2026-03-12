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
import { useTranslations } from 'next-intl'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function AdminBreadcrumbs() {
  const pathname = usePathname()
  const t = useTranslations('admin.sidebar')
  const tDashboard = useTranslations('admin.dashboard')

  function labelFor(segment: string) {
    if (UUID_REGEX.test(segment)) return tDashboard('detail')
    return t.has(segment as any) ? t(segment as any) : segment
  }

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
  const visibleCrumbs = crumbs.slice(2)

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap">
        {visibleCrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage className="capitalize">{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href} className="capitalize">{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
