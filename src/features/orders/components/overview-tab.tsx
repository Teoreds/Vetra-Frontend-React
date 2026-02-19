import { formatDate } from "@/shared/lib/utils";
import { getStatusLabel } from "../types/order-status";
import type { OrderOut } from "../types/order.types";

interface OverviewTabProps {
  order: OrderOut;
}

export function OverviewTab({ order }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Order Information
        </h3>
        <dl className="space-y-2.5">
          <div className="flex justify-between">
            <dt className="text-[13px] text-muted-foreground">Order Date</dt>
            <dd className="text-[13px] font-medium">{formatDate(order.order_date)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[13px] text-muted-foreground">Status</dt>
            <dd className="text-[13px] font-medium">{getStatusLabel(order.status_code)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[13px] text-muted-foreground">Created</dt>
            <dd className="text-[13px] font-medium">{formatDate(order.created_at)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Party & Locations
        </h3>
        <dl className="space-y-2.5">
          <div className="flex justify-between">
            <dt className="text-[13px] text-muted-foreground">Party</dt>
            <dd className="text-[13px] font-medium font-mono">
              {order.party_guid.slice(0, 8)}...
            </dd>
          </div>
          {order.billing_location_guid && (
            <div className="flex justify-between">
              <dt className="text-[13px] text-muted-foreground">Billing Location</dt>
              <dd className="text-[13px] font-medium font-mono">
                {order.billing_location_guid.slice(0, 8)}...
              </dd>
            </div>
          )}
          {order.shipping_location_guid && (
            <div className="flex justify-between">
              <dt className="text-[13px] text-muted-foreground">Shipping Location</dt>
              <dd className="text-[13px] font-medium font-mono">
                {order.shipping_location_guid.slice(0, 8)}...
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
