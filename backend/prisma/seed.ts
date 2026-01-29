import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const activities: Prisma.ActivityCreateInput[] = [
  // PARIS
  {
    destination: "Paris",
    name: "Louvre Museum",
    type: "culture",
    durationHours: 3,
    priceLevel: 3,
    latitude: 48.8606,
    longitude: 2.3376,
  },
  {
    destination: "Paris",
    name: "Eiffel Tower",
    type: "culture",
    durationHours: 2,
    priceLevel: 3,
    latitude: 48.8584,
    longitude: 2.2945,
  },
  {
    destination: "Paris",
    name: "Montmartre Walk",
    type: "nature",
    durationHours: 2,
    priceLevel: 1,
    latitude: 48.8867,
    longitude: 2.3431,
  },
  {
    destination: "Paris",
    name: "Seine River Cruise",
    type: "entertainment",
    durationHours: 1.5,
    priceLevel: 2,
    latitude: 48.8589,
    longitude: 2.3,
  },
  {
    destination: "Paris",
    name: "French Pastry Tasting",
    type: "gastronomy",
    durationHours: 1.5,
    priceLevel: 2,
    latitude: 48.853,
    longitude: 2.3499,
  },

  // ROME
  {
    destination: "Rome",
    name: "Colosseum",
    type: "culture",
    durationHours: 2,
    priceLevel: 3,
    latitude: 41.8902,
    longitude: 12.4922,
  },
  {
    destination: "Rome",
    name: "Vatican Museums",
    type: "culture",
    durationHours: 3,
    priceLevel: 3,
    latitude: 41.9065,
    longitude: 12.4536,
  },
  {
    destination: "Rome",
    name: "Trastevere Food Tour",
    type: "gastronomy",
    durationHours: 3,
    priceLevel: 3,
    latitude: 41.887,
    longitude: 12.4663,
  },
  {
    destination: "Rome",
    name: "Villa Borghese Park",
    type: "nature",
    durationHours: 2,
    priceLevel: 1,
    latitude: 41.9142,
    longitude: 12.4923,
  },
  {
    destination: "Rome",
    name: "Trevi Fountain Visit",
    type: "entertainment",
    durationHours: 1,
    priceLevel: 1,
    latitude: 41.9009,
    longitude: 12.4833,
  },

  // BELGRADE
  {
    destination: "Belgrade",
    name: "Kalemegdan Fortress",
    type: "culture",
    durationHours: 2,
    priceLevel: 1,
    latitude: 44.8231,
    longitude: 20.4506,
  },
  {
    destination: "Belgrade",
    name: "Skadarlija Dinner",
    type: "gastronomy",
    durationHours: 2,
    priceLevel: 2,
    latitude: 44.8176,
    longitude: 20.4656,
  },
  {
    destination: "Belgrade",
    name: "Ada Ciganlija",
    type: "nature",
    durationHours: 3,
    priceLevel: 1,
    latitude: 44.7871,
    longitude: 20.411,
  },
  {
    destination: "Belgrade",
    name: "Zemun Riverside Walk",
    type: "nature",
    durationHours: 2,
    priceLevel: 1,
    latitude: 44.8431,
    longitude: 20.41,
  },
  {
    destination: "Belgrade",
    name: "Nightlife River Clubs",
    type: "entertainment",
    durationHours: 4,
    priceLevel: 2,
    latitude: 44.815,
    longitude: 20.437,
  },

  // LONDON
  {
    destination: "London",
    name: "British Museum",
    type: "culture",
    durationHours: 3,
    priceLevel: 1,
    latitude: 51.5194,
    longitude: -0.127,
  },
  {
    destination: "London",
    name: "London Eye",
    type: "entertainment",
    durationHours: 1.5,
    priceLevel: 3,
    latitude: 51.5033,
    longitude: -0.1195,
  },
  {
    destination: "London",
    name: "Hyde Park Walk",
    type: "nature",
    durationHours: 2,
    priceLevel: 1,
    latitude: 51.5074,
    longitude: -0.1657,
  },
  {
    destination: "London",
    name: "Camden Market",
    type: "shopping",
    durationHours: 2,
    priceLevel: 1,
    latitude: 51.541,
    longitude: -0.142,
  },
  {
    destination: "London",
    name: "Pub Crawl",
    type: "gastronomy",
    durationHours: 3,
    priceLevel: 2,
    latitude: 51.5136,
    longitude: -0.1365,
  },

  // BARCELONA
  {
    destination: "Barcelona",
    name: "Sagrada Familia",
    type: "culture",
    durationHours: 2,
    priceLevel: 3,
    latitude: 41.4036,
    longitude: 2.1744,
  },
  {
    destination: "Barcelona",
    name: "Park Güell",
    type: "nature",
    durationHours: 2,
    priceLevel: 2,
    latitude: 41.4145,
    longitude: 2.1527,
  },
  {
    destination: "Barcelona",
    name: "La Rambla Walk",
    type: "entertainment",
    durationHours: 2,
    priceLevel: 1,
    latitude: 41.3809,
    longitude: 2.1739,
  },
  {
    destination: "Barcelona",
    name: "Tapas Tour",
    type: "gastronomy",
    durationHours: 3,
    priceLevel: 2,
    latitude: 41.3851,
    longitude: 2.1734,
  },
  {
    destination: "Barcelona",
    name: "Barceloneta Beach",
    type: "nature",
    durationHours: 3,
    priceLevel: 1,
    latitude: 41.378,
    longitude: 2.189,
  },

  // BERLIN
  {
    destination: "Berlin",
    name: "Brandenburg Gate",
    type: "culture",
    durationHours: 1,
    priceLevel: 1,
    latitude: 52.5163,
    longitude: 13.3777,
  },
  {
    destination: "Berlin",
    name: "Berlin Wall Memorial",
    type: "culture",
    durationHours: 2,
    priceLevel: 1,
    latitude: 52.5351,
    longitude: 13.3903,
  },
  {
    destination: "Berlin",
    name: "Museum Island",
    type: "culture",
    durationHours: 3,
    priceLevel: 2,
    latitude: 52.5169,
    longitude: 13.401,
  },
  {
    destination: "Berlin",
    name: "Tiergarten Park",
    type: "nature",
    durationHours: 2,
    priceLevel: 1,
    latitude: 52.5145,
    longitude: 13.3501,
  },
  {
    destination: "Berlin",
    name: "Techno Club Night",
    type: "entertainment",
    durationHours: 4,
    priceLevel: 2,
    latitude: 52.511,
    longitude: 13.454,
  },

  // AMSTERDAM
  {
    destination: "Amsterdam",
    name: "Anne Frank House",
    type: "culture",
    durationHours: 2,
    priceLevel: 2,
    latitude: 52.3752,
    longitude: 4.8839,
  },
  {
    destination: "Amsterdam",
    name: "Canal Cruise",
    type: "entertainment",
    durationHours: 1.5,
    priceLevel: 2,
    latitude: 52.3738,
    longitude: 4.891,
  },
  {
    destination: "Amsterdam",
    name: "Van Gogh Museum",
    type: "culture",
    durationHours: 2.5,
    priceLevel: 2,
    latitude: 52.3584,
    longitude: 4.8811,
  },
  {
    destination: "Amsterdam",
    name: "Vondelpark",
    type: "nature",
    durationHours: 2,
    priceLevel: 1,
    latitude: 52.358,
    longitude: 4.8686,
  },
  {
    destination: "Amsterdam",
    name: "Street Food Tour",
    type: "gastronomy",
    durationHours: 2,
    priceLevel: 2,
    latitude: 52.3702,
    longitude: 4.8952,
  },

  // VIENNA
  {
    destination: "Vienna",
    name: "Schönbrunn Palace",
    type: "culture",
    durationHours: 3,
    priceLevel: 3,
    latitude: 48.1845,
    longitude: 16.3122,
  },
  {
    destination: "Vienna",
    name: "Historic Center Walk",
    type: "culture",
    durationHours: 2,
    priceLevel: 1,
    latitude: 48.2082,
    longitude: 16.3738,
  },
  {
    destination: "Vienna",
    name: "Vienna Opera Tour",
    type: "culture",
    durationHours: 1.5,
    priceLevel: 2,
    latitude: 48.203,
    longitude: 16.3695,
  },
  {
    destination: "Vienna",
    name: "Danube Island",
    type: "nature",
    durationHours: 3,
    priceLevel: 1,
    latitude: 48.246,
    longitude: 16.406,
  },
  {
    destination: "Vienna",
    name: "Coffee House Crawl",
    type: "gastronomy",
    durationHours: 2,
    priceLevel: 2,
    latitude: 48.21,
    longitude: 16.363,
  },

  // PRAGUE
  {
    destination: "Prague",
    name: "Charles Bridge",
    type: "culture",
    durationHours: 1.5,
    priceLevel: 1,
    latitude: 50.0865,
    longitude: 14.4114,
  },
  {
    destination: "Prague",
    name: "Prague Castle",
    type: "culture",
    durationHours: 3,
    priceLevel: 2,
    latitude: 50.0909,
    longitude: 14.4005,
  },
  {
    destination: "Prague",
    name: "Old Town Square",
    type: "entertainment",
    durationHours: 1.5,
    priceLevel: 1,
    latitude: 50.087,
    longitude: 14.4208,
  },
  {
    destination: "Prague",
    name: "Beer Tasting",
    type: "gastronomy",
    durationHours: 2,
    priceLevel: 2,
    latitude: 50.0755,
    longitude: 14.4378,
  },
  {
    destination: "Prague",
    name: "Petrin Hill",
    type: "nature",
    durationHours: 2,
    priceLevel: 1,
    latitude: 50.0835,
    longitude: 14.3956,
  },

  // ATHENS
  {
    destination: "Athens",
    name: "Acropolis",
    type: "culture",
    durationHours: 2.5,
    priceLevel: 2,
    latitude: 37.9715,
    longitude: 23.7257,
  },
  {
    destination: "Athens",
    name: "Plaka Walk",
    type: "culture",
    durationHours: 2,
    priceLevel: 1,
    latitude: 37.9735,
    longitude: 23.7323,
  },
  {
    destination: "Athens",
    name: "Ancient Agora",
    type: "culture",
    durationHours: 2,
    priceLevel: 2,
    latitude: 37.9756,
    longitude: 23.722,
  },
  {
    destination: "Athens",
    name: "Greek Food Tour",
    type: "gastronomy",
    durationHours: 3,
    priceLevel: 2,
    latitude: 37.9838,
    longitude: 23.7275,
  },
  {
    destination: "Athens",
    name: "Sunset at Lycabettus",
    type: "nature",
    durationHours: 1.5,
    priceLevel: 1,
    latitude: 37.983,
    longitude: 23.743,
  },
];

async function main() {
  for (const a of activities) {
    await prisma.activity.upsert({
      where: {
        destination_name: {
          destination: a.destination,
          name: a.name,
        },
      },
      update: a,
      create: a,
    });
  }

  console.log("Activity seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
