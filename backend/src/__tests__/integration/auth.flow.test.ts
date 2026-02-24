import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../prisma";

function uniqEmail() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.com`;
}

describe("integration: auth flow", () => {
  beforeAll(async () => {
    // nothing here; DB reset will be done via npm script
  });

  test("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  test("register -> login returns JWT", async () => {
    const email = uniqEmail();
    const password = "TestPass123!";

    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email, password });
    expect([200, 201]).toContain(reg.status);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    expect(login.status).toBe(200);

    // be flexible: depending on your controller response shape
    const token =
      login.body?.token || login.body?.accessToken || login.body?.jwt || null;

    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
