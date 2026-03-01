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

function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seedStr: string): T[] {
  const seedFn = xmur3(seedStr);
  const rand = mulberry32(seedFn());
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

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
 *
 * IMPORTANT:
 * - We filter out template/invalid activities by requiring coordinates.
 *   This prevents template items from ever being scheduled.
 */
export function generateItinerary({
  activities,
  daysCount,
  interests,
  startDate,
  weatherByDay,
}: GenerateItineraryInput): GenerateItineraryResult {
  const interestsArr = normalizeInterests(interests);

  // ✅ Filter out template activities (they have null coords in your DB)
  const usable = activities.filter(
    (a) =>
      a.latitude !== null &&
      a.latitude !== undefined &&
      a.longitude !== null &&
      a.longitude !== undefined,
  );

  const days: Activity[][] = Array.from({ length: daysCount }, () => []);
  const MAX_PER_DAY = 3;

  function isRainyDayIndex(dayIndex: number): boolean {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayIndex);

    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dd = String(currentDate.getDate()).padStart(2, "0");
    const isoDate = `${yyyy}-${mm}-${dd}`;

    let weather = weatherByDay?.find((w) => w.date === isoDate);

    // fallback: tests may align by index
    if (!weather && Array.isArray(weatherByDay) && weatherByDay[dayIndex]) {
      weather = weatherByDay[dayIndex];
    }

    if (!weather) return false;

    return (
      (weather.precipitationProbability ?? 0) >= 50 ||
      (weather.precipitationMm ?? 0) >= 2
    );
  }
  // Make regenerate produce a different (but still good) plan each call.
  // If you want different result per call, include time in seed.
  const seed = `${startDate.toISOString()}|${interests}|${Date.now()}`;

  // shuffle first, then score+sort (keeps quality but avoids identical outputs)
  const shuffled = seededShuffle(usable, seed);
  // 1) Rank all usable activities once (baseline: not rainy)
  const ranked = shuffled
    .map((a) => ({ a, s: scoreActivity(a, interestsArr, false) }))
    .sort((x, y) => y.s - x.s || Math.random() - 0.5)
    .map((x) => x.a);

  // 2) Spread across days with round-robin and a per-day cap
  for (const a of ranked) {
    let bestDay = -1;
    let bestLen = Number.POSITIVE_INFINITY;

    for (let d = 0; d < daysCount; d++) {
      if (days[d].length >= MAX_PER_DAY) continue;
      if (days[d].length < bestLen) {
        bestLen = days[d].length;
        bestDay = d;
      }
    }

    if (bestDay === -1) break;
    days[bestDay].push(a);
  }

  // 2.5) On rainy days, reorder that day's picks to put indoor first
  for (let dayIndex = 0; dayIndex < daysCount; dayIndex++) {
    if (!isRainyDayIndex(dayIndex)) continue;

    const list = days[dayIndex];
    if (list.length === 0) continue;

    days[dayIndex] = [...list].sort((a, b) => {
      const aOut = isOutdoor(a) ? 1 : 0;
      const bOut = isOutdoor(b) ? 1 : 0;
      if (aOut !== bOut) return aOut - bOut;

      const sa = scoreActivity(a, interestsArr, true);
      const sb = scoreActivity(b, interestsArr, true);
      return sb - sa;
    });
  }

  // 3) Weather-aware refinement (cross-day swaps)
  for (let dayIndex = 0; dayIndex < daysCount; dayIndex++) {
    if (!isRainyDayIndex(dayIndex)) continue;

    const rainyDay = days[dayIndex];
    if (rainyDay.length === 0) continue;

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

          const s = scoreActivity(cand, interestsArr, true);
          if (!best || s > best.score) {
            best = { fromDay: otherDay, fromIndex: j, a: cand, score: s };
          }
        }
      }

      if (!best) break;

      rainyDay[i] = best.a;
      days[best.fromDay][best.fromIndex] = current;
    }
  }

  // ✅ Warning logic: if original had activities but none are usable (coords missing),
  // show a clear message; otherwise keep your original warnings.
  const warning =
    activities.length === 0
      ? "No activities found for this destination."
      : usable.length === 0
        ? "No mappable activities found (missing coordinates)."
        : usable.length < daysCount
          ? "Not enough activities for each day; some days may be sparse."
          : null;

  return { days, warning };
}
