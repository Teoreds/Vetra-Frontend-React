import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { Button } from "@/shared/ui/button";
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
        <p className="text-[13px] text-muted-foreground">Ordine non trovato.</p>
        <Button variant="ghost" size="sm" onClick={() => back("/orders")}>
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Torna agli ordini
        </Button>
      </div>
    );
  }

  return (
    <Tabs.Root defaultValue="overview" className="flex flex-col">
      {/* Sticky header + tab list */}
      <div className="sticky -top-6 z-30 -mx-8 -mt-6 bg-page/80 backdrop-blur-sm px-8 pt-6">
        <OrderHeader order={order} />
        <Tabs.List className="mx-auto max-w-4xl mt-1 flex gap-0 border-b border-border/60">
          {TAB_LIST.map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="relative px-4 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity data-[state=active]:after:opacity-100"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </div>

      {/* Tab content */}
      <div className="mx-auto w-full max-w-4xl pt-6 space-y-6">
        <OrderTabs order={order} />
        <DeliveryTrackingCard />
      </div>
    </Tabs.Root>
  );
}
