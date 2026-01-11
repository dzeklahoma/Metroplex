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
