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

  // Helper: compute rainy per day index
  function isRainyDayIndex(dayIndex: number): boolean {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayIndex);
    const isoDate = currentDate.toISOString().split("T")[0];

    const weather = weatherByDay?.find((w) => w.date === isoDate);
    if (!weather) return false;

    return (
      (weather.precipitationProbability ?? 0) >= 50 ||
      (weather.precipitationMm ?? 0) >= 2
    );
  }

  // 1) Rank all activities once (baseline: not rainy) so "best" ones get spread out
  const ranked = [...activities]
    .map((a) => ({ a, s: scoreActivity(a, interestsArr, false) }))
    .sort((x, y) => y.s - x.s)
    .map((x) => x.a);

  // 2) Spread across days with round-robin and a per-day cap
  for (const a of ranked) {
    // Find the day with the smallest load that still has room
    let bestDay = -1;
    let bestLen = Number.POSITIVE_INFINITY;

    for (let d = 0; d < daysCount; d++) {
      if (days[d].length >= MAX_PER_DAY) continue;
      if (days[d].length < bestLen) {
        bestLen = days[d].length;
        bestDay = d;
      }
    }

    if (bestDay === -1) break; // all days full
    days[bestDay].push(a);
  }

  // 3) Weather-aware refinement:
  // If a day is rainy, try to swap outdoor items with better indoor items
  // that are not already used in any day.
  const usedIds = new Set<number>();
  for (const day of days) for (const a of day) usedIds.add(a.id);

  const remainingPool = ranked.filter((a) => !usedIds.has(a.id));

  for (let dayIndex = 0; dayIndex < daysCount; dayIndex++) {
    if (!isRainyDayIndex(dayIndex)) continue;

    const dayList = days[dayIndex];
    if (dayList.length === 0) continue;

    // Find indoor candidates we could swap in
    const indoorCandidates = remainingPool.filter((a) => !isOutdoor(a));
    if (indoorCandidates.length === 0) continue;

    // For each outdoor item currently planned, swap with best indoor candidate
    for (let i = 0; i < dayList.length; i++) {
      const current = dayList[i];
      if (!isOutdoor(current)) continue;

      // Pick best indoor candidate for rainy day
      const bestIndoor = indoorCandidates
        .map((a) => ({ a, s: scoreActivity(a, interestsArr, true) }))
        .sort((x, y) => y.s - x.s)[0]?.a;

      if (!bestIndoor) break;

      // Perform swap
      dayList[i] = bestIndoor;

      // Update remaining pool:
      // put swapped-out outdoor back into remainingPool, remove swapped-in indoor
      const inId = bestIndoor.id;
      const outId = current.id;

      // remove inId from remainingPool
      const idxIn = remainingPool.findIndex((a) => a.id === inId);
      if (idxIn !== -1) remainingPool.splice(idxIn, 1);

      // add outId back if it isn't already in remainingPool
      if (!remainingPool.some((a) => a.id === outId))
        remainingPool.push(current);
    }
  }

  const warning =
    activities.length === 0
      ? "No activities found for this destination."
      : activities.length < daysCount
        ? "Not enough activities for each day; some days may be sparse."
        : null;

  return { days, warning };
}
