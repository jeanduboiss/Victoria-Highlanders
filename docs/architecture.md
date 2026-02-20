# Architecture — Conceptual Design
## Victoria Highlanders — Sports Management Platform

**Version:** 1.0.0
**Date:** 2026-02-19
**Phase:** 1 — Conceptual Architecture
**Status:** Approved

---

## 1. Conceptual System Model

### 1.1 High-Level Vision

The platform is a single Next.js application serving two distinct surfaces from the same codebase:

```
Next.js App
├── (public)    → Club website (SSR/ISR, accessible to everyone)
└── (admin)     → Management dashboard (authenticated staff only)
```

Both surfaces share the same Supabase database, authentication, and storage layer.

### 1.2 Organizational Hierarchy

```
PLATFORM (singleton)
    │
    ├── LEAGUE (future — groups multiple clubs)
    │       │
    │       └── ORGANIZATION (Club) ← Current scope: Victoria Highlanders
    │               │
    │               ├── TEAM (multiple categories)
    │               │       │
    │               │       ├── PLAYER (via PlayerSeasonRecord)
    │               │       └── STAFF MEMBER
    │               │
    │               ├── SEASON (historical integrity unit)
    │               ├── MATCH
    │               ├── VENUE
    │               ├── ARTICLE / EVENT
    │               ├── MEDIA ASSETS
    │               └── SITE CONFIGURATION
```

### 1.3 Core Architectural Principles

**Principle 1 — Tenant Isolation:**
Every domain table carries `organization_id`. Row-Level Security (RLS) on Supabase enforces that users can only access data from organizations they belong to.

**Principle 2 — Historical Integrity:**
A `Season` is the unit of historical record. When archived, all linked `PlayerSeasonRecord` and `PlayerStatsSeason` entries become immutable at three layers: PostgreSQL trigger, Prisma middleware, and service layer.

**Principle 3 — Multi-Tenant Ready from Day 1:**
The current implementation serves one organization. The architecture requires no schema changes to onboard additional clubs. Only application routing and Supabase RLS configuration need to be adjusted.

**Principle 4 — Invitation-Only Access:**
No public registration. All admin users are invited by email via Supabase Auth. Users can belong to multiple organizations with different roles.

**Principle 5 — Bounded Context Separation:**
Six bounded contexts own their data and logic. Cross-context dependencies are explicit and minimal.

---

## 2. Principal Entities

### 2.1 Identity & Access Management (IAM)

**User**
A person with system access. Identity is managed by Supabase Auth. The `users` table extends auth data with profile information.
```
id (UUID, FK → auth.users)
email
full_name
avatar_url
is_active
last_sign_in_at
created_at
updated_at
```

**OrganizationMember**
Junction that binds a User to an Organization with a Role. A user can be a Club Admin in one organization and an Editor in another.
```
id
organization_id  FK → organizations
user_id          FK → users
role             enum (Role)
is_active
invited_by       FK → users (nullable)
joined_at
created_at
```

**Role (enum)**
`SUPER_ADMIN | LEAGUE_ADMIN | CLUB_ADMIN | CLUB_MANAGER | EDITOR | VIEWER`

**Permission**
Granular permission record for a module+action combination.
```
id
code           (e.g., "articles:publish")
module         (e.g., "editorial")
action         (e.g., "publish")
description
```

**RolePermission** — Junction: `role_id ↔ permission_id`

---

### 2.2 Organization Management

**Platform** — Singleton root of the SaaS. Holds global configuration.

**League**
Groups multiple clubs into a competitive structure. Future use; referenced by Organization optionally.
```
id
name, slug
logo_url
description
country, region
is_active
settings (jsonb)
```

**Organization**
The primary tenant. Victoria Highlanders is one Organization.
```
id
league_id       FK → leagues (nullable)
name, slug, short_name
description
founded_year
logo_url, badge_url
primary_color, secondary_color
country, city
is_active
settings (jsonb)
created_at, updated_at
```

**Venue**
Physical location where matches and events take place.
```
id
organization_id  FK → organizations
name
address, city, country
capacity
latitude, longitude (nullable)
photo_url
is_home_venue
```

---

### 2.3 Sports Management (Core Domain)

