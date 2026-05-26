import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

export function TenantBadge() {
  const { data: user } = useCurrentUser();

  if (!user?.master_data_guid) return null;

  const name = user.master_data_description ?? "Tenant";

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-primary to-fulfilled shrink-0" />
      {name}
    </span>
  );
}
