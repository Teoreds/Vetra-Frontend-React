import { Outlet } from "react-router-dom";
import { SidebarNav } from "./sidebar-nav";
import { HeaderUserMenu } from "./header-user-menu";
import { useApplyTenantTheme } from "@/shared/hooks/use-apply-tenant-theme";

export function AppLayout() {
  useApplyTenantTheme();
  return (
    <div className="flex h-screen overflow-hidden bg-page">
      <SidebarNav />
      <div className="w-16 shrink-0" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderUserMenu />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
