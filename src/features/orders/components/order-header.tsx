import { useNavigate } from "react-router-dom";
import { Printer, Pencil, ClipboardList } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { BackButton } from "@/shared/ui/back-button";
import { StatusBadge } from "@/shared/ui/status-badge";
import { getStatusVariant } from "@/shared/ui/status-variants";
import { isOrderEditable } from "../types/order-status";
import { useWarehouseWorkers } from "@/features/warehouses/hooks/use-warehouse-workers";
import { useOrderStatuses } from "@/shared/hooks/use-lookups";
import { useParty } from "@/features/parties/hooks/use-party";
import { PartyAvatar } from "@/features/parties/components/party-avatar";
import type { OrderOut } from "../types/order.types";

interface OrderHeaderProps {
  order: OrderOut;
}

export function OrderHeader({ order }: OrderHeaderProps) {
  const navigate = useNavigate();
  const { data: workersData } = useWarehouseWorkers();
  const { map: statusLabels } = useOrderStatuses();
  const { data: party } = useParty(order.party_guid);

  const workers = workersData?.items ?? [];
  const worker = order.warehouse_worker_guid
    ? workers.find((w) => w.guid === order.warehouse_worker_guid)
    : null;

  const canCreatePickNote =
    order.status_code === "CONFIRMED" || order.status_code === "PARTIAL";

  const createdAt = new Date(order.created_at).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-4xl flex items-center justify-between pb-2">
      <div className="flex items-center gap-3">
        <BackButton fallback="/orders" className="h-8 w-8 shrink-0" />

        <div className="space-y-1">
          {/* Titolo + badge stato */}
          <div className="flex items-center gap-2.5">
            <h1 className="text-[length:var(--text-page-title)] font-bold tracking-tight leading-none">
              Ordine #{order.code.replace(/^ORD-/i, "")}
            </h1>
            <StatusBadge
              variant={getStatusVariant(order.status_code)}
              label={statusLabels.get(order.status_code) ?? order.status_code}
            />
          </div>

          {/* Metadati: cliente · data · da [worker] */}
          <div className="flex items-center gap-1.5">
            {party && (
              <>
                <PartyAvatar
                  partyGuid={order.party_guid}
                  name={party.description ?? "?"}
                  imagePath={party.image_path}
                  className="h-4 w-4 text-[8px]"
                />
                <span className="text-[length:var(--text-caption)] text-muted-foreground font-medium">
                  {party.description}
                </span>
                <span className="text-muted-foreground/30 select-none">·</span>
              </>
            )}
            <span className="text-[length:var(--text-caption)] text-muted-foreground">{createdAt}</span>
            {worker && (
              <>
                <span className="text-muted-foreground/30 select-none">·</span>
                <span className="text-[length:var(--text-caption)] text-muted-foreground">
                  da {worker.name} {worker.surname}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-muted-foreground gap-1.5"
          aria-label="Stampa"
        >
          <Printer className="h-3.5 w-3.5" />
          Stampa
        </Button>
        {canCreatePickNote && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-muted-foreground gap-1.5"
            aria-label="Crea Nota di Prelievo"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Nota di Prelievo
          </Button>
        )}
        <Button
          size="sm"
          onClick={() => navigate(`/orders/${order.guid}/edit`)}
          disabled={!isOrderEditable(order.status_code)}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Modifica
        </Button>
      </div>
    </div>
  );
}
