import { useNavigate } from "react-router-dom";
import type { Trip } from "../types/models";
import { Card } from "./Card";

export function TripCard({ trip }: { trip: Trip }) {
  const navigate = useNavigate();

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
          </div>
          <div className="text-xs text-gray-500">
            {new Date(trip.createdAt).toLocaleDateString()}
          </div>
        </div>

        <p className="mt-3 text-sm text-gray-700 line-clamp-2">
          Interests: <span className="text-gray-600">{trip.interests}</span>
        </p>
      </div>
    </Card>
  );
}