**Team**
A competitive team within an Organization. One org can have multiple teams across categories.
```
id
organization_id  FK → organizations
name, short_name
category         enum (FIRST_TEAM | RESERVE | U23 | U20 | U18 | U16 | U14 | U12 | WOMEN | FUTSAL)
gender           enum (MALE | FEMALE | MIXED)
badge_url
description
is_active
founded_year
```

**Season**
A competitive period. The unit of historical integrity. All player records are anchored to a Season.
```
id
organization_id  FK → organizations
name             (e.g., "2025-2026")
short_name       (e.g., "25/26")
start_date
end_date
is_current       (only one true per org)
is_archived      (immutable when true)
created_at, updated_at
```

**Player**
Permanent personal data. Does NOT belong to a team directly — belongs to the organization's pool.
```
id
organization_id  FK → organizations
first_name, last_name
date_of_birth
nationality
photo_url
position         enum (GOALKEEPER | DEFENDER | MIDFIELDER | FORWARD)
preferred_foot   enum (LEFT | RIGHT | BOTH)
height_cm, weight_kg
biography
jersey_number_default (nullable)
is_active
created_at, updated_at
```

**PlayerSeasonRecord** ← Critical entity for historical integrity
Records a player's membership in a specific team during a specific season. Immutable once the season is archived.
```
id
player_id        FK → players
team_id          FK → teams
season_id        FK → seasons
jersey_number
transfer_in_date
transfer_out_date (nullable — null means currently active in this team)
is_current
status           enum (ACTIVE | LOANED | SUSPENDED | INJURED | TRANSFERRED)
contract_type    enum (PROFESSIONAL | AMATEUR | YOUTH)
is_locked        (true when season is archived)
created_at, updated_at
```

**PlayerStatsSeason**
Accumulated stats for a player in a specific team/season context. 1:1 with PlayerSeasonRecord.
```
id
player_season_record_id  FK → player_season_records
player_id                FK → players
team_id                  FK → teams
season_id                FK → seasons
matches_played
matches_started
minutes_played
goals
assists
yellow_cards
red_cards
clean_sheets           (goalkeepers)
goals_conceded         (goalkeepers)
saves                  (goalkeepers)
is_locked
updated_at
```

**StaffMember**
Technical and administrative staff linked to a team.
```
id
organization_id  FK → organizations
team_id          FK → teams (nullable)
first_name, last_name
role             enum (HEAD_COACH | ASSISTANT_COACH | GOALKEEPER_COACH | FITNESS_COACH | DOCTOR | ANALYST | TEAM_MANAGER)
photo_url
nationality
date_of_birth
biography
is_active
start_date
end_date (nullable)
```

**Match**
A scheduled or completed match. Always anchored to a Season.
```
id
organization_id  FK → organizations
season_id        FK → seasons
home_team_id     FK → teams
away_team_id     FK → teams
competition_name
match_date
venue_id         FK → venues (nullable)
status           enum (SCHEDULED | LIVE | FINISHED | POSTPONED | CANCELLED | ABANDONED)
home_score       (nullable)
away_score       (nullable)
match_day        (nullable)
round            (nullable)
is_home_game
notes
created_at, updated_at
```

**MatchEvent**
Individual events within a match. Drives PlayerStatsSeason updates.
```
id
match_id         FK → matches
player_id        FK → players
event_type       enum (GOAL | OWN_GOAL | YELLOW_CARD | RED_CARD | YELLOW_RED_CARD | SUBSTITUTION_IN | SUBSTITUTION_OUT | PENALTY_SCORED | PENALTY_MISSED)
minute
extra_time_minute (nullable)
description      (nullable)
created_at
```

**Competition** (future multi-league)
A tournament or league owned by a League entity.
```
id
league_id        FK → leagues
name, slug
competition_type enum (LEAGUE | CUP | FRIENDLY | TOURNAMENT)
season_year
is_active
description
```

**CompetitionParticipant** — Junction: `competition_id ↔ organization_id ↔ team_id`

---

### 2.4 Content Management (Editorial)

