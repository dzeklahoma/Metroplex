/*
  Warnings:

  - A unique constraint covering the columns `[tripId,dayNumber]` on the table `DayPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "PlannedActivity" DROP CONSTRAINT "PlannedActivity_activityId_fkey";

-- AlterTable
ALTER TABLE "Trip" ALTER COLUMN "budget" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Activity_destination_idx" ON "Activity"("destination");

-- CreateIndex
CREATE INDEX "DayPlan_tripId_idx" ON "DayPlan"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "DayPlan_tripId_dayNumber_key" ON "DayPlan"("tripId", "dayNumber");

-- CreateIndex
CREATE INDEX "PlannedActivity_activityId_idx" ON "PlannedActivity"("activityId");

-- CreateIndex
CREATE INDEX "Trip_userId_idx" ON "Trip"("userId");

-- AddForeignKey
ALTER TABLE "PlannedActivity" ADD CONSTRAINT "PlannedActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
