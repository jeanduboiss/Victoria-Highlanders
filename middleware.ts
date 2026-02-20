/**
 * Next.js Middleware — Route Protection
 * Victoria Highlanders Sports Management Platform
 *
 * Lightweight: only validates JWT session (no DB queries).
 * Membership/role validation is handled by requireOrgAccess in pages/layouts
 * using unstable_cache to avoid per-navigation DB round-trips.
 */

import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Build mutable request headers to forward user context to RSC
  const requestHeaders = new Headers(request.headers)

  // Build Supabase client (reads cookies for session)
  let response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as any),
          )
        },
      },
    },
  )

  // Decode JWT from cookie — no network call, fast (<1ms)
  const { data: { session } } = await supabase.auth.getSession()

  // -------------------------------------------------------------------------
  // /login — Redirect authenticated users to their org dashboard
  // -------------------------------------------------------------------------
  if (pathname === '/login') {
    if (session) {
      const orgSlug = await resolveFirstOrgSlug(supabase, session.user.id)
      if (orgSlug) return NextResponse.redirect(new URL(`/admin/${orgSlug}`, request.url))
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
    if (!orgSlug) return NextResponse.redirect(new URL('/login?error=no_organization', request.url))
    return NextResponse.redirect(new URL(`/admin/${orgSlug}`, request.url))
  }

  // -------------------------------------------------------------------------
  // /admin/[orgSlug]/** — Require authentication only (no DB query)
  // Membership/role is validated by requireOrgAccess in RSC using unstable_cache
  // -------------------------------------------------------------------------
  if (pathname.startsWith('/admin/')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Forward user identity via request headers (available via headers() in RSC)
    requestHeaders.set('x-user-id', session.user.id)
    requestHeaders.set('x-user-email', session.user.email ?? '')

    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  return response
}

// ---------------------------------------------------------------------------
// Helper: Resolve the user's first active organization slug
// Only used for /login and /admin redirects (infrequent)
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
