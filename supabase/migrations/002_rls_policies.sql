-- =============================================================================
-- Victoria Highlanders — Sports Management Platform
-- Migration: 002_rls_policies.sql
-- Row-Level Security policies for all tenant-scoped tables
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_nationalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_season_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_folder_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_configurations ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- HELPER FUNCTION: Get the authenticated user's memberships
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_org_ids(required_roles text[] DEFAULT NULL)
RETURNS SETOF uuid AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = auth.uid()
    AND status = 'ACTIVE'
    AND (required_roles IS NULL OR role::text = ANY(required_roles))
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = auth.uid()
      AND role = 'SUPER_ADMIN'
      AND status = 'ACTIVE'
    LIMIT 1
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =============================================================================
-- USERS
-- =============================================================================

-- Users can read their own profile
CREATE POLICY "users_read_own"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Super admins can read all users
CREATE POLICY "super_admin_read_all_users"
  ON users FOR SELECT
  USING (is_super_admin());

-- =============================================================================
-- ORGANIZATION_MEMBERS
-- =============================================================================

-- Members can read their org's membership list
CREATE POLICY "org_members_read"
  ON organization_members FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

-- Club admins can manage members of their org
CREATE POLICY "club_admin_manage_members"
  ON organization_members FOR ALL
  USING (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'SUPER_ADMIN'])
    )
  );

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================

-- All authenticated members can read their organization
CREATE POLICY "org_members_read_org"
  ON organizations FOR SELECT
  USING (id IN (SELECT get_user_org_ids()));

-- Only club admins can update their organization
CREATE POLICY "club_admin_update_org"
  ON organizations FOR UPDATE
  USING (id IN (SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'SUPER_ADMIN'])));

-- Super admins can create organizations
CREATE POLICY "super_admin_create_org"
  ON organizations FOR INSERT
  WITH CHECK (is_super_admin());

-- =============================================================================
-- VENUES
-- =============================================================================

CREATE POLICY "venues_read"
  ON venues FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "venues_manage"
  ON venues FOR ALL
  USING (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'SUPER_ADMIN'])
    )
  );

-- =============================================================================
-- TEAMS
-- =============================================================================

CREATE POLICY "teams_read"
  ON teams FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "teams_manage"
  ON teams FOR ALL
  USING (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'SUPER_ADMIN'])
    )
  );

-- =============================================================================
-- SEASONS
-- =============================================================================

CREATE POLICY "seasons_read"
  ON seasons FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "seasons_manage"
  ON seasons FOR ALL
  USING (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'SUPER_ADMIN'])
    )
  );

-- =============================================================================
-- PLAYERS
-- =============================================================================

CREATE POLICY "players_read"
  ON players FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "players_manage"
  ON players FOR ALL
  USING (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'SUPER_ADMIN'])
    )
  );

-- =============================================================================
-- PLAYER_NATIONALITIES
-- =============================================================================

CREATE POLICY "player_nationalities_read"
  ON player_nationalities FOR SELECT
  USING (
    player_id IN (
      SELECT id FROM players
      WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "player_nationalities_manage"
  ON player_nationalities FOR ALL
  USING (
    player_id IN (
      SELECT id FROM players
      WHERE organization_id IN (
        SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'SUPER_ADMIN'])
      )
    )
  );

-- =============================================================================
-- PLAYER_SEASON_RECORDS
-- =============================================================================

CREATE POLICY "psr_read"
  ON player_season_records FOR SELECT
  USING (
    season_id IN (
      SELECT id FROM seasons
      WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- Locked records: RLS allows the query but the DB trigger blocks the mutation
CREATE POLICY "psr_manage"
  ON player_season_records FOR ALL
  USING (
    season_id IN (
      SELECT id FROM seasons
      WHERE organization_id IN (
        SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'SUPER_ADMIN'])
      )
    )
  );

-- =============================================================================
-- PLAYER_STATS_SEASONS
-- =============================================================================

CREATE POLICY "pss_read"
  ON player_stats_seasons FOR SELECT
  USING (
    season_id IN (
      SELECT id FROM seasons
      WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "pss_manage"
  ON player_stats_seasons FOR ALL
  USING (
    season_id IN (
      SELECT id FROM seasons
      WHERE organization_id IN (
        SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'SUPER_ADMIN'])
      )
    )
  );

-- =============================================================================
-- STAFF_MEMBERS
-- =============================================================================

CREATE POLICY "staff_read"
  ON staff_members FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "staff_manage"
  ON staff_members FOR ALL
  USING (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'SUPER_ADMIN'])
    )
  );

-- =============================================================================
-- MATCHES
-- =============================================================================

CREATE POLICY "matches_read"
  ON matches FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "matches_manage"
  ON matches FOR ALL
  USING (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'SUPER_ADMIN'])
    )
  );

-- =============================================================================
-- MATCH_EVENTS
-- =============================================================================

CREATE POLICY "match_events_read"
  ON match_events FOR SELECT
  USING (
    match_id IN (
      SELECT id FROM matches
      WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "match_events_manage"
  ON match_events FOR ALL
  USING (
    match_id IN (
      SELECT id FROM matches
      WHERE organization_id IN (
        SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'SUPER_ADMIN'])
      )
    )
  );

