'use server'

import { actionClient } from '@/lib/safe-action'
import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { z } from 'zod'

const updateSiteConfigSchema = z.object({
  orgSlug: z.string(),
  siteName: z.string().min(1).max(100),
  tagline: z.string().max(200).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  seoDefaultTitle: z.string().max(60).optional(),
  seoDefaultDescription: z.string().max(160).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().max(20).optional(),
  address: z.string().max(300).optional(),
  socialTwitter: z.string().url().optional().or(z.literal('')),
  socialInstagram: z.string().url().optional().or(z.literal('')),
  socialFacebook: z.string().url().optional().or(z.literal('')),
  socialYoutube: z.string().url().optional().or(z.literal('')),
  socialTiktok: z.string().url().optional().or(z.literal('')),
  socialLinkedin: z.string().url().optional().or(z.literal('')),
  heroTitle: z.string().max(120).optional(),
  heroSubtitle: z.string().max(400).optional(),
  heroImageUrl: z.string().url().optional().or(z.literal('')),
  featuredArticleId: z.string().uuid().optional().or(z.literal('')),
  featuredMatchId: z.string().uuid().optional().or(z.literal('')),
  sponsorsJson: z.any().optional(),
  hideResults: z.boolean().optional(),
  hideStandings: z.boolean().optional(),
})

export const updateSiteConfigAction = actionClient
  .schema(updateSiteConfigSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'site_config', 'write')

    const { orgSlug, featuredArticleId, featuredMatchId, ...rest } = parsedInput

    const config = await prisma.siteConfiguration.upsert({
      where: { organizationId: ctx.organizationId },
      create: {
        organizationId: ctx.organizationId,
        ...rest,
        featuredArticleId: featuredArticleId || null,
        featuredMatchId: featuredMatchId || null,
      },
      update: {
        ...rest,
        featuredArticleId: featuredArticleId || null,
        featuredMatchId: featuredMatchId || null,
        updatedBy: ctx.userId,
      },
    })

    revalidatePath(`/`)
    revalidatePath(`/${orgSlug}`)
    revalidatePath(`/admin/${orgSlug}/configuration`)

    return config
  })

export const getSiteConfig = cache(async (organizationId: string) => {
  return prisma.siteConfiguration.findUnique({
    where: { organizationId },
    include: {
      featuredArticle: {
        select: { id: true, title: true, slug: true, excerpt: true, coverImageUrl: true },
      },
      featuredMatch: {
        select: {
          id: true,
          matchDate: true,
          homeTeam: { select: { name: true, shortName: true } },
          awayTeam: { select: { name: true, shortName: true } },
        },
      },
    },
  })
})

export async function getSiteConfigBySlug(orgSlug: string) {
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  })
  if (!org) return null
  return getSiteConfig(org.id)
}
