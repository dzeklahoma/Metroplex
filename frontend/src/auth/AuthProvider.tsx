import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/authApi";
import type { User } from "../types/models";
import { AuthContext, TOKEN_KEY } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    const res = await authApi.me();
    setUser(res.user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string) => {
      await authApi.register(email, password);
      await login(email, password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (token) await refreshMe();
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, refreshMe]);

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout, refreshMe }),
    [token, user, loading, login, register, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
