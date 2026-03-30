import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useOrder } from "../hooks/use-order";
import { OrderHeader } from "../components/order-header";
import { OrderTabs } from "../components/order-tabs";
import { DeliveryTrackingCard } from "../components/delivery-tracking-card";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrder(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-[13px] text-muted-foreground">Ordine non trovato.</p>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Torna agli ordini
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Sezione superiore: intestazione e flusso di stato */}
      <div className="sticky -top-6 z-30 -mx-8 -mt-6 bg-page/80 backdrop-blur-sm px-8 pt-6">
        <OrderHeader order={order} />
      </div>

      <div className="mx-auto max-w-4xl space-y-6 pt-3">
        <OrderTabs order={order} />
        <DeliveryTrackingCard />
      </div>
    </div>
  );
}
