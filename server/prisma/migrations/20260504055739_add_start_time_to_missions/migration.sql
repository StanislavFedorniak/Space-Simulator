-- Rename the existing mission name column to title.
ALTER TABLE "Mission" RENAME COLUMN "name" TO "title";

-- Backfill nullable mission descriptions before making the column required.
UPDATE "Mission"
SET "description" = ''
WHERE "description" IS NULL;

-- Add the required start time with a safe default for existing rows.
ALTER TABLE "Mission"
ADD COLUMN "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Keep the schema required without leaving a persistent default in place.
ALTER TABLE "Mission"
ALTER COLUMN "startTime" DROP DEFAULT;

ALTER TABLE "Mission"
ALTER COLUMN "description" SET NOT NULL;
