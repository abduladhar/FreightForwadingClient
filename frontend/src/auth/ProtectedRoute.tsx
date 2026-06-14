import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-medium text-slate-600">Loading secure workspace...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location }} />;
}
