-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ── Hospitals ──────────────────────────────────────────────────────────────────
CREATE TABLE hospitals (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT    NOT NULL,
  address        TEXT    NOT NULL,
  city           TEXT    NOT NULL,
  lga            TEXT    NOT NULL,
  state          TEXT    NOT NULL,
  phone          TEXT    NOT NULL,
  email          TEXT,
  specialties    TEXT[]  NOT NULL DEFAULT '{}',
  ownership      TEXT    NOT NULL CHECK (ownership IN ('public', 'private')),
  visiting_hours TEXT,
  description    TEXT,  -- stored as Markdown
  image_url      TEXT,
  latitude       DOUBLE PRECISION NOT NULL,
  longitude      DOUBLE PRECISION NOT NULL,
  -- Coordinates are stored in WGS84 (EPSG:4326) — the same system used by
  -- Leaflet and OpenStreetMap, so no projection conversion is needed client-side.
  location       GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (ST_MakePoint(longitude, latitude)) STORED,
  rating_avg     NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count   INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Profiles (extends auth.users) ─────────────────────────────────────────────
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email        TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  display_name TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Reviews ────────────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL REFERENCES hospitals ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body        TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (hospital_id, user_id)  -- one review per user per hospital
);

-- Auto-update rating_avg and rating_count on reviews table change
CREATE OR REPLACE FUNCTION refresh_hospital_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE hospitals
  SET
    rating_avg   = COALESCE((SELECT AVG(rating) FROM reviews WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id) AND status = 'approved'), 0),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id) AND status = 'approved'),
    updated_at   = now()
  WHERE id = COALESCE(NEW.hospital_id, OLD.hospital_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION refresh_hospital_rating();

-- ── PostGIS radius search RPC ──────────────────────────────────────────────────
-- Used by useHospitals.ts to power the "sort by proximity" feature.
-- Returns hospitals ordered by distance from the user's coordinates.
CREATE OR REPLACE FUNCTION hospitals_within_radius(lat FLOAT, lng FLOAT, radius_km FLOAT)
RETURNS SETOF hospitals LANGUAGE sql STABLE AS $$
  SELECT *
  FROM hospitals
  WHERE ST_DWithin(
    location,
    ST_MakePoint(lng, lat)::geography,
    radius_km * 1000  -- convert km to metres
  )
  ORDER BY ST_Distance(location, ST_MakePoint(lng, lat)::geography);
$$;

-- ── GeoJSON export helper ──────────────────────────────────────────────────────
-- Returns a GeoJSON FeatureCollection of all hospitals.
-- Useful for bulk-loading markers into a Leaflet map via L.geoJSON().
CREATE OR REPLACE FUNCTION hospitals_geojson()
RETURNS json LANGUAGE sql STABLE AS $$
  SELECT json_build_object(
    'type', 'FeatureCollection',
    'features', json_agg(
      json_build_object(
        'type',       'Feature',
        'geometry',   ST_AsGeoJSON(location)::json,
        'properties', json_build_object(
          'id',           id,
          'name',         name,
          'city',         city,
          'state',        state,
          'phone',        phone,
          'ownership',    ownership,
          'specialties',  specialties,
          'rating_avg',   rating_avg,
          'rating_count', rating_count
        )
      )
    )
  )
  FROM hospitals;
$$;
