/**
 * Supabase Auth callback handler.
 * Exchanges the OTP code for a session and redirects to the admin dashboard.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  if (!code)
    return NextResponse.redirect(`${origin}/login?error=missing_code`)

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: any }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)

  // Activate the OrganizationMember if this is the first login after invitation
  await prisma.organizationMember.updateMany({
    where: { userId: data.user.id, status: 'PENDING' },
    data: { status: 'ACTIVE', joinedAt: new Date() },
  })

  // Resolve the user's primary org to redirect to the correct dashboard
  const member = await prisma.organizationMember.findFirst({
    where: { userId: data.user.id, status: 'ACTIVE' },
    include: { organization: { select: { slug: true } } },
    orderBy: { createdAt: 'asc' },
  })

  const redirectTo = member
    ? `${origin}/admin/${member.organization.slug}`
    : `${origin}${next}`

  return NextResponse.redirect(redirectTo)
}
