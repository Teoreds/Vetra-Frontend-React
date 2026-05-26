import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { env } from "@/config/env";
import { useAllowedModules } from "@/features/auth/hooks/use-allowed-modules";
import { bottomNavigationItems, mainNavigationItems } from "./navigation-items";
import { useSidebarStore } from "./use-sidebar-store";

const linkClass = (isActive: boolean) =>
  cn(
    "flex items-center h-9 rounded-md text-[13px] font-medium transition-colors duration-100 whitespace-nowrap",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
    isActive
      ? "bg-primary-soft text-primary-text font-semibold"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );

export function SidebarNav() {
  const { isPinned, togglePin } = useSidebarStore();
  const { canSee } = useAllowedModules();
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isPinned || isHovered;
  const navItems = mainNavigationItems.filter((item) => canSee(item.moduleCode));
  const bottomItems = bottomNavigationItems.filter((item) => canSee(item.moduleCode));

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
        isExpanded ? "w-[14.5rem] shadow-card" : "w-14",
      )}
    >
      {/* Inner wrapper clips text overflow while the aside itself stays overflow-visible for the pin button */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Logo */}
        <div className="flex items-center h-[60px] px-[14px]">
          <div className="relative h-7 w-7 shrink-0 rounded-md overflow-hidden shadow-sm ml-[5px] bg-gradient-to-br from-primary to-fulfilled">
            <img
              src="/logo_big.svg"
              alt="Logo"
              className="absolute"
              style={{ width: 120, height: 110, top: -72, right: -25, transform: "scale(1.8)", transformOrigin: "top right" }}
            />
          </div>
          <div
            className={cn(
              "ml-3 overflow-hidden transition-opacity duration-200",
              isExpanded ? "opacity-100 delay-100" : "opacity-0",
            )}
          >
            <p className="text-sm font-semibold text-foreground leading-none whitespace-nowrap">
              {env.APP_NAME}
            </p>
            <p className="mt-0.5 text-[11px] text-subtle-foreground whitespace-nowrap">
              Gestionale Ordini
            </p>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex-1 space-y-0.5 px-2 pt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => linkClass(isActive)}
            >
              <div className="flex w-10 shrink-0 items-center justify-center">
                <item.icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "transition-opacity duration-200",
                  isExpanded ? "opacity-100 delay-100" : "opacity-0",
                )}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom nav */}
        {bottomItems.length > 0 && (
          <>
            <div className="border-t border-sidebar-border mx-3" />
            <div className="space-y-0.5 px-2 py-3">
              {bottomItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => linkClass(isActive)}
                >
                  <div className="flex w-12 shrink-0 items-center justify-center">
                    <item.icon className="h-[18px] w-[18px]" />
                  </div>
                  <span
                    className={cn(
                      "transition-opacity duration-200",
                      isExpanded ? "opacity-100 delay-100" : "opacity-0",
                    )}
                  >
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pin button — floats on the right edge of the sidebar, appears on hover */}
      <button
        type="button"
        onClick={() => {
          if (isPinned) setIsHovered(false); // collapse immediately on unpin
          togglePin();
        }}
        title={isPinned ? "Comprimi sidebar" : "Fissa sidebar"}
        className={cn(
          "absolute top-[46px] -right-[11px] z-50",
          "flex h-[22px] w-[22px] items-center justify-center rounded-full",
          "bg-background border border-border shadow-sm",
          "text-subtle-foreground hover:text-foreground hover:border-border-strong",
          "transition-all duration-200",
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none",
        )}
      >
        {isPinned
          ? <ChevronLeft className="h-3 w-3" strokeWidth={2.5} />
          : <ChevronRight className="h-3 w-3" strokeWidth={2.5} />
        }
      </button>
    </aside>
  );
}
