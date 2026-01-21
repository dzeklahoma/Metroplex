import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { Role } from "../types/models";
import type { JSX } from "react";

export function RoleRoute({
  roles,
  children,
}: {
  roles: Role[];
  children: JSX.Element;
}) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/trips" replace />;
  return children;
}
