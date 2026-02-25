const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

let lastCallAt = 0;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function throttle1rps() {
  const now = Date.now();
  const wait = Math.max(0, 1000 - (now - lastCallAt));
  if (wait > 0) await sleep(wait);
  lastCallAt = Date.now();
}

export type GeocodeResult = { lat: number; lng: number };

export async function geocodeDestination(
  destination: string,
): Promise<GeocodeResult | null> {
  if (
    process.env.NODE_ENV === "test" ||
    process.env.DISABLE_EXTERNAL_APIS === "1"
  ) {
    return null;
  }
  await throttle1rps();

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", destination);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "0");

  // Nominatim policy: identify your app; max 1 req/sec. :contentReference[oaicite:0]{index=0}
  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "MetroplexSchoolProject/1.0 (contact: student-project)",
      Accept: "application/json",
    },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as Array<{ lat: string; lon: string }>;
  const first = data?.[0];
  if (!first) return null;

  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}
