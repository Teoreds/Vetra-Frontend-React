import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../hooks/use-auth-store";

export function GuestGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
