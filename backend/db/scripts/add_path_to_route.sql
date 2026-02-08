-- Add path column to route table and update existing rows to have default value
ALTER TABLE "route"
ADD COLUMN IF NOT EXISTS path VARCHAR(1000) NOT NULL DEFAULT '';
UPDATE "route"
SET path = ''
WHERE path IS NULL;