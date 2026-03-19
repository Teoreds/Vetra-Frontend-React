import { useLocation } from "react-router-dom";
import { LoginForm } from "../components/login-form";
import { env } from "@/config/env";
import { LogoIcon } from "@/shared/ui/logo-icon";

export function LoginPage() {
  const location = useLocation();
  const sessionExpired = (location.state as { sessionExpired?: boolean } | null)?.sessionExpired;

  return (
    <div className="space-y-7">
      {/* Mobile-only header: logo + name (hidden on lg where left panel shows them) */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary">
          <LogoIcon className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">{env.APP_NAME}</span>
      </div>

      {sessionExpired && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          La sessione è scaduta. Accedi nuovamente per continuare.
        </div>
      )}

      {/* Form header */}
      <div className="space-y-1">
        <h1 className="text-[22px] font-semibold tracking-tight">Bentornato.</h1>
        <p className="text-[13px] text-muted-foreground">
          Accedi al tuo account per continuare.
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
