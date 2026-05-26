import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Avatar from "@radix-ui/react-avatar";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/shared/lib/utils";
import { env } from "@/config/env";
import { useAllowedModules } from "@/features/auth/hooks/use-allowed-modules";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useAuthStore } from "@/features/auth/hooks/use-auth-store";
import {
  mainNavigationItems,
  bottomNavigationItems,
  type NavigationSection,
} from "./navigation-items";
import { useSidebarStore } from "./use-sidebar-store";

const SECTIONS: NavigationSection[] = ["OPERATIVITÀ", "ANAGRAFICA"];

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

  const { data: user } = useCurrentUser();
  const storeLogout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  function logout() {
    storeLogout();
    queryClient.clear();
  }

  const initials =
    user?.display_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "??";

  const avatarUrl = user?.profile_picture_path ? `/api/auth/me/avatar` : null;

  const navItems = mainNavigationItems.filter((item) => canSee(item.moduleCode));
  const bottomItems = bottomNavigationItems.filter((item) => canSee(item.moduleCode));

  const groupedItems = SECTIONS.map((section) => ({
    section,
    items: navItems.filter((item) => item.section === section),
  })).filter((g) => g.items.length > 0);

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
        isExpanded ? "w-[14.5rem] shadow-card" : "w-14",
      )}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Logo */}
        <div className="flex items-center h-[60px] px-[14px] shrink-0">
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

        {/* Main nav — grouped by section */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pt-1 pb-2">
          {groupedItems.map((group, gi) => (
            <div key={group.section} className={gi > 0 ? "mt-3" : ""}>
              {/* Section label */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  isExpanded ? "max-h-6 opacity-100 delay-100" : "max-h-0 opacity-0",
                )}
              >
                <span className="block px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                  {group.section}
                </span>
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => (
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
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom nav (admin/settings) */}
        {bottomItems.length > 0 && (
          <>
            <div className="border-t border-sidebar-border mx-3 shrink-0" />
            <div className="space-y-0.5 px-2 py-2 shrink-0">
              {bottomItems.map((item) => (
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
            </div>
          </>
        )}

        {/* User card */}
        <div className="border-t border-sidebar-border shrink-0">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="flex w-full items-center px-2 py-2.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none"
              >
                <div className="flex w-10 shrink-0 items-center justify-center">
                  <Avatar.Root className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft ring-1 ring-primary/10 overflow-hidden">
                    {avatarUrl && (
                      <Avatar.Image
                        src={avatarUrl}
                        alt={user?.display_name}
                        className="h-full w-full object-cover"
                      />
                    )}
                    <Avatar.Fallback className="text-[11px] font-semibold text-primary-text">
                      {initials}
                    </Avatar.Fallback>
                  </Avatar.Root>
                </div>
                <div
                  className={cn(
                    "min-w-0 flex-1 transition-opacity duration-200",
                    isExpanded ? "opacity-100 delay-100" : "opacity-0",
                  )}
                >
                  <p className="truncate text-[12px] font-semibold leading-tight whitespace-nowrap">
                    {user?.display_name ?? "—"}
                  </p>
                  <p className="truncate text-[11px] capitalize text-muted-foreground whitespace-nowrap">
                    {user?.role_code?.toLowerCase() ?? ""}
                  </p>
                </div>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                side="top"
                align="start"
                sideOffset={4}
                className="z-50 min-w-[180px] rounded-lg border border-border bg-popover p-1.5 shadow-popover"
              >
                <DropdownMenu.Item
                  className="cursor-pointer rounded-lg px-3 py-2 text-[13px] outline-none transition-colors hover:bg-muted"
                  onClick={() => navigate("/profile")}
                >
                  Profilo
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="cursor-pointer rounded-lg px-3 py-2 text-[13px] outline-none transition-colors hover:bg-muted"
                  onClick={() => navigate("/admin")}
                >
                  Impostazioni
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  className="cursor-pointer rounded-lg px-3 py-2 text-[13px] text-danger-foreground outline-none transition-colors hover:bg-danger-soft"
                  onClick={logout}
                >
                  Esci
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Pin button — floats on the right edge, appears on hover */}
      <button
        type="button"
        onClick={() => {
          if (isPinned) setIsHovered(false);
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
        {isPinned ? (
          <ChevronLeft className="h-3 w-3" strokeWidth={2.5} />
        ) : (
          <ChevronRight className="h-3 w-3" strokeWidth={2.5} />
        )}
      </button>
    </aside>
  );
}
