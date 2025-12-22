import { Router, Request, Response } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { generateItinerary } from "../services/planner.service.js";

const router = Router();

type CreateTripBody = {
  destination?: string;
  daysCount?: number | string;
  budget?: number | string;
  interests?: string;
};

router.post(
  "/",
  requireAuth,
  async (req: Request<{}, {}, CreateTripBody>, res: Response) => {
    try {
      const { destination, daysCount, budget, interests } = req.body;

      if (!destination || typeof destination !== "string") {
        return res.status(400).json({ message: "destination is required" });
      }

      const days = Number(daysCount);
      if (!Number.isInteger(days) || days < 1 || days > 30) {
        return res
          .status(400)
          .json({ message: "daysCount must be integer 1-30" });
      }

      let bud: number | null = null;
      if (budget !== undefined && budget !== null && budget !== "") {
        const parsed = Number(budget);
        if (Number.isNaN(parsed) || parsed < 0) {
          return res
            .status(400)
            .json({ message: "budget must be a number >= 0" });
        }
        bud = parsed;
      }

      if (!interests || typeof interests !== "string") {
        return res
          .status(400)
          .json({ message: "interests is required (comma-separated)" });
      }

      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      // 1) create Trip
      const trip = await prisma.trip.create({
        data: {
          userId,
          destination,
          daysCount: days,
          budget: bud,
          interests,
        },
      });

      // 2) fetch activities for destination
      const activities = await prisma.activity.findMany({
        where: { destination },
      });

      // 3) generate plan in memory
      const plan = generateItinerary({
        activities,
        daysCount: days,
        interests,
      });

      // 4) persist DayPlan + PlannedActivity in transaction
      const savedTrip = await prisma.$transaction(async (tx) => {
        const dayPlans = [];

        for (let d = 1; d <= days; d++) {
          const dp = await tx.dayPlan.create({
            data: { tripId: trip.id, dayNumber: d },
          });
          dayPlans.push(dp);
        }

        for (let d = 1; d <= days; d++) {
          const dp = dayPlans[d - 1];
          const dayItems = plan.days[d - 1] ?? [];

          for (let i = 0; i < dayItems.length; i++) {
            await tx.plannedActivity.create({
              data: {
                dayPlanId: dp.id,
                activityId: dayItems[i].id,
                orderIndex: i + 1,
              },
            });
          }
        }

        return tx.trip.findUnique({
          where: { id: trip.id },
          include: {
            dayPlans: {
              orderBy: { dayNumber: "asc" },
              include: {
                plannedActivities: {
                  orderBy: { orderIndex: "asc" },
                  include: { activity: true },
                },
              },
            },
          },
        });
      });

      return res.status(201).json({
        trip: savedTrip,
        warning: plan.warning,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
