import { useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Pencil, ClipboardList } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Stepper } from "@/shared/ui/stepper";
import { isOrderEditable } from "../types/order-status";
import { useWarehouseWorkers } from "@/features/warehouses/hooks/use-warehouse-workers";
import { useOrderStatuses } from "@/shared/hooks/use-lookups";
import type { OrderOut } from "../types/order.types";

interface OrderHeaderProps {
  order: OrderOut;
}

const PIPELINE_STATUSES = [
  { statuses: ["DRAFT"] },
  { statuses: ["CONFIRMED"] },
  { statuses: ["PARTIAL"] },
  { statuses: ["FULFILLED"] },
  { statuses: ["COMPLETED"] },
] as const;

function getStepFromStatus(status: string): number {
  const upper = status.toUpperCase();
  const index = PIPELINE_STATUSES.findIndex((s) =>
    (s.statuses as readonly string[]).includes(upper),
  );
  return index + 1;
}

export function OrderHeader({ order }: OrderHeaderProps) {
  const navigate = useNavigate();
  const { data: workersData } = useWarehouseWorkers();
  const { map: statusLabels } = useOrderStatuses();
  const workers = workersData?.items ?? [];
  const assignee = order.warehouse_worker_guid
    ? workers.find((w) => w.guid === order.warehouse_worker_guid)
    : null;

  const canCreatePickNote =
    order.status_code === "CONFIRMED" || order.status_code === "PARTIAL";

  return (
    <div className="space-y-3">
      {/* Riga: titolo + stepper + azioni */}
      <div className="mx-auto max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Torna agli ordini"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">
              Ordine #{order.guid.slice(0, 8).toUpperCase()}
            </h1>
            <span className="text-[11px] text-muted-foreground">
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
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            aria-label="Stampa"
          >
            <Printer className="h-4 w-4" />
          </Button>
          {canCreatePickNote && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              aria-label="Crea Nota di Prelievo"
            >
              <ClipboardList className="h-4 w-4" />
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

      {/* Stepper centrato col body */}
      <div className="mx-auto max-w-4xl">
        <Stepper
          steps={PIPELINE_STATUSES.map((s) => ({
            label: s.statuses.map((c) => statusLabels.get(c) ?? c).join(" / "),
          }))}
          currentStep={getStepFromStatus(order.status_code)}
        />
      </div>

      {/* Separatore sottile */}
      <div className="mx-auto max-w-4xl h-px bg-border/60" />
    </div>
  );
}