**Article**
Club news and editorial content.
```
id
organization_id  FK → organizations
author_id        FK → users
title
slug             (unique per organization)
excerpt
content          (rich text / markdown)
cover_image_url
status           enum (DRAFT | SCHEDULED | PUBLISHED | ARCHIVED)
published_at     (nullable — set automatically at publication)
scheduled_at     (nullable)
view_count
is_featured
meta_title
meta_description
created_at, updated_at
```

**ArticleCategory**
```
id
organization_id  FK → organizations
name, slug
description
color
created_at
```

**ArticleCategoryMap** — Junction N:M: `article_id ↔ category_id`

**Event**
Club events (matches with tickets, open training, social activations, etc.)
```
id
organization_id  FK → organizations
title, slug
description
event_type       enum (MATCH | TRAINING | SOCIAL | MEMBERSHIP | PRESS | CHARITY | OTHER)
cover_image_url
start_datetime
end_datetime     (nullable)
venue_id         FK → venues (nullable)
location_text    (nullable)
status           enum (DRAFT | PUBLISHED | CANCELLED | FINISHED)
is_featured
registration_url (nullable)
created_at, updated_at
```

---

### 2.5 Media Management

**MediaAsset**
Any file uploaded to Supabase Storage.
```
id
organization_id  FK → organizations
uploaded_by      FK → users
file_name
file_size_bytes
mime_type
storage_path     (canonical path in Supabase Storage)
public_url
width            (nullable — for images)
height           (nullable)
duration_seconds (nullable — for videos)
alt_text
caption
is_archived      (soft delete — set when referenced elsewhere)
created_at, updated_at
```

**MediaFolder**
Virtual folder structure for organizing assets.
```
id
organization_id  FK → organizations
name, slug
parent_id        FK → media_folders (nullable — self-reference for nesting)
description
created_at, updated_at
```

**MediaFolderAsset** — Junction N:M: `asset_id ↔ folder_id`

---

### 2.6 Site Configuration

**SiteConfiguration**
Global public site settings. One record per organization. Drives the public site's appearance dynamically.
```
id
organization_id  FK → organizations (UNIQUE)
site_name
tagline
logo_media_id    FK → media_assets (nullable)
favicon_media_id FK → media_assets (nullable)
hero_media_id    FK → media_assets (nullable)
primary_color
secondary_color
accent_color
font_heading
font_body
social_twitter, social_instagram, social_facebook
social_youtube, social_tiktok, social_linkedin
contact_email, contact_phone
address
google_analytics_id
seo_default_title
seo_default_description
updated_at
updated_by       FK → users
```

---

## 3. Key Relationships and Cardinalities

```
Platform            1 ──── N   League
Platform            1 ──── N   Organization          (tenants without a league)
League              1 ──── N   Organization

Organization        1 ──── N   Team
Organization        1 ──── N   Season
Organization        1 ──── N   Player                (player pool)
Organization        1 ──── N   Venue
Organization        1 ──── N   Match
Organization        1 ──── N   Article
Organization        1 ──── N   ArticleCategory
Organization        1 ──── N   Event
Organization        1 ──── N   MediaAsset
Organization        1 ──── N   MediaFolder
Organization        1 ──── 1   SiteConfiguration
Organization        1 ──── N   OrganizationMember

User                1 ──── N   OrganizationMember    (user belongs to multiple orgs)
OrganizationMember  N ──── 1   Role
Role                N ──── M   Permission            (via RolePermission)

Player              1 ──── N   PlayerSeasonRecord    (history across teams/seasons)
Team                1 ──── N   PlayerSeasonRecord
Season              1 ──── N   PlayerSeasonRecord
PlayerSeasonRecord  1 ──── 1   PlayerStatsSeason

Match               N ──── 1   Team                  (home_team_id, away_team_id)
Match               N ──── 1   Season
Match               N ──── 1   Venue                 (nullable)
Match               1 ──── N   MatchEvent
MatchEvent          N ──── 1   Player

Team                1 ──── N   StaffMember
Article             N ──── M   ArticleCategory       (via ArticleCategoryMap)
MediaAsset          N ──── M   MediaFolder           (via MediaFolderAsset)
MediaFolder         1 ──── N   MediaFolder           (self-reference for nesting)

League              1 ──── N   Competition
Competition         N ──── M   Organization          (via CompetitionParticipant)
```

---

## 4. DDD Aggregates

