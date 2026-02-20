-- =============================================================================
-- Victoria Highlanders — Sports Management Platform
-- Migration: 003_triggers.sql
-- Historical integrity triggers for archived season records
-- =============================================================================

-- =============================================================================
-- FUNCTION: Prevent mutation of locked records
-- Called by triggers on player_season_records and player_stats_seasons
-- =============================================================================

CREATE OR REPLACE FUNCTION prevent_locked_record_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_locked = true THEN
    RAISE EXCEPTION
      'Cannot modify record %. This season has been archived and all its records are read-only.',
      OLD.id
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGER: Lock player_season_records
-- Fires BEFORE UPDATE or DELETE on any row where is_locked = true
-- =============================================================================

DROP TRIGGER IF EXISTS lock_player_season_records ON player_season_records;

CREATE TRIGGER lock_player_season_records
  BEFORE UPDATE OR DELETE ON player_season_records
  FOR EACH ROW
  EXECUTE FUNCTION prevent_locked_record_mutation();

-- =============================================================================
-- TRIGGER: Lock player_stats_seasons
-- Fires BEFORE UPDATE or DELETE on any row where is_locked = true
-- =============================================================================

DROP TRIGGER IF EXISTS lock_player_stats_seasons ON player_stats_seasons;

CREATE TRIGGER lock_player_stats_seasons
  BEFORE UPDATE OR DELETE ON player_stats_seasons
  FOR EACH ROW
  EXECUTE FUNCTION prevent_locked_record_mutation();

-- =============================================================================
-- FUNCTION: Auto-lock records when a season is archived
-- When season.is_archived is set to TRUE, this function locks all related records
-- =============================================================================

CREATE OR REPLACE FUNCTION auto_lock_season_records()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when is_archived transitions from false to true
  IF NEW.is_archived = true AND OLD.is_archived = false THEN

    -- Lock all PlayerSeasonRecords for this season
    UPDATE player_season_records
    SET is_locked = true, updated_at = NOW()
    WHERE season_id = NEW.id
      AND is_locked = false;

    -- Lock all PlayerStatsSeasons for this season
    UPDATE player_stats_seasons
    SET is_locked = true, updated_at = NOW()
    WHERE season_id = NEW.id
      AND is_locked = false;

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGER: Auto-lock when season is archived
-- Fires AFTER UPDATE on seasons table
-- =============================================================================

DROP TRIGGER IF EXISTS auto_lock_on_season_archive ON seasons;

CREATE TRIGGER auto_lock_on_season_archive
  AFTER UPDATE OF is_archived ON seasons
  FOR EACH ROW
  EXECUTE FUNCTION auto_lock_season_records();

-- =============================================================================
-- FUNCTION: Ensure only one current season per organization
-- Prevents multiple seasons with is_current = true in the same org
-- =============================================================================

CREATE OR REPLACE FUNCTION enforce_single_current_season()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current = true THEN
    -- Deactivate any other current season for this organization
    UPDATE seasons
    SET is_current = false, updated_at = NOW()
    WHERE organization_id = NEW.organization_id
      AND id != NEW.id
      AND is_current = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGER: Enforce single current season per org
-- Fires BEFORE INSERT or UPDATE on seasons
-- =============================================================================

DROP TRIGGER IF EXISTS enforce_single_current_season ON seasons;

CREATE TRIGGER enforce_single_current_season
  BEFORE INSERT OR UPDATE OF is_current ON seasons
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_current_season();

-- =============================================================================
-- FUNCTION: Prevent archiving a season that is still current
-- =============================================================================

CREATE OR REPLACE FUNCTION prevent_archive_current_season()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_archived = true AND NEW.is_current = true THEN
    RAISE EXCEPTION
      'Cannot archive the current active season. Deactivate it first.'
      USING ERRCODE = 'P0002';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_archive_current_season ON seasons;

CREATE TRIGGER prevent_archive_current_season
  BEFORE UPDATE OF is_archived ON seasons
  FOR EACH ROW
  EXECUTE FUNCTION prevent_archive_current_season();

-- =============================================================================
-- FUNCTION: Prevent hard delete of players with historical records
-- =============================================================================

CREATE OR REPLACE FUNCTION prevent_player_hard_delete()
RETURNS TRIGGER AS $$
DECLARE
  record_count integer;
BEGIN
  SELECT COUNT(*) INTO record_count
  FROM player_season_records
  WHERE player_id = OLD.id;

  IF record_count > 0 THEN
    RAISE EXCEPTION
      'Cannot delete player %. Player has % historical season record(s). Use soft delete (is_active = false) instead.',
      OLD.id, record_count
      USING ERRCODE = 'P0003';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_player_hard_delete ON players;

CREATE TRIGGER prevent_player_hard_delete
  BEFORE DELETE ON players
  FOR EACH ROW
  EXECUTE FUNCTION prevent_player_hard_delete();

-- =============================================================================
-- FUNCTION: Prevent hard delete of media assets that are referenced
-- =============================================================================

CREATE OR REPLACE FUNCTION prevent_referenced_asset_delete()
RETURNS TRIGGER AS $$
DECLARE
  ref_count integer;
BEGIN
  -- Check references in site_configurations
  SELECT COUNT(*) INTO ref_count
  FROM site_configurations
  WHERE logo_media_id = OLD.id
    OR favicon_media_id = OLD.id
    OR hero_media_id = OLD.id;

  IF ref_count > 0 THEN
    RAISE EXCEPTION
      'Cannot delete media asset %. It is referenced by site configuration. Remove the reference first.',
      OLD.id
      USING ERRCODE = 'P0004';
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_referenced_asset_delete ON media_assets;

CREATE TRIGGER prevent_referenced_asset_delete
  BEFORE DELETE ON media_assets
  FOR EACH ROW
  EXECUTE FUNCTION prevent_referenced_asset_delete();
