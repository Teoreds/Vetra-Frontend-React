import { Bell } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Breadcrumb } from "@/shared/ui/breadcrumb";
import { TenantBadge } from "@/layout/tenant-badge";

export function HeaderUserMenu() {
  return (
    <header className="flex h-[3.25rem] shrink-0 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm backdrop-saturate-150 px-6">
      <Breadcrumb />
      <div className="flex items-center gap-2">
        <TenantBadge />
        <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
