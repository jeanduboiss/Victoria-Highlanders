# Database Design
## Victoria Highlanders — Sports Management Platform

**Version:** 1.0.0
**Date:** 2026-02-19
**Phase:** 2 — Database Design
**Status:** Approved

---

## 1. Overview

The database is hosted on **Supabase (PostgreSQL)**. The schema is managed via **Prisma ORM** (`prisma/schema.prisma`) and deployed through Supabase migrations.

### Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Primary keys | UUID v4 | Native to Supabase auth.users; compatible with RLS and all Supabase functions |
| Rich text format | TipTap / ProseMirror JSON → `Json` type | Enables structured rich content editing with block-level control |
| Multi-tenancy | `organization_id` on all domain tables + RLS | Supabase RLS enforces tenant isolation at the database layer |
| Historical integrity | `is_locked` flag + DB trigger + Prisma middleware | Three-layer protection for archived season records |
| Player nationalities | Separate `player_nationalities` table | Supports multiple passports with `is_primary` flag for quota tracking |
| Player stats granularity | Basic stats only | Appropriate for semi-professional level; extensible later |
| Article content | TipTap JSON in `Json` column | Avoids HTML sanitization risks; clean rendering with TipTap viewer |
| Media galleries | Virtual folders only (no Gallery entity) | Simpler; folders provide sufficient organization |
| Tags | Shared `tags` table for articles and events | Allows cross-content tagging with a single tag pool per organization |
| Audit trail | Only critical tables | Article, Player, Match, SiteConfiguration, OrganizationMember have `created_by`/`updated_by` |
| Soft deletes | `is_active` / `is_archived` flags | Prevents data loss; enforced at service layer |

---

## 2. Table Inventory

### IAM (Identity & Access Management)

| Table | Rows (est.) | Notes |
|---|---|---|
| `users` | Low (staff only) | Extends Supabase `auth.users`. ID matches `auth.users(id)`. |
| `organization_members` | Low | Junction user↔org↔role. One user can have multiple memberships. |

### Organization Management

| Table | Notes |
|---|---|
| `leagues` | Future use. Groups multiple clubs. |
| `organizations` | Primary tenant entity. One per club. |
| `venues` | Physical locations for matches and events. |

### Sports Management (Core Domain)

| Table | Notes |
|---|---|
| `teams` | Multiple per organization. Categories: FIRST_TEAM, RESERVE, U23…FUTSAL. |
| `seasons` | Historical integrity unit. Only one `is_current = true` per org. |
| `players` | Organization pool. Not directly linked to a team. |
| `player_nationalities` | Multiple nationalities per player with primary flag. |
| `player_season_records` | **Critical.** Player↔team↔season membership. Immutable when `is_locked = true`. |
| `player_stats_seasons` | 1:1 with `player_season_records`. Accumulated stats. |
| `staff_members` | Technical staff linked to org and optionally to a team. |
| `matches` | Match scheduling and results. Always linked to a season. |
| `match_events` | Goal, card, substitution events per match. |
| `competitions` | Future multi-league use. Owned by a League. |
| `competition_participants` | Junction org/team↔competition. |

### Editorial (CMS)

| Table | Notes |
|---|---|
| `tags` | Free-form labels shared across articles and events. |
| `articles` | News articles with TipTap JSON content. Full status workflow. |
| `article_categories` | Structured categories for articles. |
| `article_tags` | Junction article↔tag (N:M). |
| `events` | Club events with type, status, and optional venue. |
| `event_tags` | Junction event↔tag (N:M). |

### Media Management

| Table | Notes |
|---|---|
| `media_assets` | Digital files uploaded to Supabase Storage. `storage_path` is globally unique. |
| `media_folders` | Virtual folders with nested subfolder support (self-reference). |
| `media_folder_assets` | Junction asset↔folder (N:M). |

### Site Configuration

| Table | Notes |
|---|---|
| `site_configurations` | 1:1 with Organization. Drives public site appearance. |

---

## 3. Critical Table Schemas

### `player_season_records` — Historical Integrity Pivot

This is the most critical table in the system. It records the exact membership of a player in a team during a specific season. It must never be modified or deleted once the season is archived.

```
player_id          → players.id
team_id            → teams.id
season_id          → seasons.id
jersey_number      Player's number during this period
transfer_in_date   When the player joined this team
transfer_out_date  When the player left (null = still active here)
is_current         True for the active record per player per season
status             ACTIVE | LOANED | SUSPENDED | INJURED | TRANSFERRED
contract_type      PROFESSIONAL | AMATEUR | YOUTH
is_locked          Set to true when season.is_archived = true
```