### Aggregate 1: Organization
**Root:** Organization
**Includes:** SiteConfiguration, OrganizationMember
**Invariants:**
- Always has ≥1 active CLUB_ADMIN
- Slug is globally unique across the platform
- Deactivating an organization implicitly blocks all member access

**Key operations:**
- `createOrganization(name, slug, ...) → Organization`
- `addMember(organization_id, user_id, role) → OrganizationMember`
- `deactivateOrganization(organization_id) → void`
- `updateSiteConfiguration(organization_id, config) → SiteConfiguration`

---

### Aggregate 2: Season
**Root:** Season
**Includes:** PlayerSeasonRecord, PlayerStatsSeason
**Invariants:**
- Only one `is_current = true` per organization at a time
- Archived season (`is_archived = true`) is permanently immutable — no records can be modified
- Season date ranges cannot overlap within the same organization

**Key operations:**
- `createSeason(organization_id, name, dates) → Season`
- `activateSeason(season_id) → void` (deactivates previous automatically)
- `archiveSeason(season_id) → void` (seals all linked records)
- `enrollPlayerInTeam(season_id, player_id, team_id, jersey) → PlayerSeasonRecord`
- `transferPlayerWithinSeason(record_id, new_team_id) → PlayerSeasonRecord`
- `updatePlayerStats(record_id, stats) → PlayerStatsSeason`

---

### Aggregate 3: Match
**Root:** Match
**Includes:** MatchEvent
**Invariants:**
- MatchEvents reference players with an active PlayerSeasonRecord in the match's team and season
- A FINISHED match cannot revert to SCHEDULED
- Match events can only be added/edited while status ≠ FINISHED (or admin override)

**Key operations:**
- `scheduleMatch(organization_id, season_id, home_team_id, away_team_id, date, ...) → Match`
- `recordResult(match_id, home_score, away_score) → Match` → triggers stats update
- `addMatchEvent(match_id, player_id, event_type, minute) → MatchEvent`
- `postponeMatch(match_id) → Match`

---

### Aggregate 4: Player
**Root:** Player
**Includes:** (personal data only — records are in Season aggregate)
**Invariants:**
- Player belongs to the organization pool, not to a specific team
- Hard deletion is blocked if any PlayerSeasonRecord exists (soft delete: `is_active = false`)
- A player with no current season enrollment is still valid in the system

**Key operations:**
- `registerPlayer(organization_id, personal_data) → Player`
- `updatePlayerProfile(player_id, data) → Player`
- `deactivatePlayer(player_id) → void`
- `getCurrentEnrollment(player_id, season_id) → PlayerSeasonRecord | null`

---

### Aggregate 5: Article
**Root:** Article
**Includes:** ArticleCategoryMap
**Invariants:**
- Slug is unique per organization
- PUBLISHED articles cannot revert to DRAFT (must go to ARCHIVED first)
- `published_at` is set automatically on first publish and cannot be changed

**Key operations:**
- `createDraft(organization_id, author_id, title, content, ...) → Article`
- `publishArticle(article_id) → Article`
- `scheduleArticle(article_id, scheduled_at) → Article`
- `archiveArticle(article_id) → Article`
- `assignCategories(article_id, category_ids[]) → void`

---

### Aggregate 6: MediaLibrary
**Root:** Organization's root MediaFolder
**Includes:** MediaAsset, MediaFolderAsset
**Invariants:**
- Assets referenced in SiteConfiguration, Articles, or Events cannot be hard-deleted (`is_archived = true` instead)
- Storage path is canonical and unique in Supabase Storage
- Folder deletion is blocked if it contains assets

**Key operations:**
- `uploadAsset(organization_id, file, folder_id?) → MediaAsset`
- `moveAsset(asset_id, target_folder_id) → void`
- `archiveAsset(asset_id) → void` (if referenced) or hard delete (if unreferenced)
- `createFolder(organization_id, name, parent_id?) → MediaFolder`

---

## 5. Multi-Tenant Design

### Strategy: Single Database, Shared Schema + RLS

All domain tables include `organization_id UUID NOT NULL` as a discriminator column. Supabase Row-Level Security (RLS) policies enforce tenant isolation at the database layer.

