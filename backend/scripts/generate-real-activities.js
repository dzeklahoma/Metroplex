/**
 * Generate real-ish Activities seed (10 per city) from OpenStreetMap via Nominatim + Overpass.
 *
 * Usage (from repo root):
 *   node backend/scripts/generate-real-activities.js backend/prisma/activities.seed.ts
 *
 * Notes:
 * - Respects Nominatim policy: max 1 request/sec and requires a custom User-Agent. citeturn0search0
 * - Overpass instances may queue/limit; script retries on 429/5xx. citeturn0search1turn0search5
 */
const fs = require("fs");
const path = require("path");

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter"; // you can switch to another instance if needed
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "your_email@example.com";
const USER_AGENT = `MetroplexSeeder/1.0 (${CONTACT_EMAIL})`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function requestJson(
  url,
  options = {},
  { retries = 0, backoffMs = 800 } = {},
) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, options);

    if (res.ok) return res.json();

    const text = await res.text();

    // retry only on typical temporary errors
    const retryable =
      res.status === 429 || (res.status >= 500 && res.status <= 599);
    if (!retryable || attempt === retries) {
      throw new Error(`HTTP ${res.status} ${res.statusText} :: ${text}`);
    }

    await sleep(backoffMs * (attempt + 1));
  }
}

async function nominatimCity(city) {
  await sleep(1100);

  const url =
    NOMINATIM_URL +
    "?" +
    new URLSearchParams({
      q: city,
      format: "jsonv2",
      limit: "1",
    }).toString();

  const data = await requestJson(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
      "Accept-Language": "en",
      From: CONTACT_EMAIL,
    },
  });

  if (!data?.[0]) throw new Error(`Nominatim: city not found: ${city}`);
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

function overpassQueryForPOIs(lat, lon) {
  // Broad net: museums, attractions, historic, parks, viewpoints, markets, theatres/cinemas, nightlife.
  // We'll categorize client-side.
  const radius = 8000;
  return `
[out:json][timeout:25];
(
  node(around:${radius},${lat},${lon})[tourism=museum];
  node(around:${radius},${lat},${lon})[tourism=attraction];
  node(around:${radius},${lat},${lon})[historic];
  node(around:${radius},${lat},${lon})[leisure=park];
  node(around:${radius},${lat},${lon})[leisure=garden];
  node(around:${radius},${lat},${lon})[tourism=viewpoint];
  node(around:${radius},${lat},${lon})[amenity=marketplace];
  node(around:${radius},${lat},${lon})[amenity=theatre];
  node(around:${radius},${lat},${lon})[amenity=cinema];
  node(around:${radius},${lat},${lon})[amenity=nightclub];
  node(around:${radius},${lat},${lon})[amenity=bar];
  node(around:${radius},${lat},${lon})[amenity=restaurant];
);
out center tags;
`;
}

