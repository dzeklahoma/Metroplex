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

export type DayWeather = {
  date: string; // YYYY-MM-DD
  precipitationProbability?: number;
  precipitationMm?: number;
};

export type GenerateItineraryInput = {
  activities: Activity[];
  daysCount: number;
  interests: string;
  startDate: Date;
  weatherByDay?: DayWeather[];
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

function isOutdoor(activity: Activity): boolean {
  const type = (activity.type || "").toLowerCase();

  return (
    type.includes("outdoor") ||
    type.includes("nature") ||
    type.includes("park") ||
    type.includes("hiking") ||
    type.includes("beach")
  );
}

function scoreActivity(
  activity: Activity,
  interests: string[],
  isRainyDay: boolean,
): number {
  let score = 0;

  const type = (activity.type || "").toLowerCase();

  // Interest match
  for (const it of interests) {
    if (type.includes(it)) score += 3;
  }

  // Price scoring (lower = better)
  if (typeof activity.priceLevel === "number") {
    score += Math.max(0, 6 - activity.priceLevel);
  }

  // Ideal duration 1–3h
  if (typeof activity.durationHours === "number") {
    if (activity.durationHours >= 1 && activity.durationHours <= 3) {
      score += 2;
    }
  }

  // Weather penalty
  if (isRainyDay && isOutdoor(activity)) {
    score -= 3; // discourage outdoor on rain
  }

  return score;
}

/**
 * Generates itinerary grouped by days.
 * Weather affects scoring per day.
 */
export function generateItinerary({
  activities,
  daysCount,
  interests,
  startDate,
  weatherByDay,
}: GenerateItineraryInput): GenerateItineraryResult {
  const interestsArr = normalizeInterests(interests);

  const days: Activity[][] = Array.from({ length: daysCount }, () => []);
  const MAX_PER_DAY = 3;

  // IMPORTANT: avoid duplicates across days
  let remaining = [...activities];

  for (let dayIndex = 0; dayIndex < daysCount; dayIndex++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayIndex);

    const isoDate = currentDate.toISOString().split("T")[0];

    const weather = weatherByDay?.find((w) => w.date === isoDate);

    const isRainy =
      !!weather &&
      ((weather.precipitationProbability ?? 0) >= 50 ||
        (weather.precipitationMm ?? 0) >= 2);

    // On rainy days: prefer indoor if we have any indoor options left
    const indoor = remaining.filter((a) => !isOutdoor(a));
    const candidates = isRainy && indoor.length > 0 ? indoor : remaining;

    const picked = candidates
      .map((a) => ({ a, s: scoreActivity(a, interestsArr, isRainy) }))
      .sort((x, y) => y.s - x.s)
      .slice(0, MAX_PER_DAY)
      .map((x) => x.a);

    days[dayIndex] = picked;

    // Remove picked from remaining so they cannot appear again
    const pickedIds = new Set(picked.map((p) => p.id));
    remaining = remaining.filter((a) => !pickedIds.has(a.id));
  }

  const warning =
    activities.length === 0
      ? "No activities found for this destination."
      : activities.length < daysCount
        ? "Not enough activities for each day; some days may be sparse."
        : null;

  return { days, warning };
}
