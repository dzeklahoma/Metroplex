import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as tripsApi from "../api/tripsApi";
import type { Trip } from "../types/models";
import { TripCard } from "../components/TripCard";
import { Card } from "../components/Card";
import { Navbar } from "../components/Navbar";

export function TripsPage() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await tripsApi.getMyTrips();
        setTrips(res.trips);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load trips";
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">My Trips</h1>
              <p className="text-sm text-gray-600">
                Your generated travel plans
              </p>
            </div>

            <button
              onClick={() => navigate("/trips/new")}
              className="rounded-xl bg-black px-4 py-2 font-medium text-white"
            >
              Create trip
            </button>
          </div>

          <div className="mt-8">
            {loading && <Card>Loading trips...</Card>}

            {!loading && error && (
              <Card className="border-red-200 bg-red-50 text-red-700">
                {error}
              </Card>
            )}

            {!loading && !error && trips.length === 0 && (
              <Card>
                <div className="text-sm text-gray-700">No trips yet.</div>
                <button
                  onClick={() => navigate("/trips/new")}
                  className="mt-3 rounded-xl bg-black px-4 py-2 font-medium text-white"
                >
                  Create your first trip
                </button>
              </Card>
            )}

            {!loading && !error && trips.length > 0 && (
              <div className="grid gap-4">
                {trips.map((t) => (
                  <TripCard key={t.id} trip={t} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
