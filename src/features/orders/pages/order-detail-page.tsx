import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { Button } from "@/shared/ui/button";
import { StickyHeader } from "@/shared/ui/sticky-header";
import { TabBar, TabTrigger } from "@/shared/ui/tab-bar";
import { useBack } from "@/shared/hooks/use-back";
import { useOrder } from "../hooks/use-order";
import { OrderHeader } from "../components/order-header";
import { OrderTabs } from "../components/order-tabs";
import { DeliveryTrackingCard } from "../components/delivery-tracking-card";

const TAB_LIST = [
  { value: "overview", label: "Panoramica" },
  { value: "rows", label: "Articoli" },
  { value: "commitments", label: "Impegni" },
  { value: "pick-notes", label: "Note di Prelievo" },
  { value: "delivery-notes", label: "Consegne" },
  { value: "attachments", label: "Documenti" },
] as const;

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const back = useBack();
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
        <p className="text-[length:var(--text-body)] text-muted-foreground">Ordine non trovato.</p>
        <Button variant="ghost" size="sm" onClick={() => back("/orders")}>
          Torna agli ordini
        </Button>
      </div>
    );
  }

  return (
    <Tabs.Root defaultValue="overview" className="flex flex-col">
      <StickyHeader>
        <OrderHeader order={order} />
        <TabBar className="mx-auto max-w-4xl mt-3">
          {TAB_LIST.map((tab) => (
            <TabTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabTrigger>
          ))}
        </TabBar>
      </StickyHeader>

      <div className="mx-auto w-full max-w-4xl pt-6 space-y-6">
        <OrderTabs order={order} />
        <DeliveryTrackingCard />
      </div>
    </Tabs.Root>
  );
}
