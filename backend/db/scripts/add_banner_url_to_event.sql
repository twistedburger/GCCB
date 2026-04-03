-- Save banner urls, save placeId to update banner_url when url expires
ALTER TABLE "event" ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE "event" ADD COLUMN IF NOT EXISTS place_id VARCHAR(50);

UPDATE event SET place_id = 'ChIJ4S7wxnhxhlQRFGfmMvQ74LQ' WHERE id = 1;
UPDATE event SET place_id = 'ChIJnZHwi2NxhlQRN3CYHzc3giE' WHERE id = 2;
UPDATE event SET place_id = 'ChIJ5f5T_SF3hlQRnRB6ZAeyWjU' WHERE id = 3;
