import { useOrders } from "@/features/orders/hooks/use-orders";
import { LatestOrdersTable } from "@/features/dashboard/components/latest-orders-table";

interface RelatedOrdersSectionProps {
  partyGuid: string;
}

export function RelatedOrdersSection({ partyGuid }: RelatedOrdersSectionProps) {
  const { data, isLoading } = useOrders({ party_guid: partyGuid, limit: 5 });

  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <div className="px-5 pt-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Related Orders
        </h3>
      </div>
      <LatestOrdersTable orders={data?.items ?? []} isLoading={isLoading} />
    </div>
  );
}
