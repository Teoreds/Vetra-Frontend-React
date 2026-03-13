import { LoginForm } from "../components/login-form";
import { env } from "@/config/env";
import { LogoIcon } from "@/shared/ui/logo-icon";

export function LoginPage() {
  return (
    <div className="space-y-7">
      {/* Mobile-only header: logo + name (hidden on lg where left panel shows them) */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary">
          <LogoIcon className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">{env.APP_NAME}</span>
      </div>

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
