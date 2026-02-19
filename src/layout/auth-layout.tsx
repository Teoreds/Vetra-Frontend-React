import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-border/60 bg-card p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]">
        <Outlet />
      </div>
    </div>
  );
}
