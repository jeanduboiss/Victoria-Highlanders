'use server'

import { actionClient } from '@/lib/safe-action'
import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { z } from 'zod'

const updateSiteConfigSchema = z.object({
  orgSlug: z.string(),
  clubName: z.string().min(1).max(100).optional(),
  clubShortName: z.string().max(10).optional(),
  logoUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  socialLinks: z
    .object({
      twitter: z.string().url().optional(),
      instagram: z.string().url().optional(),
      facebook: z.string().url().optional(),
      youtube: z.string().url().optional(),
      tiktok: z.string().url().optional(),
    })
    .optional(),
  contactEmail: z.string().email().optional(),
  address: z.string().max(300).optional(),
  foundedYear: z.number().int().min(1800).max(2100).optional(),
})

export const updateSiteConfigAction = actionClient
  .schema(updateSiteConfigSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'site_config', 'write')

    const { orgSlug, ...data } = parsedInput

    const config = await prisma.siteConfiguration.upsert({
      where: { organizationId: ctx.organizationId },
      create: { organizationId: ctx.organizationId, ...data },
      update: { ...data, updatedBy: ctx.userId },
    })

    // Revalidate public site so changes are visible immediately
    revalidatePath(`/`)
    revalidatePath(`/${orgSlug}`)
    revalidatePath(`/admin/${orgSlug}/configuration`)

    return config
  })

// Cached query for use in public-facing React Server Components
export const getSiteConfig = cache(async (organizationId: string) => {
  return prisma.siteConfiguration.findUnique({
    where: { organizationId },
  })
})

// Query by orgSlug for use in public pages
export async function getSiteConfigBySlug(orgSlug: string) {
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  })
  if (!org) return null
  return getSiteConfig(org.id)
}
