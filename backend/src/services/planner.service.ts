export type Activity = {
  id: number;
  destination?: string;
  name?: string;
  type?: string | null;
  durationHours?: number | null;
  priceLevel?: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type GenerateItineraryInput = {
  activities: Activity[];
  daysCount: number;
  interests: string;
};

export type GenerateItineraryResult = {
  days: Activity[][];
  warning: string | null;
};

function normalizeInterests(interestsStr: string): string[] {
  return interestsStr
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function scoreActivity(activity: Activity, interests: string[]): number {
  let score = 0;

  const type = (activity.type || "").toLowerCase();

  // interest match: interest keyword u type
  for (const it of interests) {
    if (type.includes(it)) score += 3;
  }

  // price: lower priceLevel = better
  if (typeof activity.priceLevel === "number") {
    score += Math.max(0, 6 - activity.priceLevel); // 1=>+5, 5=>+1
  }

  // duration: ideal 1-3h
  if (typeof activity.durationHours === "number") {
    if (activity.durationHours >= 1 && activity.durationHours <= 3) score += 2;
  }

  return score;
}

/**
 * returns { days: Activity[][], warning: string|null }
 */
export function generateItinerary({
  activities,
  daysCount,
  interests,
}: GenerateItineraryInput): GenerateItineraryResult {
  const interestsArr = normalizeInterests(interests);

  const ranked = [...activities].sort((a, b) => {
    const sb = scoreActivity(b, interestsArr);
    const sa = scoreActivity(a, interestsArr);
    return sb - sa;
  });

  // round-robin distribution (by days)
  const days = Array.from({ length: daysCount }, () => [] as Activity[]);
  let idx = 0;

  for (const act of ranked) {
    days[idx].push(act);
    idx = (idx + 1) % daysCount;
  }

  const warning =
    activities.length === 0
      ? "No activities found for this destination."
      : activities.length < daysCount
      ? "Not enough activities for each day; some days may be sparse."
      : null;

  return { days, warning };
}