**Base RLS policy pattern (applied to every tenant-scoped table):**
```sql
CREATE POLICY "tenant_isolation" ON articles
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
        AND is_active = true
    )
  );
```

**Super Admin bypass:**
```sql
CREATE POLICY "super_admin_bypass" ON articles
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'SUPER_ADMIN'
    )
  );
```

### Authentication Flow (Invitation-Only)
1. Club Admin navigates to `/admin/settings/users`
2. Enters invitee email and selects role
3. Server Action calls `supabase.auth.admin.inviteUserByEmail()`
4. Invitee receives magic link email
5. Invitee sets password and is auto-enrolled as OrganizationMember

### URL Structure (Current → Future)

Current (single club):
```
https://victoriahighlanders.com/         ← Public site
https://victoriahighlanders.com/admin/   ← Admin panel
```

Future (multi-tenant SaaS):
```
https://app.platform.com/[org-slug]/admin/   ← Dynamic slug routing
https://[org-slug].platform.com/             ← Subdomain per tenant
https://victoriahighlanders.com/             ← Custom domain via Vercel proxy
```

---

## 6. Bounded Contexts

### Context Map Overview

```
                       ┌─────────────────┐
                       │  IAM            │
                       │  (Shield)       │
                       │  All contexts   │
                       │  depend on this │
                       └────────┬────────┘
                                │
            ┌───────────────────┼────────────────────┐
            │                   │                    │
     ┌──────▼──────┐    ┌───────▼───────┐   ┌───────▼───────┐
     │Organization │    │Sports Mgmt    │   │Content Mgmt   │
     │Management   │    │(Core Domain)  │   │(Editorial)    │
     └──────┬──────┘    └───────┬───────┘   └───────┬───────┘
            │                   │                   │
            └─────── Shared: organization_id ───────┘
                                │
                ┌───────────────┼───────────────┐
                │                               │
        ┌───────▼───────┐               ┌───────▼───────┐
        │ Media Mgmt    │               │ Site Config   │
        │ (Supporting)  │               │ (Supporting)  │
        └───────────────┘               └───────────────┘
```

### BC 1: Identity & Access Management (IAM)

**Responsibility:** Authentication, authorization, user lifecycle, RBAC enforcement.
**Owns:** User, Role, Permission, RolePermission, OrganizationMember
**Ubiquitous Language:** user, role, permission, access, invitation, membership
**Exposes:** `canPerformAction(userId, organizationId, module, action) → boolean`
**Tech:** Supabase Auth (identity) + PostgreSQL tables (authorization) + RLS policies

---

### BC 2: Organization Management

**Responsibility:** Lifecycle of clubs and leagues as business entities.
**Owns:** Platform, League, Organization, Venue
**Ubiquitous Language:** club, league, organization, venue, tenant, slug
**Domain Events:** OrganizationCreated, OrganizationDeactivated, LeagueCreated

---

### BC 3: Sports Management ← Core Domain

**Responsibility:** All sports logic: rosters, seasons, matches, statistics, historical records.
**Owns:** Team, Player, Season, PlayerSeasonRecord, PlayerStatsSeason, StaffMember, Match, MatchEvent, Competition, CompetitionParticipant
**Ubiquitous Language:** player, team, season, match, goal, stat, transfer, roster, result, record, archive
**Sub-domains:**
- Squad Management (Team, Player, PlayerSeasonRecord, StaffMember)
- Competition Management (Match, MatchEvent)
- Statistics (PlayerStatsSeason)
- Historical Records (archived Season, locked records)

**Domain Events:**
- PlayerEnrolledInTeam
- PlayerTransferredWithinSeason
- MatchScheduled
- MatchFinished(home_score, away_score) → triggers stats update
- SeasonArchived → locks all records

---

### BC 4: Content Management (Editorial)

**Responsibility:** Club's public editorial content.
**Owns:** Article, ArticleCategory, ArticleCategoryMap, Event
**Ubiquitous Language:** article, draft, publication, schedule, category, event, slug, featured
**Domain Events:** ArticlePublished, ArticleScheduled, EventPublished

---

### BC 5: Media Management

