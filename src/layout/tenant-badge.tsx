import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

const TENANT_MAP: Record<string, { name: string; color: string }> = {
  "00000000-0000-0000-0000-000000000001": { name: "RoyalMarine", color: "bg-blue-100 text-blue-700" },
  "mock-guid-bbb": { name: "Azienda Beta", color: "bg-amber-100 text-amber-700" },
  "mock-guid-ccc": { name: "Azienda Gamma", color: "bg-emerald-100 text-emerald-700" },
};

const FALLBACK = { name: "Tenant", color: "bg-muted text-muted-foreground" };

export function TenantBadge() {
  const { data: user } = useCurrentUser();

  if (!user?.master_data_guid) return null;

  const tenant = TENANT_MAP[user.master_data_guid] ?? FALLBACK;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tenant.color}`}
    >
      {tenant.name}
    </span>
  );
}
