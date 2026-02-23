import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import * as tripsApi from "../api/tripsApi";
import type { TripDetails } from "../types/models";

function getErrorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

export function TripDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const tripId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : NaN;
  }, [id]);

  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(tripId)) return;

    (async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await tripsApi.getTripDetails(tripId);
        setTrip(res.trip);
      } catch (e: unknown) {
        setError(getErrorMessage(e, "Failed to load trip"));
      } finally {
        setLoading(false);
      }
    })();
  }, [tripId]);

  async function onRegenerate() {
    if (!trip) return;
    if (regenerating) return; // extra guard

    setRegenerating(true);
    try {
      await tripsApi.regenerateTrip(trip.id);

      // IMPORTANT: always refetch the latest trip details after regenerate
      const fresh = await tripsApi.getTripDetails(trip.id);
      setTrip(fresh.trip);
    } catch (e: unknown) {
      alert(getErrorMessage(e, "Regenerate failed"));
    } finally {
      setRegenerating(false);
    }
  }

  async function onDelete() {
    if (!trip) return;
    if (!confirm("Are you sure you want to delete this trip?")) return;

    setDeleting(true);
    try {
      await tripsApi.deleteTrip(trip.id);
      navigate("/trips", { replace: true });
    } catch (e: unknown) {
      alert(getErrorMessage(e, "Delete failed"));
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          {loading && <Card>Loading trip...</Card>}

          {!loading && error && (
            <Card className="border-red-200 bg-red-50 text-red-700">
              {error}
            </Card>
          )}

          {!loading && !error && !trip && Number.isFinite(tripId) && (
            <Card>Trip not found.</Card>
          )}

          {!loading && !error && trip && (
            <>
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold">{trip.destination}</h1>
                  <p className="text-sm text-gray-600">
                    {trip.daysCount} days
                    {trip.budget ? ` • Budget ${trip.budget}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onRegenerate}
                    disabled={regenerating}
                    className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
                  >
                    {regenerating ? "Regenerating..." : "Regenerate"}
                  </button>

                  <button
                    onClick={onDelete}
                    disabled={deleting}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {trip.dayPlans.map((day) => (
                  <Card key={day.id}>
                    <h3 className="font-medium">Day {day.dayNumber}</h3>

                    <ul className="mt-3 space-y-2">
                      {day.plannedActivities.map((a) => (
                        <li key={a.id} className="text-sm text-gray-700">
                          • {a.activity?.name ?? `Activity #${a.activityId}`}
                          {a.activity?.type ? ` (${a.activity.type})` : ""}
                          {a.activity?.durationMin
                            ? ` • ${a.activity.durationMin} min`
                            : ""}
                          {a.activity?.cost ? ` • ${a.activity.cost}` : ""}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