-- =============================================================================
-- TAGS
-- =============================================================================

CREATE POLICY "tags_read"
  ON tags FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "tags_manage"
  ON tags FOR ALL
  USING (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'EDITOR', 'SUPER_ADMIN'])
    )
  );

-- =============================================================================
-- ARTICLES
-- =============================================================================

CREATE POLICY "articles_read"
  ON articles FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

-- Editors and above can create/update articles
CREATE POLICY "articles_write"
  ON articles FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'EDITOR', 'SUPER_ADMIN'])
    )
  );

CREATE POLICY "articles_update"
  ON articles FOR UPDATE
  USING (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'EDITOR', 'SUPER_ADMIN'])
    )
  );

-- Only Club Admin can delete articles
CREATE POLICY "articles_delete"
  ON articles FOR DELETE
  USING (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'SUPER_ADMIN'])
    )
  );

-- =============================================================================
-- ARTICLE_CATEGORIES
-- =============================================================================

CREATE POLICY "article_categories_read"
  ON article_categories FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "article_categories_manage"
  ON article_categories FOR ALL
  USING (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'EDITOR', 'SUPER_ADMIN'])
    )
  );

-- =============================================================================
-- ARTICLE_TAGS
-- =============================================================================

CREATE POLICY "article_tags_read"
  ON article_tags FOR SELECT
  USING (
    article_id IN (
      SELECT id FROM articles
      WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "article_tags_manage"
  ON article_tags FOR ALL
  USING (
    article_id IN (
      SELECT id FROM articles
      WHERE organization_id IN (
        SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'EDITOR', 'SUPER_ADMIN'])
      )
    )
  );

-- =============================================================================
-- EVENTS
-- =============================================================================

CREATE POLICY "events_read"
  ON events FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "events_manage"
  ON events FOR ALL
  USING (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'EDITOR', 'SUPER_ADMIN'])
    )
  );

-- =============================================================================
-- EVENT_TAGS
-- =============================================================================

CREATE POLICY "event_tags_read"
  ON event_tags FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "event_tags_manage"
  ON event_tags FOR ALL
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'EDITOR', 'SUPER_ADMIN'])
      )
    )
  );

-- =============================================================================
-- MEDIA_ASSETS
-- =============================================================================

CREATE POLICY "media_assets_read"
  ON media_assets FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "media_assets_upload"
  ON media_assets FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'EDITOR', 'SUPER_ADMIN'])
    )
  );

CREATE POLICY "media_assets_update"
  ON media_assets FOR UPDATE
  USING (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'EDITOR', 'SUPER_ADMIN'])
    )
  );

-- Only Club Admin can hard-delete assets
CREATE POLICY "media_assets_delete"
  ON media_assets FOR DELETE
  USING (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'SUPER_ADMIN'])
    )
  );

-- =============================================================================
-- MEDIA_FOLDERS
-- =============================================================================

CREATE POLICY "media_folders_read"
  ON media_folders FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "media_folders_manage"
  ON media_folders FOR ALL
  USING (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'EDITOR', 'SUPER_ADMIN'])
    )
  );

-- =============================================================================
-- MEDIA_FOLDER_ASSETS
-- =============================================================================

CREATE POLICY "media_folder_assets_read"
  ON media_folder_assets FOR SELECT
  USING (
    folder_id IN (
      SELECT id FROM media_folders
      WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "media_folder_assets_manage"
  ON media_folder_assets FOR ALL
  USING (
    folder_id IN (
      SELECT id FROM media_folders
      WHERE organization_id IN (
        SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'CLUB_MANAGER', 'EDITOR', 'SUPER_ADMIN'])
      )
    )
  );

-- =============================================================================
-- SITE_CONFIGURATIONS
-- =============================================================================

-- All members can read config (used to render public site on server side)
CREATE POLICY "site_config_read"
  ON site_configurations FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

-- Only Club Admin can update site configuration
CREATE POLICY "site_config_update"
  ON site_configurations FOR ALL
  USING (
    organization_id IN (
      SELECT get_user_org_ids(ARRAY['CLUB_ADMIN', 'SUPER_ADMIN'])
    )
  );

-- =============================================================================
-- LEAGUES (future use)
-- =============================================================================

CREATE POLICY "leagues_read"
  ON leagues FOR SELECT
  USING (
    id IN (
      SELECT league_id FROM organizations
      WHERE id IN (SELECT get_user_org_ids())
        AND league_id IS NOT NULL
    )
    OR is_super_admin()
  );

-- =============================================================================
-- COMPETITIONS (future use)
-- =============================================================================

CREATE POLICY "competitions_read"
  ON competitions FOR SELECT
  USING (
    league_id IN (
      SELECT league_id FROM organizations
      WHERE id IN (SELECT get_user_org_ids())
        AND league_id IS NOT NULL
    )
    OR is_super_admin()
  );

CREATE POLICY "competition_participants_read"
  ON competition_participants FOR SELECT
  USING (
    organization_id IN (SELECT get_user_org_ids())
    OR is_super_admin()
  );
