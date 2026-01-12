import { request } from "./http";
import type { Trip, TripDetails } from "../types/models";

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

export function getTripDetails(id: number) {
  return request<{ trip: TripDetails }>(`/api/trips/${id}`);
}

export function regenerateTrip(id: number, interests?: string) {
  return request<{ trip: TripDetails }>(`/api/trips/${id}/regenerate`, {
    method: "POST",
    body: JSON.stringify(interests ? { interests } : {}),
  });
}

export function deleteTrip(id: number) {
  return request<{ message: string }>(`/api/trips/${id}`, {
    method: "DELETE",
  });
}
