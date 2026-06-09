-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004: Leaflet tile configuration & map settings table
-- Run this in your Supabase project → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── App settings table ────────────────────────────────────────────────────────
-- Stores key-value config readable by the frontend via the Supabase client.
-- Only admins can write; anyone can read (public config only).
CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_settings_select_public"
  ON app_settings FOR SELECT USING (true);

CREATE POLICY "app_settings_write_admin"
  ON app_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Default Leaflet / OpenStreetMap tile config ───────────────────────────────
-- These values match the free OpenStreetMap tile layer used by Leaflet.
-- To switch providers (e.g. CartoDB, Stadia), update the values here or
-- override them with VITE_TILE_URL / VITE_TILE_ATTRIBUTION in your .env file.
INSERT INTO app_settings (key, value) VALUES
  ('tile_url',         'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
  ('tile_attribution', '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'),
  ('map_default_lat',  '9.0820'),   -- Nigeria geographic centre (approx.)
  ('map_default_lng',  '8.6753'),
  ('map_default_zoom', '6')
ON CONFLICT (key) DO NOTHING;  -- safe to re-run; won't overwrite custom values
