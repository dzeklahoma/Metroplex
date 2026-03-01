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
    // Prefer matching by date (YYYY-MM-DD), but fall back to index alignment.
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayIndex);

    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dd = String(currentDate.getDate()).padStart(2, "0");
    const isoDate = `${yyyy}-${mm}-${dd}`;

    let weather = weatherByDay?.find((w) => w.date === isoDate);

    // ✅ Fallback: some tests provide weatherByDay aligned by day index
    if (!weather && Array.isArray(weatherByDay) && weatherByDay[dayIndex]) {
      weather = weatherByDay[dayIndex];
    }

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
  // 2.5) On rainy days, reorder that day's picks to put indoor first
  for (let dayIndex = 0; dayIndex < daysCount; dayIndex++) {
    if (!isRainyDayIndex(dayIndex)) continue;

    const list = days[dayIndex];
    if (list.length === 0) continue;

    days[dayIndex] = [...list].sort((a, b) => {
      const aOut = isOutdoor(a) ? 1 : 0; // indoor first
      const bOut = isOutdoor(b) ? 1 : 0;
      if (aOut !== bOut) return aOut - bOut;

      // tie-break: prefer higher rainy score
      const sa = scoreActivity(a, interestsArr, true);
      const sb = scoreActivity(b, interestsArr, true);
      return sb - sa;
    });
  }
  // 3) Weather-aware refinement (cross-day swaps):
  // If a day is rainy, swap out outdoor items with indoor items that are already
  // assigned on other days (so we don't rely on "remainingPool" being non-empty).
  for (let dayIndex = 0; dayIndex < daysCount; dayIndex++) {
    if (!isRainyDayIndex(dayIndex)) continue;

    const rainyDay = days[dayIndex];
    if (rainyDay.length === 0) continue;
    // Ensure first slot is indoor on rainy days if any indoor exists anywhere
    if (rainyDay[0] && isOutdoor(rainyDay[0])) {
      let bestFirst: {
        fromDay: number;
        fromIndex: number;
        a: Activity;
        score: number;
      } | null = null;

      for (let otherDay = 0; otherDay < daysCount; otherDay++) {
        if (otherDay === dayIndex) continue;

        const list = days[otherDay];
        for (let j = 0; j < list.length; j++) {
          const cand = list[j];
          if (isOutdoor(cand)) continue;

          const s = scoreActivity(cand, interestsArr, true);
          if (!bestFirst || s > bestFirst.score) {
            bestFirst = { fromDay: otherDay, fromIndex: j, a: cand, score: s };
          }
        }
      }

      if (bestFirst) {
        const out = rainyDay[0];
        rainyDay[0] = bestFirst.a;
        days[bestFirst.fromDay][bestFirst.fromIndex] = out;
      }
    }

    for (let i = 0; i < rainyDay.length; i++) {
      const current = rainyDay[i];
      if (!isOutdoor(current)) continue;

      // Find the best indoor candidate from other days to swap in
      let best: {
        fromDay: number;
        fromIndex: number;
        a: Activity;
        score: number;
      } | null = null;

      for (let otherDay = 0; otherDay < daysCount; otherDay++) {
        if (otherDay === dayIndex) continue;

        const list = days[otherDay];
        for (let j = 0; j < list.length; j++) {
          const cand = list[j];
          if (isOutdoor(cand)) continue;

          const s = scoreActivity(cand, interestsArr, true); // rainy scoring
          if (!best || s > best.score) {
            best = { fromDay: otherDay, fromIndex: j, a: cand, score: s };
          }
        }
      }

      if (!best) break; // no indoor anywhere → can't improve

      // Swap: indoor into rainy day, outdoor goes to the other day
      rainyDay[i] = best.a;
      days[best.fromDay][best.fromIndex] = current;
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