**Transfer flow within a season:**
1. Set `transfer_out_date` and `is_current = false` on existing record
2. Create new record with `transfer_in_date` for the new team
3. Create new `player_stats_seasons` linked to the new record

### `player_stats_seasons` — Accumulated Stats

Aggregated after each match finalization (manual entry). Linked 1:1 to `player_season_records`.

| Field | Type | Notes |
|---|---|---|
| matches_played | Int | Total appearances |
| matches_started | Int | Starting XI appearances |
| minutes_played | Int | Total minutes on pitch |
| goals | Int | Scored (excludes own goals) |
| assists | Int | Recorded assists |
| yellow_cards | Int | Bookings |
| red_cards | Int | Dismissals (includes double yellow) |
| clean_sheets | Int | GK only: matches without conceding |
| goals_conceded | Int | GK only |
| saves | Int | GK only |

### `articles` — TipTap Content

The `content` column stores the full TipTap/ProseMirror document as JSON:

```json
{
  "type": "doc",
  "content": [
    { "type": "paragraph", "content": [{ "type": "text", "text": "..." }] },
    { "type": "heading", "attrs": { "level": 2 }, "content": [...] }
  ]
}
```

**Article status transitions (enforced at service layer):**
```
DRAFT → PUBLISHED     (publishArticle)
DRAFT → SCHEDULED     (scheduleArticle)
SCHEDULED → PUBLISHED (automatic via cron or webhook)
PUBLISHED → ARCHIVED  (archiveArticle)
ARCHIVED → DRAFT      ❌ Not allowed
```

---

## 4. Indexes

### Critical Indexes by Table

```sql
-- organization_members: tenant + user lookup
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);

-- seasons: find current season per org
CREATE INDEX idx_seasons_org_current ON seasons(organization_id, is_current);

-- players: org pool + active filter
CREATE INDEX idx_players_org ON players(organization_id);
CREATE INDEX idx_players_org_active ON players(organization_id, is_active);

-- player_season_records: history lookups
CREATE INDEX idx_psr_player ON player_season_records(player_id);
CREATE INDEX idx_psr_team_season ON player_season_records(team_id, season_id);
CREATE INDEX idx_psr_season ON player_season_records(season_id);

-- player_stats_seasons: stats queries
CREATE INDEX idx_pss_player_season ON player_stats_seasons(player_id, season_id);
CREATE INDEX idx_pss_team_season ON player_stats_seasons(team_id, season_id);

-- matches: schedule and history queries
CREATE INDEX idx_matches_org_season ON matches(organization_id, season_id);
CREATE INDEX idx_matches_org_date ON matches(organization_id, match_date);
CREATE INDEX idx_matches_home ON matches(home_team_id);
CREATE INDEX idx_matches_away ON matches(away_team_id);

-- match_events: per-match and per-player lookups
CREATE INDEX idx_match_events_match ON match_events(match_id);
CREATE INDEX idx_match_events_player ON match_events(player_id);

-- articles: public site queries
CREATE INDEX idx_articles_org_status ON articles(organization_id, status);
CREATE INDEX idx_articles_org_published ON articles(organization_id, published_at);

-- events: calendar queries
CREATE INDEX idx_events_org_status ON events(organization_id, status);
CREATE INDEX idx_events_org_date ON events(organization_id, start_datetime);

-- media: library browsing
CREATE INDEX idx_media_org ON media_assets(organization_id);
CREATE INDEX idx_media_org_archived ON media_assets(organization_id, is_archived);
CREATE INDEX idx_media_folders_parent ON media_folders(organization_id, parent_id);
```

---

## 5. Historical Integrity — 3-Layer Protection

### Layer 1: PostgreSQL Trigger (see `supabase/migrations/003_triggers.sql`)

```sql
CREATE OR REPLACE FUNCTION prevent_locked_record_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_locked = true THEN
    RAISE EXCEPTION
      'Cannot modify record %. Season has been archived.',
      OLD.id
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to both critical tables
CREATE TRIGGER lock_player_season_records
  BEFORE UPDATE OR DELETE ON player_season_records
  FOR EACH ROW EXECUTE FUNCTION prevent_locked_record_mutation();

CREATE TRIGGER lock_player_stats_seasons
  BEFORE UPDATE OR DELETE ON player_stats_seasons
  FOR EACH ROW EXECUTE FUNCTION prevent_locked_record_mutation();
```

### Layer 2: Prisma Middleware (implemented in Phase 6)

```typescript
// src/lib/prisma/middleware/historical-integrity.ts
prisma.$use(async (params, next) => {
  const lockedModels = ['PlayerSeasonRecord', 'PlayerStatsSeason']
  const mutationOps = ['update', 'updateMany', 'delete', 'deleteMany']

  if (lockedModels.includes(params.model) && mutationOps.includes(params.action)) {
    // Verify isLocked before mutation
    // Throw UserFriendlyError if locked
  }
  return next(params)
})
```

