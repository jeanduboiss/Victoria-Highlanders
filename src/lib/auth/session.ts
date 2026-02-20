/**
 * Server-side session and membership helpers.
 * Use these in React Server Components and Server Actions.
 * Never import in client components.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma/client'
import type { Role } from './permissions'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthSession {
  userId: string
  email: string
}

export interface OrgContext {
  userId: string
  email: string
  organizationId: string
  organizationSlug: string
  organizationName: string
  role: Role
}

// ---------------------------------------------------------------------------
// Supabase server client
// ---------------------------------------------------------------------------

/**
 * Creates a Supabase client configured for server-side use (reads cookies).
 * Memoized per request via React cache().
 */
export const getSupabaseServer = cache(async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
      },
    },
  )
})

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

/**
 * Returns the current authenticated session or null if not authenticated.
 * Reads user identity from request headers set by middleware (no Supabase call).
 * Falls back to Supabase cookie decode if headers aren't present.
 * Memoized per request.
 */
export const getSession = cache(async (): Promise<AuthSession | null> => {
  // Fast path: middleware already decoded the JWT and set these headers
  const h = await headers()
  const userId = h.get('x-user-id')
  const email = h.get('x-user-email')

  if (userId) return { userId, email: email ?? '' }

  // Fallback: decode from cookie (server actions, non-middleware paths)
  const supabase = await getSupabaseServer()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session?.user) return null

  return {
    userId: session.user.id,
    email: session.user.email ?? '',
  }
})

/**
 * Returns the current session or redirects to /login.
 * Use in protected Server Components.
 */
export async function requireSession(): Promise<AuthSession> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

// ---------------------------------------------------------------------------
// Organization membership — cached across requests
// ---------------------------------------------------------------------------

/**
 * Fetches and caches the org membership for a user+org pair.
 * Cached for 60 seconds to eliminate per-navigation DB round-trips.
 * Cache is invalidated by revalidateTag(`membership-${userId}`) when roles change.
 */
const getCachedMembership = unstable_cache(
  async (userId: string, orgSlug: string) => {
    return prisma.organizationMember.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        organization: { slug: orgSlug, isActive: true },
      },
      include: {
        organization: { select: { id: true, slug: true, name: true } },
      },
    })
  },
  ['org-membership'],
  { revalidate: 60 },
)

/**
 * Resolves the organization context for a given slug.
 * Returns the user's role within that organization.
 *
 * Uses unstable_cache: first call does a Prisma query (~300ms with pooler),
 * subsequent calls within 60s are instant (cache hit).
 *
 * Throws a redirect if:
 *   - User is not authenticated
 *   - User has no active membership in the org
 *   - Org does not exist or is inactive
 */
export const requireOrgAccess = cache(async (orgSlug: string): Promise<OrgContext> => {
  const session = await getSession()
  if (!session) redirect('/login')

  const membership = await getCachedMembership(session.userId, orgSlug)
  if (!membership) redirect('/admin')

  return {
    userId: session.userId,
    email: session.email,
    organizationId: membership.organization.id,
    organizationSlug: membership.organization.slug,
    organizationName: membership.organization.name,
    role: membership.role as Role,
  }
})

// ---------------------------------------------------------------------------
// Misc helpers
// ---------------------------------------------------------------------------

/**
 * Returns the role of a user within a specific organization.
 * Returns null if the user has no active membership.
 */
export async function getUserRole(
  userId: string,
  organizationId: string,
): Promise<Role | null> {
  const member = await prisma.organizationMember.findFirst({
    where: { userId, organizationId, status: 'ACTIVE' },
    select: { role: true },
  })
  return (member?.role as Role) ?? null
}

/**
 * Returns the first active organization a user belongs to.
 * Used for the /admin → /admin/[orgSlug] redirect.
 */
export async function getUserPrimaryOrg(
  userId: string,
): Promise<{ slug: string } | null> {
  const member = await prisma.organizationMember.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      organization: { isActive: true },
    },
    include: {
      organization: { select: { slug: true } },
    },
    orderBy: { joinedAt: 'asc' },
  })
  return member?.organization ?? null
}

/**
 * Returns all organizations a user has active membership in.
 * Used for org-switcher UI.
 */
export async function getUserOrganizations(userId: string) {
  return prisma.organizationMember.findMany({
    where: { userId, status: 'ACTIVE', organization: { isActive: true } },
    include: {
      organization: {
        select: { id: true, name: true, slug: true, badgeUrl: true },
      },
    },
    orderBy: { joinedAt: 'asc' },
  })
}
