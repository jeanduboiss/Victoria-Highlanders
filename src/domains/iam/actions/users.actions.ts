'use server'

import { actionClient } from '@/lib/safe-action'
import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { sendEmail } from '@/lib/email/resend'
import { inviteUserEmailHtml } from '@/lib/email/templates/invite-user'

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => { } } }
  )
}

const inviteUserSchema = z.object({
  orgSlug: z.string(),
  email: z.string().email(),
  role: z.enum(['CLUB_ADMIN', 'CLUB_MANAGER', 'EDITOR', 'VIEWER']),
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
})

const updateMemberRoleSchema = z.object({
  orgSlug: z.string(),
  memberId: z.string().uuid(),
  role: z.enum(['CLUB_ADMIN', 'CLUB_MANAGER', 'EDITOR', 'VIEWER']),
})

const deactivateMemberSchema = z.object({
  orgSlug: z.string(),
  memberId: z.string().uuid(),
})

export const inviteUserAction = actionClient
  .schema(inviteUserSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'users', 'write')

    const supabase = getSupabaseAdmin()

    const org = await prisma.organization.findUniqueOrThrow({
      where: { id: ctx.organizationId },
      select: { name: true },
    })

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email: parsedInput.email,
      options: {
        data: {
          organizationId: ctx.organizationId,
          role: parsedInput.role,
          firstName: parsedInput.firstName,
          lastName: parsedInput.lastName,
        },
      },
    })

    if (linkError) throw new Error(`Error al generar el enlace de invitación: ${linkError.message}`)

    await prisma.organizationMember.create({
      data: {
        organizationId: ctx.organizationId,
        userId: linkData.user.id,
        role: parsedInput.role,
        status: 'PENDING',
        invitedBy: ctx.userId,
      },
    })

    await sendEmail({
      to: parsedInput.email,
      subject: `Invitación a ${org.name}`,
      html: inviteUserEmailHtml({
        inviteLink: linkData.properties.action_link,
        organizationName: org.name,
        role: parsedInput.role,
        firstName: parsedInput.firstName,
      }),
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/users`)
    return { success: true, email: parsedInput.email }
  })

export const updateMemberRoleAction = actionClient
  .schema(updateMemberRoleSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'users', 'write')

    // Prevent self-demotion
    const member = await prisma.organizationMember.findFirstOrThrow({
      where: { id: parsedInput.memberId, organizationId: ctx.organizationId },
      select: { userId: true },
    })

    if (member.userId === ctx.userId)
      throw new Error('No puedes cambiar tu propio rol.')

    const updated = await prisma.organizationMember.update({
      where: { id: parsedInput.memberId, organizationId: ctx.organizationId },
      data: { role: parsedInput.role },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/users`)
    return updated
  })

export const deactivateMemberAction = actionClient
  .schema(deactivateMemberSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'users', 'write')

    // Prevent self-deactivation
    const member = await prisma.organizationMember.findFirstOrThrow({
      where: { id: parsedInput.memberId, organizationId: ctx.organizationId },
      select: { userId: true },
    })

    if (member.userId === ctx.userId)
      throw new Error('No puedes desactivarte a ti mismo.')

    const updated = await prisma.organizationMember.update({
      where: { id: parsedInput.memberId, organizationId: ctx.organizationId },
      data: { status: 'INACTIVE' },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/users`)
    return updated
  })