async function overpassPOIs(lat, lon) {
  const query = overpassQueryForPOIs(lat, lon);
  const body = new URLSearchParams({ data: query }).toString();

  const data = await requestJson(
    OVERPASS_URL,
    {
      method: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
    { retries: 5, backoffMs: 1200 },
  );

  return (data.elements || [])
    .map((e) => ({
      name: e.tags?.name,
      lat: e.lat,
      lon: e.lon,
      tags: e.tags || {},
    }))
    .filter((x) => x.name && Number.isFinite(x.lat) && Number.isFinite(x.lon));
}

function uniqByName(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = it.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

function pickTop(items, predicate, n) {
  const filtered = items.filter(predicate);
  return filtered.slice(0, n);
}

function typeFromTags(tags) {
  if (
    tags.tourism === "museum" ||
    tags.historic ||
    tags.tourism === "attraction"
  )
    return "culture";
  if (tags.amenity === "marketplace" || tags.amenity === "restaurant")
    return "gastronomy";
  if (tags.leisure === "park" || tags.leisure === "garden") return "nature";
  if (
    tags.amenity === "theatre" ||
    tags.amenity === "cinema" ||
    tags.amenity === "nightclub" ||
    tags.amenity === "bar"
  )
    return "entertainment";
  if (tags.tourism === "viewpoint") return "nature";
  return "culture";
}

function durationForType(t) {
  if (t === "culture") return 2;
  if (t === "gastronomy") return 2;
  if (t === "nature") return 2;
  return 3; // entertainment
}

function priceForType(t) {
  if (t === "nature") return 1;
  if (t === "culture") return 2;
  return 2; // gastro/ent
}

function buildTen(city, poiPool, cityCenter) {
  // Strategy: aim for 3 culture, 2 gastronomy, 3 nature, 2 entertainment.
  const pool = uniqByName(poiPool);

  const culture = pickTop(pool, (p) => typeFromTags(p.tags) === "culture", 3);
  const gastro = pickTop(pool, (p) => typeFromTags(p.tags) === "gastronomy", 2);
  const nature = pickTop(pool, (p) => typeFromTags(p.tags) === "nature", 3);
  const ent = pickTop(pool, (p) => typeFromTags(p.tags) === "entertainment", 2);

  let picked = [...culture, ...gastro, ...nature, ...ent];

  // Fallbacks: if pool is weak, fill from remaining items; if still short, use city center placeholders.
  if (picked.length < 10) {
    const remaining = pool.filter(
      (p) => !picked.some((q) => q.name.toLowerCase() === p.name.toLowerCase()),
    );
    picked = picked.concat(remaining.slice(0, 10 - picked.length));
  }
  while (picked.length < 10) {
    picked.push({
      name: `${city} City Center`,
      lat: cityCenter.lat,
      lon: cityCenter.lon,
      tags: { tourism: "attraction" },
    });
  }

  // Normalize into Prisma inputs
  return picked.slice(0, 10).map((p) => {
    const t = typeFromTags(p.tags);
    return {
      destination: city,
      name: `${city} — ${p.name}`,
      type: t,
      durationHours: durationForType(t),
      priceLevel: priceForType(t),
      latitude: p.lat,
      longitude: p.lon,
    };
  });
}

function parseDestinationsFromSeedFile(seedText) {
  const matches = seedText.matchAll(/destination:\s*"([^"]+)"/g);
  const set = new Set();
  for (const m of matches) set.add(m[1]);
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function renderSeed(activities) {
  const header = `import { Prisma } from "@prisma/client";
export const activities: Prisma.ActivityCreateInput[] = [
`;
  const footer = `];
`;
  const body = activities
    .map(
      (a) => `  {
    destination: ${JSON.stringify(a.destination)},
    name: ${JSON.stringify(a.name)},
    type: ${JSON.stringify(a.type)},
    durationHours: ${a.durationHours},
    priceLevel: ${a.priceLevel},
    latitude: ${a.latitude === null ? "null" : a.latitude},
    longitude: ${a.longitude === null ? "null" : a.longitude},
  }`,
    )
    .join(",\n");
  return header + body + "\n" + footer;
}

async function main() {
  const targetPath = process.argv[2];
  if (!targetPath) {
    console.error(
      "Usage: node backend/scripts/generate-real-activities.js backend/prisma/activities.seed.ts",
    );
    process.exit(1);
  }

  const abs = path.resolve(process.cwd(), targetPath);
  const seedText = fs.readFileSync(abs, "utf8");
  const cities = parseDestinationsFromSeedFile(seedText);

  console.log(
    `Found ${cities.length} destinations. Generating 10 POIs per city...`,
  );

  const all = [];
  for (const city of cities) {
    console.log(`\n== ${city} ==`);
    const center = await nominatimCity(city);
    console.log(
      `City center: ${center.lat}, ${center.lon} (${center.displayName})`,
    );

    const pois = await overpassPOIs(center.lat, center.lon);
    console.log(`Fetched POIs: ${pois.length}`);

    const ten = buildTen(city, pois, center);
    all.push(...ten);

    // extra polite pause between cities (Overpass instances vary)
    await sleep(400);
  }

  const out = renderSeed(all);
  fs.writeFileSync(abs, out, "utf8");
  console.log(`\nDone. Wrote ${all.length} activities to ${targetPath}`);
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
