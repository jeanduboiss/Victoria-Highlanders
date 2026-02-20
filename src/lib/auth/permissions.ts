/**
 * RBAC — Static Permissions Matrix
 * Victoria Highlanders Sports Management Platform
 *
 * Permissions are defined statically in code (no DB table).
 * To change permissions, update this file and redeploy.
 *
 * Modules map to UI sections and server action groups.
 * Actions are read | write | delete.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Role =
  | 'SUPER_ADMIN'
  | 'LEAGUE_ADMIN'
  | 'CLUB_ADMIN'
  | 'CLUB_MANAGER'
  | 'EDITOR'
  | 'VIEWER'

export type Module =
  // Sports
  | 'dashboard'
  | 'teams'
  | 'players'
  | 'seasons'
  | 'matches'
  | 'match_events'
  | 'player_stats'
  | 'staff'
  // Editorial
  | 'articles'
  | 'categories'
  | 'events'
  | 'tags'
  | 'media'
  // Admin
  | 'site_config'
  | 'users'
  // Platform (future)
  | 'leagues'
  | 'competitions'

export type Action = 'read' | 'write' | 'delete'

// Full access shorthand
const FULL: Action[] = ['read', 'write', 'delete']
const WRITE: Action[] = ['read', 'write']
const READ: Action[] = ['read']

// ---------------------------------------------------------------------------
// Permissions Matrix
// ---------------------------------------------------------------------------

/**
 * Defines which actions each role can perform on each module.
 * Omitting a module means no access.
 */
