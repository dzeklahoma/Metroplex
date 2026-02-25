import { z } from "zod";

export const createTripSchema = z.object({
  destination: z.string().min(1),
  daysCount: z.coerce.number().int().min(1).max(30),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  budget: z
    .union([z.coerce.number().min(0), z.literal(""), z.null(), z.undefined()])
    .transform((v) => (v === "" || v === null || v === undefined ? null : v)),
  interests: z.string().min(1), // ✅ comma-separated string
});
