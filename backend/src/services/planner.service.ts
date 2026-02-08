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

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

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

  const scored = activities.map((a) => ({
    a,
    s: scoreActivity(a, interestsArr),
  }));

  // sort by score desc
  scored.sort((x, y) => y.s - x.s);

  // take top pool (npr. 12 ili 20, zavisi koliko imaš aktivnosti)
  const POOL = Math.min(scored.length, 20);
  const pool = scored.slice(0, POOL);
  const rest = scored.slice(POOL);

  // shuffle only the top pool to get variation but keep quality
  shuffleInPlace(pool);

  // final ranked list: shuffled top + rest (still sorted)
  const ranked = [...activities].sort((a, b) => {
    const sb = scoreActivity(b, interestsArr);
    const sa = scoreActivity(a, interestsArr);
    const diff = sb - sa;
    return diff !== 0 ? diff : Math.random() - 0.5;
  });

  // round-robin distribution (by days) with per-day limit
  const days = Array.from({ length: daysCount }, () => [] as Activity[]);
  const MAX_PER_DAY = 3;

  let idx = 0;

  for (const act of ranked) {
    // try to place activity into a day that is not full
    let attempts = 0;

    while (attempts < daysCount) {
      if (days[idx].length < MAX_PER_DAY) {
        days[idx].push(act);
        idx = (idx + 1) % daysCount;
        break;
      }

      idx = (idx + 1) % daysCount;
      attempts++;
    }

    // if all days are full, stop placing activities
    if (attempts === daysCount) {
      break;
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
