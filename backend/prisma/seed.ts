import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { activities } from "./activities.seed.js";

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

async function main() {
  await prisma.activity.createMany({
    data: activities.map(toActivityData),
    skipDuplicates: true, // zbog @@unique(destination, name)
  });

  console.log(`Seeded ${activities.length} activities.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
