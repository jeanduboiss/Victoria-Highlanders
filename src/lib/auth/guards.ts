/**
 * Authorization guards for Server Actions and React Server Components.
 *
 * Usage pattern in a server action:
 *   const ctx = await requirePermission(orgSlug, 'players', 'write')
 *   // ctx.userId, ctx.organizationId, ctx.role are available
 *
 * All guards throw user-friendly errors or redirect on failure.
 * Never use these in client components.
 */

import { redirect } from 'next/navigation'
import { requireOrgAccess, requireSession } from './session'
import { canPerform, canAccessAdmin, hasMinimumRole } from './permissions'
import type { Module, Action, Role } from './permissions'
import type { OrgContext } from './session'

// ---------------------------------------------------------------------------
// Auth errors (thrown by server actions, caught by next-safe-action)
// ---------------------------------------------------------------------------

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

/**
 * Verifies the user has an active session.
 * Redirects to /login if not authenticated.
 *
 * Use this in RSC layouts that don't need org context.
 */
export async function requireAuth() {
  return requireSession()
}

/**
 * Verifies the user is authenticated and has an active membership
 * in the given organization. Returns full org context.
 *
 * Redirects to /login if not authenticated.
 * Redirects to /admin if not a member of the org.
 */
export async function requireOrgMember(orgSlug: string): Promise<OrgContext> {
  return requireOrgAccess(orgSlug)
}

/**
 * Verifies the user has at least the specified minimum role
 * within the given organization.
 *
 * @throws ForbiddenError if the role is insufficient
 *
 * @example
 * const ctx = await requireRole('victoria', 'CLUB_ADMIN')
 */
export async function requireRole(
  orgSlug: string,
  minimumRole: Role,
): Promise<OrgContext> {
  const ctx = await requireOrgAccess(orgSlug)

  if (!hasMinimumRole(ctx.role, minimumRole)) {
    throw new ForbiddenError(
      `This action requires the ${minimumRole} role or higher. Your current role is ${ctx.role}.`,
    )
  }

  return ctx
}

/**
 * Verifies the user can perform a specific action on a module
 * within the given organization.
 *
 * @throws ForbiddenError if the user lacks permission
 *
 * @example
 * const ctx = await requirePermission('victoria', 'players', 'write')
 * const ctx = await requirePermission('victoria', 'articles', 'delete')
 */
export async function requirePermission(
  orgSlug: string,
  module: Module,
  action: Action,
): Promise<OrgContext> {
  const ctx = await requireOrgAccess(orgSlug)

  if (!canPerform(ctx.role, module, action)) {
    const actionLabel = action === 'delete' ? 'delete' : action === 'write' ? 'create or edit' : 'view'
    throw new ForbiddenError(
      `You do not have permission to ${actionLabel} ${module.replace('_', ' ')}. Contact your administrator.`,
    )
  }

  return ctx
}

/**
 * Verifies admin panel access.
 * VIEWER role is blocked from the admin entirely.
 *
 * Redirects to /login?error=insufficient_role if the user is a VIEWER.
 * Use this in the /admin/[orgSlug] layout.
 */
export async function requireAdminAccess(orgSlug: string): Promise<OrgContext> {
  const ctx = await requireOrgAccess(orgSlug)

  if (!canAccessAdmin(ctx.role)) {
    redirect('/login?error=insufficient_role')
  }

  return ctx
}

/**
 * Guard specifically for CLUB_ADMIN operations (user management, site config, etc.)
 *
 * @throws ForbiddenError if user is not CLUB_ADMIN or SUPER_ADMIN
 */
export async function requireClubAdmin(orgSlug: string): Promise<OrgContext> {
  return requireRole(orgSlug, 'CLUB_ADMIN')
}

/**
 * Guard for sports data writes (CLUB_MANAGER or higher).
 *
 * @throws ForbiddenError if user is EDITOR or VIEWER
 */
export async function requireSportsAccess(orgSlug: string): Promise<OrgContext> {
  return requireRole(orgSlug, 'CLUB_MANAGER')
}

/**
 * Guard for editorial writes (EDITOR or higher).
 *
 * @throws ForbiddenError if user is VIEWER
 */
export async function requireEditorialAccess(orgSlug: string): Promise<OrgContext> {
  return requirePermission(orgSlug, 'articles', 'write')
}

// ---------------------------------------------------------------------------
// RSC helper: permission-aware data fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps a data fetching function with permission check.
 * Returns null instead of throwing if user lacks read access.
 * Use in RSC to conditionally render sections based on role.
 *
 * @example
 * const data = await withPermission(orgSlug, 'site_config', 'read', () =>
 *   siteConfigService.get(organizationId)
 * )
 */
export async function withPermission<T>(
  orgSlug: string,
  module: Module,
  action: Action,
  fn: (ctx: OrgContext) => Promise<T>,
): Promise<T | null> {
  const ctx = await requireOrgAccess(orgSlug)
  if (!canPerform(ctx.role, module, action)) return null
  return fn(ctx)
}
