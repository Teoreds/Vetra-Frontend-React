import { LoginForm } from "../components/login-form";
import { env } from "@/config/env";

export function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-2.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm overflow-hidden">
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold">{env.APP_NAME}</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Accedi al tuo account</p>
        </div>
      </div>
      <LoginForm />
    </div>
  );
}
