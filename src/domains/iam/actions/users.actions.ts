'use server'

import { actionClient } from '@/lib/safe-action'
import { requirePermission } from '@/lib/auth'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma/client'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath, revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
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

const approveUserSchema = z.object({
  orgSlug: z.string(),
  memberId: z.string().uuid(),
  role: z.enum(['CLUB_ADMIN', 'CLUB_MANAGER', 'EDITOR', 'VIEWER']),
})

export const createPendingMemberAction = actionClient
  .schema(z.object({}))
  .action(async () => {
    const session = await getSession()
    if (!session) throw new Error('No autenticado.')

    const orgSlug = process.env.DEFAULT_ORG_SLUG
    if (!orgSlug) throw new Error('DEFAULT_ORG_SLUG no configurado.')

    const org = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      select: { id: true },
    })
    if (!org) throw new Error('Organización no encontrada.')

    await prisma.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: org.id, userId: session.userId } },
      create: {
        organizationId: org.id,
        userId: session.userId,
        role: 'VIEWER',
        status: 'PENDING',
      },
      update: {},
    })

    return { success: true }
  })

export const approveUserAction = actionClient
  .schema(approveUserSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'users', 'write')

    const member = await prisma.organizationMember.findFirstOrThrow({
      where: { id: parsedInput.memberId, organizationId: ctx.organizationId },
      select: { userId: true },
    })

    await prisma.organizationMember.update({
      where: { id: parsedInput.memberId, organizationId: ctx.organizationId },
      data: {
        status: 'ACTIVE',
        role: parsedInput.role,
        joinedAt: new Date(),
      },
    })

    revalidateTag('org-membership')
    revalidatePath(`/admin/${parsedInput.orgSlug}/users`)
    return { success: true, userId: member.userId }
  })

export const inviteUserAction = actionClient
  .schema(inviteUserSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'users', 'write')

    const supabase = getSupabaseAdmin()

    const headersList = await headers()
    const host = headersList.get('host') ?? 'localhost:3000'
    const forwardedProto = headersList.get('x-forwarded-proto')
    const protocol = forwardedProto ?? (host.includes('localhost') ? 'http' : 'https')
    const siteUrl = `${protocol}://${host}`

    const org = await prisma.organization.findUniqueOrThrow({
      where: { id: ctx.organizationId },
      select: { name: true },
    })

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email: parsedInput.email,
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=/login/update-password`,
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

    const inviteLink = linkData.properties.action_link

    let emailSent = false
    try {
      await sendEmail({
        to: parsedInput.email,
        subject: `Invitación a ${org.name}`,
        html: inviteUserEmailHtml({
          inviteLink,
          organizationName: org.name,
          role: parsedInput.role,
          firstName: parsedInput.firstName,
        }),
      })
      emailSent = true
    } catch (emailError) {
      console.error('[InviteUser] Error al enviar email via Resend:', emailError)
    }

    revalidatePath(`/admin/${parsedInput.orgSlug}/users`)
    return {
      success: true,
      email: parsedInput.email,
      emailSent,
      inviteLink: emailSent ? undefined : inviteLink,
    }
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
