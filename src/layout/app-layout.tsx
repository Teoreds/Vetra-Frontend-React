import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarNav } from "./sidebar-nav";
import { HeaderUserMenu } from "./header-user-menu";
import { useApplyTenantTheme } from "@/shared/hooks/use-apply-tenant-theme";
import { useNavHistoryStore } from "@/shared/hooks/use-nav-history";
import { useSidebarStore } from "./use-sidebar-store";

function NavigationTracker() {
  const { pathname } = useLocation();
  const push = useNavHistoryStore((s) => s.push);
  useEffect(() => { push(pathname); }, [pathname, push]);
  return null;
}

export function AppLayout() {
  useApplyTenantTheme();
  const { isPinned } = useSidebarStore();
  return (
    <div className="flex h-screen overflow-hidden bg-page">
      <NavigationTracker />
      <SidebarNav />
      <div className={isPinned ? "w-60 shrink-0" : "w-16 shrink-0"} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderUserMenu />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
