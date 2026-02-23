import { createContext } from "react";
import type { User } from "../types/models";

export type AuthState = {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);

export const TOKEN_KEY = "mp_token";
