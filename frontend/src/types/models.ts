export type Role = "USER" | "EDITOR" | "ADMIN";

export type User = {
  id: number;
  email: string;
  role: Role;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type Trip = {
  id: number;
  destination: string;
  daysCount: number;
  budget?: number | null;
  interests: string;
  createdAt: string;
};
