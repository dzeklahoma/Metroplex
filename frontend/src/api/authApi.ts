import { request } from "./http";
import type { AuthResponse, User } from "../types/models";

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string) {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function me() {
  return request<{ user: User }>("/auth/me");
}

export function logout() {
  return request<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}
