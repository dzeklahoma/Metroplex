import { useNavigate } from "react-router-dom";
import type { Trip } from "../types/models";
import { Card } from "./Card";

function addDaysIso(startIso: string, days: number) {
  const d = new Date(startIso);
  if (Number.isNaN(d.getTime())) return ""; // ✅ guard
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isValidIsoDate(s: string) {
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
}

function isRainy(
  w?: {
    precipitationProbability?: number;
    precipitationMm?: number;
  } | null,
) {
  if (!w) return false;
  return (
    (w.precipitationProbability ?? 0) >= 50 || (w.precipitationMm ?? 0) >= 2
  );
}

function weatherIcon(code?: number) {
  if (code === undefined || code === null) return "❓";
  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code)) return "⛅";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67].includes(code)) return "🌧️";
  if ([71, 73, 75, 77].includes(code)) return "❄️";
  if ([80, 81, 82].includes(code)) return "🌧️";
  if ([85, 86].includes(code)) return "🌨️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌤️";
}

function tempRange(w?: { tempMinC?: number; tempMaxC?: number } | null) {
  const min = w?.tempMinC;
  const max = w?.tempMaxC;
  if (typeof min !== "number" || typeof max !== "number") return "";
  return `${Math.round(min)}°–${Math.round(max)}°C`;
}

export function TripCard({ trip }: { trip: Trip }) {
  const navigate = useNavigate();

  const startIso = trip.startDate || "";
  const endIso = startIso ? addDaysIso(startIso, trip.daysCount - 1) : "";

  const firstDayWeather =
    trip.weatherDailyJson?.find((w) => w.date === startIso) ?? null;

  const rainy = isRainy(firstDayWeather);
  const icon = weatherIcon(firstDayWeather?.weatherCode);
  const t = tempRange(firstDayWeather);

  return (
    <Card className="hover:bg-black/5 transition cursor-pointer">
      <div onClick={() => navigate(`/trips/${trip.id}`)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{trip.destination}</h3>

            <p className="text-sm text-gray-600">
              {trip.daysCount} days •{" "}
              {trip.budget ? `Budget: ${trip.budget}` : "No budget"}
            </p>

            {isValidIsoDate(startIso) && endIso && (
              <p className="text-xs text-gray-500 mt-1">
                {startIso} → {endIso}
                {firstDayWeather && (
                  <>
                    {" "}
                    •{" "}
                    <span
                      className={
                        rainy ? "text-blue-600 font-medium" : "text-green-600"
                      }
                    >
                      {icon} {t ? `${t} • ` : ""}
                      {rainy ? "Rain expected" : "No rain expected"} (Day 1)
                    </span>
                  </>
                )}
              </p>
            )}
          </div>

          <div className="text-xs text-gray-500">
            {Number.isNaN(new Date(trip.createdAt).getTime())
              ? ""
              : new Date(trip.createdAt).toLocaleDateString()}
          </div>
        </div>

        <p className="mt-3 text-sm text-gray-700 line-clamp-2">
          Interests: <span className="text-gray-600">{trip.interests}</span>
        </p>
      </div>
    </Card>
  );
}