const PERMISSIONS: Record<Role, Partial<Record<Module, Action[]>>> = {
  // -------------------------------------------------------------------------
  // SUPER_ADMIN — Unrestricted access to everything across all tenants
  // -------------------------------------------------------------------------
  SUPER_ADMIN: {
    dashboard:    FULL,
    teams:        FULL,
    players:      FULL,
    seasons:      FULL,
    matches:      FULL,
    match_events: FULL,
    player_stats: FULL,
    staff:        FULL,
    articles:     FULL,
    categories:   FULL,
    events:       FULL,
    tags:         FULL,
    media:        FULL,
    site_config:  FULL,
    users:        FULL,
    leagues:      FULL,
    competitions: FULL,
  },

  // -------------------------------------------------------------------------
  // LEAGUE_ADMIN — League-level administration (future use)
  // -------------------------------------------------------------------------
  LEAGUE_ADMIN: {
    dashboard:    READ,
    leagues:      FULL,
    competitions: FULL,
  },

  // -------------------------------------------------------------------------
  // CLUB_ADMIN — Full control over their organization
  // -------------------------------------------------------------------------
  CLUB_ADMIN: {
    dashboard:    READ,
    // Sports — full
    teams:        FULL,
    players:      FULL,
    seasons:      FULL,
    matches:      FULL,
    match_events: FULL,
    player_stats: FULL,
    staff:        FULL,
    // Editorial — full
    articles:     FULL,
    categories:   FULL,
    events:       FULL,
    tags:         FULL,
    media:        FULL,
    // Admin — full
    site_config:  FULL,
    users:        FULL,
    // Platform — read only
    competitions: READ,
  },

  // -------------------------------------------------------------------------
  // CLUB_MANAGER — Full sports access, NO editorial/config/users
  // -------------------------------------------------------------------------
  CLUB_MANAGER: {
    dashboard:    READ,
    // Sports — write (no delete)
    teams:        WRITE,
    players:      WRITE,
    seasons:      WRITE,
    matches:      WRITE,
    match_events: WRITE,
    player_stats: WRITE,
    staff:        WRITE,
    // Editorial — NO access (managers don't publish content)
    // Media — read only (to attach photos to player profiles)
    media:        READ,
    // Users — read only (can see team members but not manage them)
    users:        READ,
  },

  // -------------------------------------------------------------------------
  // EDITOR — Full editorial + media access, NO sports write, NO config
  // -------------------------------------------------------------------------
  EDITOR: {
    dashboard:    READ,
    // Sports — read only (to reference players/matches in articles)
    teams:        READ,
    players:      READ,
    seasons:      READ,
    matches:      READ,
    // Editorial — write (no delete)
    articles:     WRITE,
    categories:   WRITE,
    events:       WRITE,
    tags:         WRITE,
    media:        WRITE,
  },

  // -------------------------------------------------------------------------
  // VIEWER — No admin panel access (blocked at middleware level)
  // -------------------------------------------------------------------------
  VIEWER: {},
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check if a role has permission to perform an action on a module.
 *
 * @example
 * canPerform('EDITOR', 'articles', 'write')   // true
 * canPerform('EDITOR', 'players', 'write')    // false
 * canPerform('EDITOR', 'players', 'read')     // true
 * canPerform('VIEWER', 'dashboard', 'read')   // false
 */
export function canPerform(role: Role, module: Module, action: Action): boolean {
  const modulePerms = PERMISSIONS[role]?.[module]
  if (!modulePerms) return false
  return modulePerms.includes(action)
}

/**
 * Returns all modules a role has access to (any action).
 */
export function getAccessibleModules(role: Role): Module[] {
  return Object.keys(PERMISSIONS[role] ?? {}) as Module[]
}

/**
 * Returns all actions a role can perform on a specific module.
 */
export function getAllowedActions(role: Role, module: Module): Action[] {
  return PERMISSIONS[role]?.[module] ?? []
}

/**
 * Role hierarchy order (higher index = more privileged within club scope).
 * Used for "at least this role" comparisons.
 */
const ROLE_HIERARCHY: Role[] = [
  'VIEWER',
  'EDITOR',
  'CLUB_MANAGER',
  'CLUB_ADMIN',
  'LEAGUE_ADMIN',
  'SUPER_ADMIN',
]

/**
 * Returns true if `role` is at least as privileged as `minimumRole`.
 * SUPER_ADMIN always returns true.
 *
 * @example
 * hasMinimumRole('CLUB_ADMIN', 'CLUB_MANAGER') // true
 * hasMinimumRole('EDITOR', 'CLUB_MANAGER')     // false
 */
export function hasMinimumRole(role: Role, minimumRole: Role): boolean {
  if (role === 'SUPER_ADMIN') return true
  const roleIndex = ROLE_HIERARCHY.indexOf(role)
  const minimumIndex = ROLE_HIERARCHY.indexOf(minimumRole)
  if (roleIndex === -1 || minimumIndex === -1) return false
  return roleIndex >= minimumIndex
}

/**
 * Returns true if the role has any access to the admin panel.
 * VIEWER is explicitly excluded.
 */
export function canAccessAdmin(role: Role): boolean {
  return role !== 'VIEWER'
}

/**
 * Returns the sidebar navigation items visible to a given role.
 * Used to render conditional sidebar links.
 */
export interface NavItem {
  label: string
  href: string
  module: Module
}

export function getVisibleNavItems(role: Role, orgSlug: string): NavItem[] {
  const base = `/admin/${orgSlug}`

  const allItems: NavItem[] = [
    { label: 'Dashboard',    href: `${base}/dashboard`,              module: 'dashboard'    },
    { label: 'Teams',        href: `${base}/sports/teams`,           module: 'teams'        },
    { label: 'Players',      href: `${base}/sports/players`,         module: 'players'      },
    { label: 'Seasons',      href: `${base}/sports/seasons`,         module: 'seasons'      },
    { label: 'Matches',      href: `${base}/sports/matches`,         module: 'matches'      },
    { label: 'Articles',     href: `${base}/editorial/articles`,     module: 'articles'     },
    { label: 'Events',       href: `${base}/editorial/events`,       module: 'events'       },
    { label: 'Media',        href: `${base}/media`,                  module: 'media'        },
    { label: 'Configuration',href: `${base}/configuration`,          module: 'site_config'  },
    { label: 'Users',        href: `${base}/settings/users`,         module: 'users'        },
  ]

  return allItems.filter(item => canPerform(role, item.module, 'read'))
}
