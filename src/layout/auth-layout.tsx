import { Outlet } from "react-router-dom";
import { env } from "@/config/env";

export function AuthLayout() {
  return (
    <div className="flex h-screen">
      {/* ── Left — branded panel (hidden on mobile) ── */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-1/2"
        style={{
          background: "linear-gradient(140deg, #1d4ed8 0%, #2563eb 55%, #3b82f6 100%)",
        }}
      >
        {/* Dot pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Top: logo + app name */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/20">
            <img src="/logo.svg" alt={env.APP_NAME} className="h-8 w-8 object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">{env.APP_NAME}</span>
        </div>

        {/* Middle: headline + tagline */}
        <div className="relative z-10 space-y-3">
          <h2 className="text-[32px] font-bold leading-tight text-white">
            Gestione ordini
            <br />
            <span className="text-white/60">semplice e veloce.</span>
          </h2>
          <p className="max-w-[260px] text-[14px] leading-relaxed text-white/45">
            Tutta la logistica B2B in un'unica piattaforma.
          </p>
        </div>

        {/* Bottom: copyright */}
        <p className="relative z-10 text-[11px] text-white/25">
          © 2025 {env.APP_NAME}. Tutti i diritti riservati.
        </p>
      </div>

      {/* ── Right — form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-[360px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
