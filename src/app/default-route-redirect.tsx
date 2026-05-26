import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getDefaultPath } from "./module-access";
import { useAllowedModules } from "@/features/auth/hooks/use-allowed-modules";

export function DefaultRouteRedirect() {
  const { allowedModules, isLoading } = useAllowedModules();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
      </div>
    );
  }

  return <Navigate to={getDefaultPath(allowedModules)} replace />;
}
