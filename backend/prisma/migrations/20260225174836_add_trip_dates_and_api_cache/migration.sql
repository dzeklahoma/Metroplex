/*
  Warnings:

  - Added the required column `startDate` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN "destinationLat" DOUBLE PRECISION;
ALTER TABLE "Trip" ADD COLUMN "destinationLng" DOUBLE PRECISION;
ALTER TABLE "Trip" ADD COLUMN "weatherDailyJson" JSONB;

-- startDate: add nullable first, backfill, then enforce NOT NULL
ALTER TABLE "Trip" ADD COLUMN "startDate" TIMESTAMP(3);

UPDATE "Trip"
SET "startDate" = COALESCE("createdAt", NOW())
WHERE "startDate" IS NULL;

ALTER TABLE "Trip" ALTER COLUMN "startDate" SET NOT NULL;