### Layer 3: Service Layer Validation (implemented in Phase 6)

Services in `src/domains/sports/` verify `season.isArchived` before any mutation and return user-friendly error messages.

---

## 6. Row-Level Security (RLS) Summary

See `supabase/migrations/002_rls_policies.sql` for full SQL.

### Policy Pattern (per tenant-scoped table)

```sql
-- Read: users can read data from their organizations
CREATE POLICY "tenant_read" ON articles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND status = 'ACTIVE'
    )
  );

-- Write: users with appropriate roles can mutate
CREATE POLICY "editor_write" ON articles
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
        AND status = 'ACTIVE'
        AND role IN ('CLUB_ADMIN', 'CLUB_MANAGER', 'EDITOR')
    )
  );
```

### Tables and Access Levels

| Table | Public Read | Auth Read | Write Roles |
|---|---|---|---|
| `organizations` | ✗ | VIEWER+ | CLUB_ADMIN |
| `teams` | ✗ | VIEWER+ | CLUB_ADMIN, CLUB_MANAGER |
| `players` | ✗ | VIEWER+ | CLUB_ADMIN, CLUB_MANAGER |
| `player_season_records` | ✗ | VIEWER+ | CLUB_ADMIN, CLUB_MANAGER |
| `player_stats_seasons` | ✗ | VIEWER+ | CLUB_ADMIN, CLUB_MANAGER |
| `matches` | ✗ | VIEWER+ | CLUB_ADMIN, CLUB_MANAGER |
| `match_events` | ✗ | VIEWER+ | CLUB_ADMIN, CLUB_MANAGER |
| `articles` | Published only (via API) | VIEWER+ | EDITOR+, CLUB_ADMIN |
| `article_categories` | ✗ | VIEWER+ | EDITOR+, CLUB_ADMIN |
| `events` | Published only (via API) | VIEWER+ | EDITOR+, CLUB_ADMIN |
| `tags` | ✗ | VIEWER+ | EDITOR+, CLUB_ADMIN |
| `media_assets` | ✗ | VIEWER+ | EDITOR+, CLUB_ADMIN |
| `media_folders` | ✗ | VIEWER+ | EDITOR+, CLUB_ADMIN |
| `site_configurations` | Via API | VIEWER+ | CLUB_ADMIN only |
| `organization_members` | ✗ | Self only | CLUB_ADMIN |

> **Note:** The public site reads data via server-side API routes using the Supabase service role key (bypasses RLS). RLS protects the admin dashboard direct queries.

---

## 7. Season Archival Flow

```
Admin triggers archiveSession(seasonId)
    │
    ├── 1. Service: verify season exists and is_current = true
    ├── 2. Service: set season.is_current = false
    ├── 3. Service: set season.is_archived = true
    ├── 4. DB Transaction:
    │       UPDATE player_season_records SET is_locked = true WHERE season_id = ?
    │       UPDATE player_stats_seasons SET is_locked = true WHERE season_id = ?
    └── 5. Trigger: any future UPDATE/DELETE on locked records throws exception
```

---

## 8. Naming Conventions

| Convention | Example |
|---|---|
| Table names | `snake_case`, plural (`articles`, `match_events`) |
| Column names | `snake_case` (`first_name`, `organization_id`) |
| Prisma model names | `PascalCase` (`Article`, `MatchEvent`) |
| Prisma field names | `camelCase` (`firstName`, `organizationId`) |
| `@map` annotations | All models use `@map` to align Prisma camelCase with SQL snake_case |
| Boolean fields | Prefix: `is_` or `has_` (`is_active`, `is_locked`, `is_current`) |
| Timestamp fields | `created_at`, `updated_at` — always present on entity tables |
| FK columns | `{entity}_id` (`organization_id`, `player_id`, `season_id`) |

---

## 9. Migration Files

| File | Contents |
|---|---|
| `supabase/migrations/001_initial_schema.sql` | Auto-generated by `prisma migrate dev`. All tables, indexes, constraints. |
| `supabase/migrations/002_rls_policies.sql` | All RLS policies by table. Enable RLS + policies. |
| `supabase/migrations/003_triggers.sql` | `prevent_locked_record_mutation` function + triggers on `player_season_records` and `player_stats_seasons`. |

---

## 10. Environment Variables Required

```bash
# .env.local
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

> `DATABASE_URL` uses PgBouncer (port 6543) for pooled connections in production.
> `DIRECT_URL` uses direct connection (port 5432) for Prisma migrations.
