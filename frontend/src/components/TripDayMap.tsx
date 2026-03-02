import { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import type { TripDetails } from "../types/models";
import { useEffect } from "react";
import L from "leaflet";

type Props = {
  trip: TripDetails;
  height?: number;
};

function numberedIcon(n: number) {
  return L.divIcon({
    className: "metroplex-marker",
    html: `
      <div style="
        width:28px;height:28px;border-radius:9999px;
        background:#111827;color:white;
        display:flex;align-items:center;justify-content:center;
        font-size:13px;font-weight:700;
        box-shadow:0 6px 16px rgba(0,0,0,.25);
        border:2px solid white;
      ">${n}</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function googleMapsDirectionsUrl(points: Array<[number, number]>) {
  if (points.length < 2) return null;

  const origin = `${points[0][0]},${points[0][1]}`;
  const destination = `${points[points.length - 1][0]},${points[points.length - 1][1]}`;

  const waypoints =
    points.length > 2
      ? points
          .slice(1, -1)
          .map(([lat, lng]) => `${lat},${lng}`)
          .join("|")
      : "";

  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "walking", // change to "driving" if you want
  });

  if (waypoints) params.set("waypoints", waypoints);

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function FitBounds({ points }: { points: Array<[number, number]> }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(
      points.map(([lat, lng]) => L.latLng(lat, lng)),
    );
    map.flyToBounds(bounds, { padding: [24, 24], duration: 0.6 });
  }, [map, points]);

  return null;
}

export default function TripDayMap({ trip, height = 420 }: Props) {
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const dayPlan = useMemo(
    () =>
      trip.dayPlans.find((d) => d.dayNumber === selectedDay) ??
      trip.dayPlans[0],
    [trip.dayPlans, selectedDay],
  );

  const items = useMemo(() => {
    const list = dayPlan?.plannedActivities ?? [];
    // ensure correct ordering
    return [...list].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [dayPlan]);

  const markers = useMemo(() => {
    return items
      .map((pa) => pa.activity)
      .filter(
        (a): a is NonNullable<typeof a> =>
          !!a && a.latitude != null && a.longitude != null,
      );
  }, [items]);

  const points = useMemo<Array<[number, number]>>(
    () => markers.map((a) => [a.latitude as number, a.longitude as number]),
    [markers],
  );

  const center: [number, number] = points.length ? points[0] : [0, 0];
  const gmapsUrl = useMemo(() => googleMapsDirectionsUrl(points), [points]);

  return (
    <div className="w-full">
      {/* Day picker */}
      <div className="flex flex-wrap gap-2 mb-3">
        {Array.from({ length: trip.daysCount }, (_, i) => i + 1).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setSelectedDay(d)}
            className={`px-3 py-1 rounded border text-sm ${
              d === selectedDay
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Day {d}
          </button>
        ))}
      </div>

      {/* Map */}
      <div
        style={{ height, width: "100%" }}
        className="rounded-lg overflow-hidden border"
      >
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Auto-fit */}
          {points.length > 1 ? <FitBounds points={points} /> : null}

          {/* Path (straight line) */}
          {points.length >= 2 ? (
            <Polyline
              positions={points}
              pathOptions={{ weight: 4, opacity: 0.85 }}
            />
          ) : null}

          {/* Markers */}
          {markers.map((a, idx) => (
            <Marker
              key={a.id}
              position={[a.latitude as number, a.longitude as number]}
              icon={numberedIcon(idx + 1)}
            >
              <Popup>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {idx + 1}. {a.name}
                  </div>
                  {a.type ? <div>{a.type}</div> : null}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={!gmapsUrl}
          onClick={() =>
            gmapsUrl && window.open(gmapsUrl, "_blank", "noopener,noreferrer")
          }
          className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
        >
          Open in Google Maps
        </button>

        <span className="text-xs text-gray-500">
          {gmapsUrl
            ? "Opens walking directions with stops in order."
            : "Need 2+ locations for directions."}
        </span>
      </div>
      {/* Empty state */}
      {markers.length === 0 ? (
        <p className="mt-2 text-sm text-gray-600">
          No mappable activities for Day {selectedDay} (missing coordinates).
        </p>
      ) : null}
    </div>
  );
}
