import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../hooks/use-auth-store";

export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sessionExpired = useAuthStore((s) => s.sessionExpired);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionExpired) {
      useAuthStore.getState().logout();
      useAuthStore.getState().setSessionExpired(false);
      navigate("/login", { replace: true, state: { sessionExpired: true } });
    }
  }, [sessionExpired, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
