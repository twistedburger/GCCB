-- Enable PostGIS extension for location filtering
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography columns to event and route tables. 
-- Can find route destination_geog by using parent event location_geog.
ALTER TABLE event ADD COLUMN IF NOT EXISTS location_geog geography(POINT, 4326);
ALTER TABLE route ADD COLUMN IF NOT EXISTS origin_geog geography(POINT, 4326);

-- Edit the geog columns for event and route tables for pre-existing rows.
-- 555 Seymour St, Vancouver, BC V6B 3H6
UPDATE event SET location_geog = ST_SetSRID(ST_MakePoint(-123.11528, 49.28341), 4326) WHERE id = 1;
-- Science World
UPDATE event SET location_geog = ST_SetSRID(ST_MakePoint(-123.10376, 49.27325), 4326) WHERE id = 2;
-- BCIT Burnaby Campus
UPDATE event SET location_geog = ST_SetSRID(ST_MakePoint(-123.0017, 49.2505), 4326) WHERE id = 3;
UPDATE route SET origin_geog = ST_SetSRID(ST_MakePoint(-123.1558, 49.2662), 4326) WHERE id = 1;
-- 3768 Welwyn St, Vancouver, BC V5N 3Y8
UPDATE route SET origin_geog = ST_SetSRID(ST_MakePoint(-123.0565, 49.2458), 4326) WHERE id = 2;
-- Waterfront Station, Vancouver
UPDATE route SET origin_geog = ST_SetSRID(ST_MakePoint(-123.1115, 49.2856), 4326) WHERE id = 3;
UPDATE route SET origin_geog = ST_SetSRID(ST_MakePoint(-123.0034, 49.2276), 4326) WHERE id = 4;

-- Create GiST index on geog columns to ensure efficient searches
CREATE INDEX event_geog_idx ON event USING gist(location_geog);
CREATE INDEX route_geog_idx ON route USING gist(origin_geog);