import { request } from "./http";
import type { Trip } from "../types/models";

export function getMyTrips() {
  return request<{ trips: Trip[] }>("/api/trips/my");
}

export type CreateTripInput = {
  destination: string;
  daysCount: number;
  budget?: number;
  interests: string;
};

export function createTrip(input: CreateTripInput) {
  return request<{ trip: { id: number } }>("/api/trips", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
