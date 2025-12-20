import express from "express";
import { prisma } from "../prisma.js"; // ✅ named import
import { requireAuth } from "../middleware/requireAuth.js";
import { generateItinerary } from "../services/planner.service.js";

const router = express.Router();

/**
 * POST /api/trips
 * Body: { destination, daysCount, budget, interests }
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { destination, daysCount, budget, interests } = req.body;

    // --- validation ---
    if (!destination || typeof destination !== "string") {
      return res.status(400).json({ message: "destination is required" });
    }

    const days = Number(daysCount);
    if (!Number.isInteger(days) || days < 1 || days > 30) {
      return res
        .status(400)
        .json({ message: "daysCount must be integer 1-30" });
    }

    const bud = Number(budget);
    if (Number.isNaN(bud) || bud < 0) {
      return res.status(400).json({ message: "budget must be a number >= 0" });
    }

    if (!interests || typeof interests !== "string") {
      return res
        .status(400)
        .json({ message: "interests is required (comma-separated)" });
    }

    // payload is userId
    const userId = req.user.userId;

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

      // create day plans 1..days
      for (let d = 1; d <= days; d++) {
        const dp = await tx.dayPlan.create({
          data: { tripId: trip.id, dayNumber: d },
        });
        dayPlans.push(dp);
      }

      // fill activities
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

      // return full trip with nested data
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

    // ✅ CREATE = 201
    return res.status(201).json({
      trip: savedTrip,
      warning: plan.warning,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
