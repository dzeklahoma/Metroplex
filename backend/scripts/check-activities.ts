import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

async function main() {
  const total = await prisma.activity.count();
  console.log("Total activities:", total);

  const ny = await prisma.activity.findMany({
    where: { destination: "New York" },
    select: { name: true, latitude: true, longitude: true },
    take: 10,
    orderBy: { id: "desc" },
  });

  console.log("\nLatest New York activities:");
  console.table(ny);

  const nyWithLat = await prisma.activity.count({
    where: {
      destination: "New York",
      latitude: { not: null },
      longitude: { not: null },
    },
  });

  console.log("\nNew York with coordinates:", nyWithLat);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
