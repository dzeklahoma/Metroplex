import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../prisma";

function uniqEmail(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.com`;
}

async function registerAndLogin(prefix: string) {
  const email = uniqEmail(prefix);
  const password = "TestPass123!";

  await request(app).post("/api/auth/register").send({ email, password });

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return { email, token: login.body.token as string };
}

describe("integration: IDOR / ownership checks", () => {
  let tokenA: string;
  let tokenB: string;
  let tripId: number;

  beforeAll(async () => {
    // Seed minimal activities so trip creation succeeds meaningfully
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
      ],
      skipDuplicates: true,
    });

    const a = await registerAndLogin("userA");
    const b = await registerAndLogin("userB");

    tokenA = a.token;
    tokenB = b.token;

    // User A creates a trip
    const created = await request(app)
      .post("/api/trips")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        destination: "Paris",
        daysCount: 2,
        interests: "culture",
        budget: 200,
        startDate: "2026-07-01",
      });

    expect(created.status).toBe(201);
    tripId = created.body.trip.id;
  });

  test("User B cannot GET User A trip details (403)", async () => {
    const res = await request(app)
      .get(`/api/trips/${tripId}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden");
  });

  test("User B cannot regenerate User A trip (403)", async () => {
    const res = await request(app)
      .post(`/api/trips/${tripId}/regenerate`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ interests: "nature" });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
