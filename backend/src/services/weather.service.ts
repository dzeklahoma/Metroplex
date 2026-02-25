const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

export type DayWeather = {
  date: string; // YYYY-MM-DD
  precipitationProbability?: number;
  precipitationMm?: number;
};

export async function getDailyForecast(
  lat: number,
  lng: number,
  startDateIso: string, // YYYY-MM-DD
  endDateIso: string, // YYYY-MM-DD
): Promise<DayWeather[]> {
  if (
    process.env.NODE_ENV === "test" ||
    process.env.DISABLE_EXTERNAL_APIS === "1"
  ) {
    return [];
  }
  const url = new URL(OPEN_METEO_URL);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));

  // daily vars; docs mention timezone is required when using daily. :contentReference[oaicite:1]{index=1}
  url.searchParams.set(
    "daily",
    "precipitation_probability_max,precipitation_sum",
  );
  url.searchParams.set("start_date", startDateIso);
  url.searchParams.set("end_date", endDateIso);
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) return [];

  const json = await res.json();

  const dates: string[] = json?.daily?.time ?? [];
  const prob: Array<number | null> =
    json?.daily?.precipitation_probability_max ?? [];
  const mm: Array<number | null> = json?.daily?.precipitation_sum ?? [];

  return dates.map((d, i) => ({
    date: d,
    precipitationProbability: prob?.[i] ?? undefined,
    precipitationMm: mm?.[i] ?? undefined,
  }));
}
