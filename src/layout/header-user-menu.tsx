import { Bell } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Avatar from "@radix-ui/react-avatar";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useAuthStore } from "@/features/auth/hooks/use-auth-store";
import { Button } from "@/shared/ui/button";
import { Breadcrumb } from "@/shared/ui/breadcrumb";
import { TenantBadge } from "@/layout/tenant-badge";

export function HeaderUserMenu() {
  const { data: user } = useCurrentUser();
  const logout = useAuthStore((s) => s.logout);

  const initials = user?.display_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background px-6">
      <Breadcrumb />

      <div className="flex items-center gap-2">
        <TenantBadge />

        <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground">
          <Bell className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-border/60" />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60">
              <div className="text-right">
                <p className="text-[13px] font-medium leading-tight">{user?.display_name ?? "Caricamento..."}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{user?.role_code ?? ""}</p>
              </div>
              <Avatar.Root className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/5">
                <Avatar.Fallback className="text-xs font-semibold text-primary">
                  {initials}
                </Avatar.Fallback>
              </Avatar.Root>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-[180px] rounded-xl border border-border/60 bg-popover p-1.5 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.15)]"
            >
              <DropdownMenu.Item className="cursor-pointer rounded-lg px-3 py-2 text-[13px] outline-none transition-colors hover:bg-accent">
                Profilo
              </DropdownMenu.Item>
              <DropdownMenu.Item className="cursor-pointer rounded-lg px-3 py-2 text-[13px] outline-none transition-colors hover:bg-accent">
                Impostazioni
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-border/60" />
              <DropdownMenu.Item
                className="cursor-pointer rounded-lg px-3 py-2 text-[13px] text-destructive outline-none transition-colors hover:bg-destructive/10"
                onClick={logout}
              >
                Esci
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
