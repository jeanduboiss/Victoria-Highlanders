'use server'

import { actionClient } from '@/lib/safe-action'
import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const navItemSchema = z.object({
  id: z.string(),
  type: z.enum(['fixed', 'page']),
  label: z.string(),
  href: z.string(),
  pageId: z.string().optional(),
  isVisible: z.boolean(),
})

const updateNavSchema = z.object({
  orgSlug: z.string(),
  items: z.array(navItemSchema),
})

export type NavItem = z.infer<typeof navItemSchema>

export const updateNavAction = actionClient
  .schema(updateNavSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'site_config', 'write')

    await prisma.siteConfiguration.upsert({
      where: { organizationId: ctx.organizationId },
      create: {
        organizationId: ctx.organizationId,
        siteName: 'Victoria Highlanders FC',
        navJson: parsedInput.items,
      },
      update: {
        navJson: parsedInput.items,
        updatedBy: ctx.userId,
      },
    })

    revalidatePath('/')
    revalidatePath(`/admin/${parsedInput.orgSlug}/site/menu`)
  })
