import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import * as tripsApi from "../api/tripsApi";

function getErrorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

export function CreateTripPage() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState("");
  const [daysCount, setDaysCount] = useState<number>(3);
  const [budget, setBudget] = useState<string>("");
  const [interests, setInterests] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const destinationError = useMemo(() => {
    if (!destination.trim()) return "Destination is required";
    return null;
  }, [destination]);

  const daysError = useMemo(() => {
    if (!daysCount || daysCount < 1) return "Days must be at least 1";
    if (daysCount > 30) return "Max 30 days";
    return null;
  }, [daysCount]);

  const interestsError = useMemo(() => {
    if (!interests.trim()) return "Interests are required";
    return null;
  }, [interests]);

  const canSubmit =
    !destinationError && !daysError && !interestsError && !submitting;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const payload: tripsApi.CreateTripInput = {
        destination: destination.trim(),
        daysCount,
        interests: interests.trim(),
      };

      const rawBudget = budget.trim();
      if (rawBudget) {
        const budgetNum = Number(rawBudget);
        if (!Number.isFinite(budgetNum)) {
          setError("Budget must be a number");
          return;
        }
        payload.budget = budgetNum;
      }

      const res = await tripsApi.createTrip(payload);
      navigate(`/trips/${res.trip.id}`, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Create trip failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="p-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold">Create Trip</h1>
          <p className="mt-1 text-sm text-gray-600">
            Fill the form and Metroplex will generate a plan.
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-6 space-y-4 rounded-2xl border border-black/10 bg-white p-6"
          >
            <div>
              <label className="text-sm font-medium">Destination</label>
              <input
                className={`mt-1 w-full rounded-xl border p-2 outline-none ${
                  destinationError ? "border-red-500" : "border-black/10"
                }`}
                value={destination}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDestination(e.target.value)
                }
                placeholder="e.g. Rome"
              />
              {destination && destinationError && (
                <div className="mt-1 text-sm text-red-600">
                  {destinationError}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Days</label>
              <input
                type="number"
                className={`mt-1 w-full rounded-xl border p-2 outline-none ${
                  daysError ? "border-red-500" : "border-black/10"
                }`}
                value={daysCount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDaysCount(Number(e.target.value))
                }
                min={1}
                max={30}
              />
              {daysError && (
                <div className="mt-1 text-sm text-red-600">{daysError}</div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Budget (optional)</label>
              <input
                className="mt-1 w-full rounded-xl border border-black/10 p-2 outline-none"
                value={budget}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBudget(e.target.value)
                }
                placeholder="e.g. 500"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Interests</label>
              <textarea
                className={`mt-1 w-full rounded-xl border p-2 outline-none ${
                  interestsError ? "border-red-500" : "border-black/10"
                }`}
                rows={4}
                value={interests}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setInterests(e.target.value)
                }
                placeholder="e.g. museums, food, nature, nightlife"
              />
              {interests && interestsError && (
                <div className="mt-1 text-sm text-red-600">
                  {interestsError}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-black py-2.5 font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Generating..." : "Create & Generate"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
