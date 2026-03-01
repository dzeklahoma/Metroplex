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

const START_DATE = new Date("2026-07-01T00:00:00.000Z");

describe("generateItinerary (unit)", () => {
  test("returns exactly daysCount days (arrays)", () => {
    const activities = [makeActivity(1), makeActivity(2), makeActivity(3)];

    const res = generateItinerary({
      activities,
      daysCount: 3,
      interests: "nature",
      startDate: START_DATE,
    });

    expect(res.days).toHaveLength(3);
    for (const day of res.days) {
      expect(Array.isArray(day)).toBe(true);
    }
  });

  test("never places more than 3 activities per day", () => {
    const activities = Array.from({ length: 50 }, (_, i) =>
      makeActivity(i + 1),
    );
    const res = generateItinerary({
      activities,
      daysCount: 2,
      interests: "culture",
      startDate: START_DATE,
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
      startDate: START_DATE,
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
      startDate: START_DATE,
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
      startDate: START_DATE,
    });

    expect(res.warning).toBe(
      "Not enough activities for each day; some days may be sparse.",
    );
    expect(res.days).toHaveLength(5);
  });

  test("prefers activities whose type matches interests", () => {
    const activities: Activity[] = [
      makeActivity(1, { type: "culture museum" }),
      makeActivity(2, { type: "nature park" }),
      makeActivity(3, { type: "food market" }),
    ];

    const resCulture = generateItinerary({
      activities,
      daysCount: 1,
      interests: "culture",
      startDate: START_DATE,
    });

    const resNature = generateItinerary({
      activities,
      daysCount: 1,
      interests: "nature",
      startDate: START_DATE,
    });

    expect(resCulture.days[0][0].type?.toLowerCase()).toContain("culture");
    expect(resNature.days[0][0].type?.toLowerCase()).toContain("nature");
  });

  test("discourages outdoor activities on rainy day", () => {
    const activities: Activity[] = [
      makeActivity(1, { type: "nature park" }), // outdoor
      makeActivity(2, { type: "culture museum" }), // indoor
    ];

    const res = generateItinerary({
      activities,
      daysCount: 1,
      interests: "nature",
      startDate: START_DATE,
      weatherByDay: [
        {
          date: "2026-07-01",
          precipitationProbability: 80,
          precipitationMm: 5,
        },
      ],
    });

    expect(res.days[0][0].type?.toLowerCase()).not.toContain("nature");
  });
});
