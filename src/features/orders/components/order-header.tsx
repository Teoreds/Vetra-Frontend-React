import { useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Pencil, ClipboardList } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Stepper } from "@/shared/ui/stepper";
import { StatusBadge, getStatusVariant } from "@/shared/ui/status-badge";
import { getStatusLabel } from "../types/order-status";
import { useWarehouseWorkers } from "@/features/warehouses/hooks/use-warehouse-workers";
import type { OrderOut } from "../types/order.types";

interface OrderHeaderProps {
  order: OrderOut;
}

/* ── Mappatura stati backend → step visivi ── */

const PIPELINE_STEPS = [
  { label: "Bozza", statuses: ["DRAFT"] },
  { label: "Confermato", statuses: ["CONFIRMED"] },
  { label: "Parzialmente Evaso", statuses: ["COMMITTED", "PICKING"] },
  { label: "Evaso", statuses: ["SHIPPED"] },
  { label: "Completato", statuses: ["COMPLETED"] },
] as const;

function getStepFromStatus(status: string): number {
  const upper = status.toUpperCase();
  const index = PIPELINE_STEPS.findIndex((s) =>
    (s.statuses as readonly string[]).includes(upper),
  );
  return index + 1; // 1-based per il Stepper
}

/* ── Intestazione completa ── */

export function OrderHeader({ order }: OrderHeaderProps) {
  const navigate = useNavigate();
  const { data: workersData } = useWarehouseWorkers();
  const workers = workersData?.items ?? [];
  const assignee = order.warehouse_worker_guid
    ? workers.find((w) => w.guid === order.warehouse_worker_guid)
    : null;

  const canCreatePickNote =
    order.status_code === "COMMITTED" || order.status_code === "PICKING";

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 px-5 py-4 space-y-4">
      {/* Riga intestazione: dettagli a sinistra, azioni a destra */}
      <div className="flex items-start justify-between">
        {/* Dettagli */}
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="mt-1 h-8 w-8"
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight">
                Ordine #{order.guid.slice(0, 8).toUpperCase()}
              </h1>
              <StatusBadge
                variant={getStatusVariant(order.status_code)}
                label={getStatusLabel(order.status_code)}
                className="text-[12px] px-3 py-1"
              />
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString("it-IT", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              {assignee && (
                <span>
                  {" \u00B7 "}
                  {assignee.name} {assignee.surname}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Azioni */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            title="Stampa"
          >
            <Printer className="h-4 w-4" />
          </Button>
          {canCreatePickNote && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              title="Crea Nota di Prelievo"
            >
              <ClipboardList className="h-4 w-4" />
            </Button>
          )}
          <Button size="sm">
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Modifica
          </Button>
        </div>
      </div>

      {/* Tracciamento avanzamento */}
      <div className="h-px bg-border/40" />
      <Stepper
        steps={PIPELINE_STEPS.map((s) => ({ label: s.label }))}
        currentStep={getStepFromStatus(order.status_code)}
      />
    </div>
  );
}
