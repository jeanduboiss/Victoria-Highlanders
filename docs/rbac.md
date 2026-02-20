# RBAC — Role-Based Access Control
## Victoria Highlanders — Sports Management Platform

**Version:** 1.0.0
**Date:** 2026-02-19
**Phase:** 3 — RBAC System
**Status:** Approved

---

## 1. Overview

The platform uses a **static RBAC model** — permissions are defined in code (`src/lib/auth/permissions.ts`), not in a database table. This keeps the system simple, fully typed, and auditable. Changing permissions requires a code change and redeployment.

Authorization is enforced at **two layers**:

1. **`middleware.ts`** — Protects all `/admin/**` routes. Runs on the Edge before any React rendering. Blocks unauthenticated users and VIEWER-role users from the admin panel.

2. **Server Action guards** (`src/lib/auth/guards.ts`) — Verify specific module+action permissions before executing business logic. Even if someone bypasses the UI, the server action will throw a `ForbiddenError`.

---

## 2. Roles

| Role | Scope | Description |
|---|---|---|
| `SUPER_ADMIN` | Platform | Full access to all organizations and modules. No tenant restriction. |
| `LEAGUE_ADMIN` | League | Manages competitions and league structure. (Future use) |
| `CLUB_ADMIN` | Organization | Full control of their club. Can manage users, config, sports, editorial. |
| `CLUB_MANAGER` | Organization | Full sports access. Cannot manage users, config, or publish content. |
| `EDITOR` | Organization | Creates/edits news, events, and media. Cannot modify sports data. |
| `VIEWER` | Organization | No admin panel access (currently blocked). Reserved for future use. |

### Role Hierarchy

```
SUPER_ADMIN  →  Unrestricted (bypasses all tenant checks)
    ↓
LEAGUE_ADMIN →  League scope (future)
    ↓
CLUB_ADMIN   →  Full org control
    ↓
CLUB_MANAGER →  Sports write + editorial read
    ↓
EDITOR       →  Editorial write + sports read
    ↓
VIEWER       →  Blocked from admin
```

A user can belong to **multiple organizations** with **different roles** in each.

---

## 3. Permissions Matrix

### Action Levels
- `full` = read + write + delete
- `write` = read + write (no delete)
- `read` = read only
- `—` = no access

| Module | SUPER_ADMIN | CLUB_ADMIN | CLUB_MANAGER | EDITOR | VIEWER |
|---|---|---|---|---|---|
| **Dashboard** | full | read | read | — | — |
| **Teams** | full | full | write | — | — |
| **Players** | full | full | write | read | — |
| **Seasons** | full | full | write | — | — |
| **Matches** | full | full | write | read | — |
| **Match Events** | full | full | write | — | — |
| **Player Stats** | full | full | write | — | — |
| **Staff Members** | full | full | write | — | — |
| **Articles** | full | full | — | write | — |
| **Article Categories** | full | full | — | write | — |
| **Events** | full | full | — | write | — |
| **Tags** | full | full | — | write | — |
| **Media** | full | full | read | write | — |
| **Site Config** | full | full | — | — | — |
| **Users / Members** | full | full | read | — | — |
| **Leagues** | full | — | — | — | — |
| **Competitions** | full | read | — | — | — |

### Special Rules
- **EDITOR** can read sports data (players, matches) to reference them in articles — but cannot modify it
- **CLUB_MANAGER** can see the users list (read) but cannot invite, change roles, or deactivate accounts
- **SUPER_ADMIN** bypasses all tenant isolation — can access any organization's data

---

## 4. Authentication Flow

### Login (Invitation-Only)
1. Club Admin navigates to `/admin/[orgSlug]/settings/users`
2. Enters email + selects role → calls `inviteUserAction`
3. Supabase sends magic link email
4. User clicks link → auto-authenticated → redirected to `/admin/[orgSlug]/dashboard`