**Responsibility:** Full lifecycle of digital files for the club.
**Owns:** MediaAsset, MediaFolder, MediaFolderAsset
**Ubiquitous Language:** asset, file, image, video, gallery, folder, upload, storage, public URL
**Key Invariant:** No other context can delete files directly; all deletions pass through Media Management which verifies references first.
**Domain Events:** AssetUploaded, AssetArchived, AssetDeleted

---

### BC 6: Site Configuration

**Responsibility:** Public site appearance and global settings.
**Owns:** SiteConfiguration
**Ubiquitous Language:** configuration, branding, logo, favicon, hero, color palette, social links, SEO
**Integration:** Consumes MediaAsset references for logo, favicon, hero. Changes trigger on-demand Next.js cache revalidation.

---

## 7. System Module Structure

### Directory Layout (Single Next.js App)

```
[project-root]/
│
├── app/
│   ├── (public)/                        ← Club public website
│   │   ├── layout.tsx                   ← Reads SiteConfiguration, applies theme
│   │   ├── page.tsx                     ← Home / Hero
│   │   ├── news/
│   │   │   ├── page.tsx                 ← News listing (ISR)
│   │   │   └── [slug]/page.tsx          ← Individual article
│   │   ├── team/
│   │   │   ├── page.tsx                 ← Squad page
│   │   │   └── [playerId]/page.tsx      ← Player public profile
│   │   ├── matches/page.tsx             ← Schedule & results
│   │   ├── events/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── residency/page.tsx           ← Residency program info (static)
│   │   └── gallery/page.tsx
│   │
│   └── (admin)/                         ← Admin dashboard
│       ├── layout.tsx                   ← Auth guard + role check
│       ├── login/page.tsx               ← Auth page (Supabase magic link)
│       ├── dashboard/page.tsx           ← KPIs overview
│       ├── sports/
│       │   ├── teams/
│       │   │   ├── page.tsx             ← Teams list
│       │   │   └── [teamId]/page.tsx    ← Team detail + roster
│       │   ├── players/
│       │   │   ├── page.tsx             ← Player pool
│       │   │   └── [playerId]/
│       │   │       ├── profile/page.tsx
│       │   │       ├── seasons/page.tsx  ← Season record history
│       │   │       └── stats/page.tsx
│       │   ├── seasons/page.tsx
│       │   └── matches/
│       │       ├── page.tsx
│       │       └── [matchId]/page.tsx   ← Match detail + event entry
│       ├── editorial/
│       │   ├── articles/
│       │   │   ├── page.tsx
│       │   │   ├── new/page.tsx
│       │   │   └── [articleId]/page.tsx
│       │   ├── categories/page.tsx
│       │   └── events/
│       │       ├── page.tsx
│       │       └── [eventId]/page.tsx
│       ├── media/
│       │   ├── page.tsx                 ← Media library (folder view)
│       │   └── upload/page.tsx
│       ├── configuration/
│       │   ├── general/page.tsx
│       │   ├── branding/page.tsx
│       │   └── social/page.tsx
│       └── settings/
│           └── users/page.tsx
│
├── src/
│   ├── domains/
│   │   ├── iam/
│   │   │   ├── actions/
│   │   │   ├── services/
│   │   │   ├── queries/
│   │   │   ├── schemas/
│   │   │   └── types/
│   │   ├── organization/
│   │   ├── sports/
│   │   │   ├── squad/         ← Team, Player, PlayerSeasonRecord, StaffMember
│   │   │   ├── competition/   ← Match, MatchEvent
│   │   │   ├── statistics/    ← PlayerStatsSeason
│   │   │   └── history/       ← Archived season queries
│   │   ├── editorial/
│   │   ├── media/
│   │   └── configuration/
│   │
│   ├── components/
│   │   ├── ui/                ← shadcn/ui base components
│   │   ├── magic/             ← Magic UI effects
│   │   └── [domain]/          ← Domain-specific components
│   │
│   ├── services/              ← Business logic (throws friendly errors)
│   ├── actions/               ← next-safe-action server actions
│   └── lib/
│       ├── supabase/          ← Supabase client (server + browser)
│       ├── prisma/            ← Prisma client singleton
│       └── utils/             ← Shared utilities
│
├── prisma/
│   └── schema.prisma          ← Single source of truth for DB schema
│
└── supabase/
    ├── config.toml
    └── migrations/            ← SQL: RLS policies, triggers, indexes
```

