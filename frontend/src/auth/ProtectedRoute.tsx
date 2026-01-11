import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { JSX } from "react";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}