### Session Flow
```
User visits /admin/victoria
    │
    ├── No session cookie → redirect /login
    │
    ├── Session found
    │       │
    │       ├── No membership in 'victoria' → redirect /admin (resolves correct org)
    │       │
    │       ├── Role = VIEWER → redirect /login?error=insufficient_role
    │       │
    │       └── Active membership → pass through (set x-org-slug, x-user-role headers)
```

### Middleware Headers
The middleware injects these response headers for RSC to read without additional DB queries:
- `x-org-slug` — the organization slug
- `x-user-id` — the authenticated user ID
- `x-user-role` — the user's role in that org

---

## 5. URL Structure

```
/login                                    ← Public auth page
/admin                                    ← Auto-redirect to /admin/[firstOrg]/dashboard
/admin/[orgSlug]/dashboard                ← KPI overview
/admin/[orgSlug]/sports/teams
/admin/[orgSlug]/sports/players
/admin/[orgSlug]/sports/seasons
/admin/[orgSlug]/sports/matches
/admin/[orgSlug]/editorial/articles
/admin/[orgSlug]/editorial/events
/admin/[orgSlug]/media
/admin/[orgSlug]/configuration
/admin/[orgSlug]/settings/users
```

The `orgSlug` segment:
- Identifies the tenant in every server action and Prisma query
- Verified by middleware on every request
- Enables future multi-tenant support without URL refactoring

---

## 6. Implementation Files

| File | Purpose |
|---|---|
| `src/lib/auth/permissions.ts` | Static permissions matrix + `canPerform()`, `hasMinimumRole()`, `getVisibleNavItems()` |
| `src/lib/auth/session.ts` | `getSession()`, `requireOrgAccess()`, `getUserRole()`, `getUserOrganizations()` |
| `src/lib/auth/guards.ts` | `requirePermission()`, `requireRole()`, `requireAdminAccess()`, `withPermission()` |
| `src/lib/auth/index.ts` | Barrel export for `@/lib/auth` |
| `middleware.ts` | Edge middleware protecting all `/admin/**` routes |

---

## 7. Usage Examples

### In a Server Action (next-safe-action)
```typescript
import { requirePermission } from '@/lib/auth'

export const createPlayerAction = authAction
  .schema(createPlayerSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'players', 'write')
    return playerService.create({ ...parsedInput, organizationId: ctx.organizationId })
  })
```

### In a React Server Component
```typescript
import { requireAdminAccess, withPermission } from '@/lib/auth'

export default async function ConfigPage({ params }: { params: { orgSlug: string } }) {
  const ctx = await requireAdminAccess(params.orgSlug)

  // Only renders if user can read site_config
  const config = await withPermission(params.orgSlug, 'site_config', 'read', (c) =>
    siteConfigService.get(c.organizationId)
  )

  return <ConfigForm config={config} role={ctx.role} />
}
```

### Conditional UI Rendering
```typescript
import { canPerform, getVisibleNavItems } from '@/lib/auth'

// In admin sidebar
const navItems = getVisibleNavItems(ctx.role, params.orgSlug)

// In a page to show/hide delete button
const canDelete = canPerform(ctx.role, 'articles', 'delete')
```

---

## 8. Error Handling

| Scenario | Behavior |
|---|---|
| Not authenticated | `redirect('/login')` |
| Not a member of the org | `redirect('/admin')` |
| VIEWER accessing admin | `redirect('/login?error=insufficient_role')` |
| Insufficient role in server action | Throws `ForbiddenError` (caught by next-safe-action) |
| No organization for user | `redirect('/login?error=no_organization')` |

`ForbiddenError` and `AuthError` are caught by `next-safe-action`'s error handler and returned as structured action results to the client.

---

## 9. Future Considerations

- **LEAGUE_ADMIN**: When leagues are activated, add cross-org read policies and league management routes
- **VIEWER**: Can be enabled with read-only dashboard access when a use case arises
- **Fine-grained permissions**: If needed, the `PERMISSIONS` object can be extended to support per-record ownership (e.g., `own` action for EDITOR to only edit their own articles)
- **Permission audit log**: Add an `audit_logs` table to record who changed what, when (beyond `created_by`/`updated_by` columns)
