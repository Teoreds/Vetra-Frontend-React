import { Outlet } from "react-router-dom";
import { env } from "@/config/env";

export function AuthLayout() {
  return (
    <div className="flex h-screen">
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg) }
          to { transform: rotate(360deg) }
        }
        @keyframes crystal-glow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 0px transparent) }
          50% { filter: brightness(1.15) drop-shadow(0 0 30px rgba(255,255,255,0.15)) }
        }
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%) rotate(25deg); opacity: 0 }
          15% { opacity: 1 }
          85% { opacity: 1 }
          100% { transform: translateX(100%) rotate(25deg); opacity: 0 }
        }
        @keyframes text-shimmer {
          0% { background-position: -200% center }
          100% { background-position: 200% center }
        }
      `}</style>
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

        {/* Top: spacer */}
        <div className="relative z-10" />

        {/* Middle: spacer */}
        <div className="relative z-10" />

        {/* Bottom: copyright */}
        <p className="relative z-10 text-[11px] text-white/25">
          © 2026 {env.APP_NAME}. Sviluppato da teoreds.
        </p>

        {/* Big logo — bottom-left, partially clipped, slow spin + glow */}
        <div
          className="pointer-events-none absolute"
          style={{
            bottom: "-430px",
            left: "-320px",
            width: "1100px",
            height: "1100px",
            animation: "spin-slow 60s linear infinite",
          }}
        >
          {/* Crystal logo */}
          <div
            style={{
              width: "100%",
              height: "100%",
              opacity: 0.25,
              backgroundImage: "url(/logo_big.svg)",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              animation: "crystal-glow 5s ease-in-out infinite",
            }}
          />
          {/* Shimmer sweep — masked to SVG lines only */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              WebkitMaskImage: "url(/logo_big.svg)",
              maskImage: "url(/logo_big.svg)",
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-50%",
                left: 0,
                width: "60%",
                height: "200%",
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.35) 60%, transparent 100%)",
                animation: "shimmer-sweep 8s ease-in-out infinite",
              }}
            />
          </div>
        </div>
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
