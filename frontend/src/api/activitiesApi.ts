import { request } from "./http";
import type { Activity } from "../types/models";

export function listActivities() {
  return request<{ activities: Activity[] }>("/api/activities");
}

export function createActivity(input: Omit<Activity, "id">) {
  return request<{ activity: Activity }>("/api/activities", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateActivity(
  id: number,
  input: Partial<Omit<Activity, "id">>,
) {
  return request<{ activity: Activity }>(`/api/activities/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteActivity(id: number) {
  return request<{ message: string }>(`/api/activities/${id}`, {
    method: "DELETE",
  });
}
