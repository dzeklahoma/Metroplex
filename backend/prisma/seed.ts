import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { activities } from "./activities.seed";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

function toActivityData(a: (typeof activities)[number]) {
  return {
    destination: a.destination,
    name: a.name,
    type: a.type,
    durationHours: a.durationHours,
    priceLevel: a.priceLevel,
    latitude: a.latitude ?? null,
    longitude: a.longitude ?? null,
  };
}

async function seedUsers() {
  const users = [
    { email: "user@gmail.com", password: "User12345!", role: "USER" as const },
    {
      email: "editor@gmail.com",
      password: "Editor12345!",
      role: "EDITOR" as const,
    },
    {
      email: "admin@gmail.com",
      password: "Admin12345!",
      role: "ADMIN" as const,
    },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);

    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, passwordHash },
      create: { email: u.email, role: u.role, passwordHash },
    });
  }

  console.log("Seeded users: user/editor/admin");
}

async function seedActivities() {
  for (const a of activities) {
    await prisma.activity.upsert({
      where: {
        destination_name: {
          destination: a.destination,
          name: a.name,
        },
      },
      update: {
        type: a.type,
        durationHours: a.durationHours,
        priceLevel: a.priceLevel,
        latitude: a.latitude ?? null,
        longitude: a.longitude ?? null,
      },
      create: toActivityData(a),
    });
  }

  console.log(`Upserted ${activities.length} activities.`);
}

async function main() {
  await seedUsers();
  await seedActivities();
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
