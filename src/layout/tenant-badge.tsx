import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

export function TenantBadge() {
  const { data: user } = useCurrentUser();

  if (!user?.master_data_guid) return null;

  const name = user.master_data_description ?? "Tenant";

  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
      {name}
    </span>
  );
}