### Domain Module Internal Structure

Each domain follows this consistent internal structure:

```
src/domains/sports/squad/
├── actions/
│   ├── create-player.action.ts      ← next-safe-action + Zod schema
│   ├── update-player.action.ts
│   ├── enroll-player.action.ts
│   └── transfer-player.action.ts
├── services/
│   ├── player.service.ts            ← Business logic, friendly error messages
│   ├── team.service.ts
│   └── player-season.service.ts
├── queries/
│   ├── get-team-squad.query.ts      ← Prisma queries (read-only)
│   └── get-player-history.query.ts
├── schemas/
│   ├── player.schema.ts             ← Zod validation schemas
│   └── enrollment.schema.ts
├── types/
│   └── squad.type.ts                ← TypeScript interfaces
└── index.ts                         ← Barrel export
```

---

## 8. Cross-Cutting Concerns

### 8.1 Historical Integrity — 3-Layer Protection

```
Layer 1: PostgreSQL Trigger
  → Fires BEFORE UPDATE or DELETE on player_season_records / player_stats_seasons
  → Checks if the related season has is_archived = true
  → Raises an exception if attempting mutation on archived data

Layer 2: Prisma Middleware
  → Intercepts update/delete operations on sensitive models
  → Verifies season.is_archived before allowing the operation
  → Returns a structured error if season is archived

Layer 3: Service Layer
  → First line of defense with user-friendly error messages
  → Validates season status before invoking any Prisma mutation
  → Example: "This season has been archived. Its records cannot be modified."
```

### 8.2 Caching Strategy

| Data | Strategy | Invalidation |
|---|---|---|
| SiteConfiguration | `unstable_cache` + tag | `revalidateTag` on update |
| Published articles | ISR (`revalidate: 60`) | `revalidatePath` on publish |
| Archived season stats | Aggressive cache (immutable) | Never (data is sealed) |
| Media asset URLs | Supabase CDN | N/A (stable URLs) |
| Active season data | Short TTL or no cache | On any mutation |

### 8.3 Image Handling

- Source: Supabase Storage (configured as Next.js allowed image domain)
- Format: WebP preferred; Supabase Image Transformation for resizing
- Loading: `lazy` by default, `eager` for hero/above-fold images
- Responsive: `sizes` prop on all `<Image>` components

### 8.4 Server Actions Pattern

```typescript
// All server actions follow this pattern using next-safe-action:
export const createPlayerAction = authAction
  .schema(createPlayerSchema)        // Zod validation
  .action(async ({ parsedInput, ctx }) => {
    // ctx.organizationId verified by middleware
    return playerService.createPlayer({
      ...parsedInput,
      organizationId: ctx.organizationId,
    })
  })
```

### 8.5 Error Handling

- Services throw user-friendly, localized error messages
- Actions catch service errors and return structured `ActionResult`
- Unexpected errors bubble up to `error.tsx` boundaries
- No raw database errors exposed to the client

### 8.6 Deployment

```
Vercel
├── Next.js app (SSR + ISR + Edge Middleware)
└── Environment variables:
    ├── NEXT_PUBLIC_SUPABASE_URL
    ├── NEXT_PUBLIC_SUPABASE_ANON_KEY
    ├── SUPABASE_SERVICE_ROLE_KEY
    └── DATABASE_URL (Prisma direct connection)

Supabase
├── PostgreSQL database (Prisma-managed schema)
├── Supabase Auth (invitation flow)
├── Supabase Storage (media files)
└── Row-Level Security (all tables)
```

---

## 9. Migration Path: Single Club → Multi-Tenant SaaS

The current implementation serves Victoria Highlanders as the sole organization. Since `organization_id` is on every table and RLS is enforced from day 1, expanding to multi-tenant requires:

1. **Enable org registration** — Admin UI to create new organizations
2. **Dynamic routing** — `/[org-slug]/admin/` for tenant-specific dashboards
3. **Custom domains** — Vercel proxy configuration per organization
4. **Adjust RLS** — No schema changes needed; RLS policies already support multiple orgs
5. **Billing layer** — Add subscription/plan management (out of scope for current phase)

**No database schema migration is required.**
