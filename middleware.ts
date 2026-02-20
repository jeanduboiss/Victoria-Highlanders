/**
 * Next.js Middleware — Route Protection
 * Victoria Highlanders Sports Management Platform
 *
 * Protects /admin/** routes and handles:
 * - Unauthenticated access → /login
 * - /admin (no slug) → /admin/[firstOrg]/dashboard
 * - /admin/[orgSlug]/** → verify session + active membership
 * - VIEWER role → /login?error=insufficient_role
 * - /login (already authenticated) → /admin/[firstOrg]/dashboard
 */

import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create a response that we can mutate (needed for cookie refresh)
  let response = NextResponse.next({ request })

  // Build Supabase client for middleware (reads + writes cookies)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request })
          response.cookies.set({ name, value, ...options })
        },
        remove: (name: string, options: any) => {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    },
  )

  // Refresh session (extends expiry, writes updated cookie)
  const { data: { session } } = await supabase.auth.getSession()

  // -------------------------------------------------------------------------
  // /login — Redirect authenticated users to their org dashboard
  // -------------------------------------------------------------------------
  if (pathname === '/login') {
    if (session) {
      const orgSlug = await resolveFirstOrgSlug(supabase, session.user.id)
      if (orgSlug) {
        return NextResponse.redirect(new URL(`/admin/${orgSlug}`, request.url))
      }
      // User is authenticated but has no org — show login with error
      return NextResponse.redirect(new URL('/login?error=no_organization', request.url))
    }
    return response
  }

  // -------------------------------------------------------------------------
  // /admin (exact, no slug) — Redirect to first org
  // -------------------------------------------------------------------------
  if (pathname === '/admin') {
    if (!session) return NextResponse.redirect(new URL('/login', request.url))

    const orgSlug = await resolveFirstOrgSlug(supabase, session.user.id)
    if (!orgSlug) {
      return NextResponse.redirect(new URL('/login?error=no_organization', request.url))
    }
    return NextResponse.redirect(new URL(`/admin/${orgSlug}`, request.url))
  }

  // -------------------------------------------------------------------------
  // /admin/[orgSlug]/** — Auth + membership check
  // -------------------------------------------------------------------------
  if (pathname.startsWith('/admin/')) {
    // 1. Require authentication
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // 2. Extract orgSlug from path: /admin/[orgSlug]/...
    const segments = pathname.split('/') // ['', 'admin', orgSlug, ...]
    const orgSlug = segments[2]

    if (!orgSlug) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // 3. Verify active membership in the org
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role, status, organizations!inner(slug, is_active)')
      .eq('user_id', session.user.id)
      .eq('status', 'ACTIVE')
      .eq('organizations.slug', orgSlug)
      .eq('organizations.is_active', true)
      .maybeSingle()

    if (!membership) {
      // User has no membership in this org — redirect to their own org
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // 4. Block VIEWER role from admin panel
    if (membership.role === 'VIEWER') {
      return NextResponse.redirect(
        new URL('/login?error=insufficient_role', request.url),
      )
    }

    // 5. Pass org context via headers for RSC (avoids duplicate DB queries)
    response.headers.set('x-org-slug', orgSlug)
    response.headers.set('x-user-id', session.user.id)
    response.headers.set('x-user-role', membership.role)

    return response
  }

  // -------------------------------------------------------------------------
  // All other routes — pass through (public site)
  // -------------------------------------------------------------------------
  return response
}

// ---------------------------------------------------------------------------
// Helper: Resolve the user's first active organization slug
// ---------------------------------------------------------------------------

async function resolveFirstOrgSlug(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('organization_members')
    .select('organizations!inner(slug, is_active)')
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')
    .eq('organizations.is_active', true)
    .order('joined_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const org = (data as any)?.organizations
  return org?.slug ?? null
}

// ---------------------------------------------------------------------------
// Matcher — Only run middleware on relevant paths
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    '/login',
    '/admin',
    '/admin/:path*',
  ],
}
