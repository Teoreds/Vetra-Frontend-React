import { useParams } from "react-router-dom";
import { useOrder } from "../hooks/use-order";
import { OrderHeader } from "../components/order-header";
import { OrderTabs } from "../components/order-tabs";
import { OrderActivitySidebar } from "../components/order-activity-sidebar";
import { DeliveryTrackingCard } from "../components/delivery-tracking-card";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useOrder(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Ordine non trovato.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sezione superiore: intestazione e flusso di stato */}
      <div className="sticky top-0 z-30 -mx-8 -mt-6 bg-page/80 backdrop-blur-sm px-8 pt-6 pb-6">
        <OrderHeader order={order} />
      </div>

      <div className="space-y-6 pt-6">
        {/* Sezione centrale: tab + sidebar attività */}
        <div className="flex gap-6">
          <div className="min-w-0 flex-1">
            <OrderTabs order={order} />
          </div>
          <div className="w-80 shrink-0">
            <OrderActivitySidebar orderGuid={order.guid} />
          </div>
        </div>

        {/* Sezione inferiore: note di consegna */}
        <DeliveryTrackingCard />
      </div>
    </div>
  );
}
