import { request } from "./http";
import type { Trip, TripDetails, CreateTripInput } from "../types/models";

export function getMyTrips() {
  return request<{ trips: Trip[] }>("/trips/my");
}

export function createTrip(input: CreateTripInput) {
  return request<{ trip: { id: number } }>("/trips", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getTripDetails(id: number) {
  return request<{ trip: TripDetails }>(`/trips/${id}`);
}

export function regenerateTrip(id: number, interests?: string) {
  return request<{ trip: TripDetails; warning?: string }>(
    `/trips/${id}/regenerate`,
    {
      method: "POST",
      body: JSON.stringify(interests ? { interests } : {}),
    },
  );
}

export function deleteTrip(id: number) {
  return request<{ message: string }>(`/trips/${id}`, {
    method: "DELETE",
  });
}
