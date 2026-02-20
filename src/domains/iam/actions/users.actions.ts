'use server'

import { actionClient } from '@/lib/safe-action'
import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

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

// Invite a new user via Supabase Auth magic link; creates OrganizationMember on first login
export const inviteUserAction = actionClient
  .schema(inviteUserSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'users', 'write')

    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(parsedInput.email, {
      data: {
        organizationId: ctx.organizationId,
        role: parsedInput.role,
        firstName: parsedInput.firstName,
        lastName: parsedInput.lastName,
      },
    })

    if (error) throw new Error(`Error al invitar al usuario: ${error.message}`)

    // Create a pending OrganizationMember so admins can see the invitation
    await prisma.organizationMember.create({
      data: {
        organizationId: ctx.organizationId,
        userId: data.user.id,
        role: parsedInput.role,
        status: 'PENDING', // Activated when the user accepts the invitation
        invitedBy: ctx.userId,
      },
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
