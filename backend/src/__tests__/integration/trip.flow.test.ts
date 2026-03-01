import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../prisma";

// 🔥 Mock external APIs
jest.mock("../../services/geocoding.service", () => ({
  geocodeDestination: jest.fn(async () => ({
    lat: 48.8566,
    lng: 2.3522,
  })),
}));

jest.mock("../../services/weather.service", () => ({
  getDailyForecast: jest.fn(async () => [
    { date: "2026-07-01", precipitationProbability: 10, precipitationMm: 0 },
    { date: "2026-07-02", precipitationProbability: 80, precipitationMm: 5 },
    { date: "2026-07-03", precipitationProbability: 20, precipitationMm: 0 },
  ]),
}));

function uniqEmail() {
  return `trip_${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.com`;
}

describe("integration: trip flow", () => {
  let token: string;
  let tripId: number;

  beforeAll(async () => {
    await prisma.activity.createMany({
      data: [
        {
          destination: "Paris",
          name: "Louvre Museum",
          type: "culture museum",
          durationHours: 2,
          priceLevel: 3,
          latitude: 48.8606,
          longitude: 2.3376,
        },
        {
          destination: "Paris",
          name: "Eiffel Tower",
          type: "culture landmark",
          durationHours: 2,
          priceLevel: 2,
          latitude: 48.8584,
          longitude: 2.2945,
        },
        {
          destination: "Paris",
          name: "Luxembourg Gardens",
          type: "nature park",
          durationHours: 2,
          priceLevel: 1,
          latitude: 48.8462,
          longitude: 2.3371,
        },
      ],
      skipDuplicates: true,
    });

    const email = uniqEmail();
    const password = "TestPass123!";

    await request(app).post("/api/auth/register").send({ email, password });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    token = login.body.token;
    expect(typeof token).toBe("string");
  });

  test("create trip persists dayPlans and plannedActivities", async () => {
    const res = await request(app)
      .post("/api/trips")
      .set("Authorization", `Bearer ${token}`)
      .send({
        destination: "Paris",
        daysCount: 3,
        interests: "culture",
        budget: 1000,
        startDate: "2026-07-01",
      });

    expect(res.status).toBe(201);
    expect(res.body.trip).toHaveProperty("id");

    tripId = res.body.trip.id;

    expect(res.body.trip.dayPlans).toHaveLength(3);

    const totalPlanned = res.body.trip.dayPlans.reduce(
      (sum: number, dp: any) => sum + (dp.plannedActivities?.length ?? 0),
      0,
    );

    expect(totalPlanned).toBeGreaterThan(0);
    expect(res.body.warning).toBeNull();
  });

  test("regenerate trip returns trip with refreshed dayPlans", async () => {
    const res = await request(app)
      .post(`/api/trips/${tripId}/regenerate`)
      .set("Authorization", `Bearer ${token}`)
      .send({ interests: "nature" });

    expect(res.status).toBe(200);
    expect(res.body.trip.dayPlans).toHaveLength(3);

    const totalPlanned = res.body.trip.dayPlans.reduce(
      (sum: number, dp: any) => sum + (dp.plannedActivities?.length ?? 0),
      0,
    );
    expect(totalPlanned).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
