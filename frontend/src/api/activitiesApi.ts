import { request } from "./http";
import type { Activity } from "../types/models";

export function listActivities() {
  return request<{ activities: Activity[] }>("/activities");
}

export function createActivity(input: Omit<Activity, "id">) {
  return request<{ activity: Activity }>("/activities", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateActivity(
  id: number,
  input: Partial<Omit<Activity, "id">>,
) {
  return request<{ activity: Activity }>(`/activities/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteActivity(id: number) {
  return request<{ message: string }>(`/activities/${id}`, {
    method: "DELETE",
  });
}
