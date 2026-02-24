import {
  generateItinerary,
  type Activity,
} from "../../services/planner.service";

function makeActivity(id: number, overrides: Partial<Activity> = {}): Activity {
  return {
    id,
    destination: "Paris",
    name: `A${id}`,
    type: "culture",
    durationHours: 2,
    priceLevel: 3,
    ...overrides,
  };
}

describe("generateItinerary (unit)", () => {
  test("returns exactly daysCount days (arrays)", () => {
    const activities = [makeActivity(1), makeActivity(2), makeActivity(3)];
    const res = generateItinerary({
      activities,
      daysCount: 3,
      interests: "culture",
    });

    expect(res.days).toHaveLength(3);
    for (const day of res.days) expect(Array.isArray(day)).toBe(true);
  });

  test("never places more than 3 activities per day", () => {
    const activities = Array.from({ length: 50 }, (_, i) =>
      makeActivity(i + 1),
    );
    const res = generateItinerary({
      activities,
      daysCount: 2,
      interests: "culture",
    });

    expect(res.days[0].length).toBeLessThanOrEqual(3);
    expect(res.days[1].length).toBeLessThanOrEqual(3);
  });

  test("does not duplicate activities across days (by id)", () => {
    const activities = Array.from({ length: 12 }, (_, i) =>
      makeActivity(i + 1),
    );
    const res = generateItinerary({
      activities,
      daysCount: 4,
      interests: "culture",
    });

    const all = res.days.flat();
    const ids = all.map((a) => a.id);
    const unique = new Set(ids);

    expect(unique.size).toBe(ids.length);
  });

  test("when activities is empty, warning is returned and days are empty arrays", () => {
    const res = generateItinerary({
      activities: [],
      daysCount: 3,
      interests: "culture",
    });

    expect(res.warning).toBe("No activities found for this destination.");
    expect(res.days).toHaveLength(3);
    expect(res.days.flat()).toHaveLength(0);
  });

  test("when activities.length < daysCount, warning is returned", () => {
    const activities = [makeActivity(1), makeActivity(2)];
    const res = generateItinerary({
      activities,
      daysCount: 5,
      interests: "culture",
    });

    expect(res.warning).toBe(
      "Not enough activities for each day; some days may be sparse.",
    );
    expect(res.days).toHaveLength(5);
  });

  test("fills days round-robin (balanced distribution) when enough activities", () => {
    const activities = Array.from({ length: 9 }, (_, i) => makeActivity(i + 1));
    const res = generateItinerary({
      activities,
      daysCount: 3,
      interests: "culture",
    });

    // Because MAX_PER_DAY=3, with 9 activities and 3 days -> each day should end up with 3
    expect(res.days.map((d) => d.length)).toEqual([3, 3, 3]);
  });
  test("prefers activities whose type matches interests (interest scoring)", () => {
    const activities: Activity[] = [
      makeActivity(1, {
        type: "culture museum",
        priceLevel: 5,
        durationHours: 2,
      }),
      makeActivity(2, { type: "nature park", priceLevel: 5, durationHours: 2 }),
      makeActivity(3, { type: "food market", priceLevel: 5, durationHours: 2 }),
    ];

    const resCulture = generateItinerary({
      activities,
      daysCount: 1,
      interests: "culture",
    });

    const resNature = generateItinerary({
      activities,
      daysCount: 1,
      interests: "nature",
    });

    // 1 day => max 3 items, order matters (ranked list is pushed in order)
    expect(resCulture.days[0][0].type?.toLowerCase()).toContain("culture");
    expect(resNature.days[0][0].type?.toLowerCase()).toContain("nature");
  });
});
