import { request } from "./http";
import type { Trip } from "../types/models";

export function getMyTrips() {
  return request<{ trips: Trip[] }>("/api/trips/my");
}
