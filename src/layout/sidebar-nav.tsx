import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Warehouse,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { env } from "@/config/env";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/parties", label: "Parties", icon: Users },
  { to: "/articles", label: "Articles", icon: Package },
  { to: "/warehouses", label: "Warehouses", icon: Warehouse },
] as const;

const bottomItems = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/support", label: "Support", icon: HelpCircle },
] as const;

export function SidebarNav() {
  return (
    <aside className="flex h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <ShoppingCart className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-none">{env.APP_NAME}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">B2B Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 pt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-100",
                isActive
                  ? "bg-primary/[0.08] text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border mx-3" />
      <div className="space-y-0.5 px-3 py-3">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-100",
                isActive
                  ? "bg-primary/[0.08] text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
