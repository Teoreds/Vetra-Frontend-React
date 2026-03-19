import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Truck,
  Users,
  Package,
  SlidersHorizontal,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { env } from "@/config/env";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Ordini", icon: ShoppingCart },
  { to: "/pick-notes", label: "Note Prelievo", icon: ClipboardList },
  { to: "/shipments", label: "Spedizioni", icon: Truck },
  { to: "/parties", label: "Anagrafica", icon: Users },
  { to: "/articles", label: "Articoli", icon: Package },
] as const;

const bottomItems = [
  { to: "/admin", label: "Centro di Controllo", icon: SlidersHorizontal },
  { to: "/support", label: "Supporto", icon: HelpCircle },
] as const;

const linkClass = (isActive: boolean) =>
  cn(
    "flex items-center h-9 rounded-lg text-[13px] font-medium transition-colors duration-100 whitespace-nowrap",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
    isActive
      ? "bg-primary/[0.08] text-primary font-semibold"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );

export function SidebarNav() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar overflow-hidden transition-all duration-300 ease-in-out",
        isExpanded ? "w-60 shadow-xl" : "w-16",
      )}
    >
      {/* Logo — icon always centered at 64px, text flows after */}
      <div className="flex items-center h-[60px] px-[14px]">
        <div className="relative h-8 w-8 shrink-0 rounded-xl overflow-hidden shadow-sm ml-[5px] bg-primary rotate-[2deg]">
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
          <p className="mt-0.5 text-[11px] text-muted-foreground whitespace-nowrap">
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
      </nav>

      <div className="border-t border-sidebar-border mx-3" />

      {/* Bottom nav */}
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
    </aside>
  );
}
