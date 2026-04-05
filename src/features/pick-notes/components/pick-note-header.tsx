import { Printer, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import { BackButton } from "@/shared/ui/back-button";
import { StatusBadge } from "@/shared/ui/status-badge";
import { getStatusVariant } from "@/shared/ui/status-variants";
import { useWarehouseWorkers } from "@/features/warehouses/hooks/use-warehouse-workers";
import { usePickNoteStatuses } from "@/shared/hooks/use-lookups";
import { shipmentsApi } from "@/features/shipments/api/shipments.api";
import { shipmentKeys } from "@/features/shipments/api/shipments.queries";
import type { PickNoteDetailOut } from "../types/pick-note.types";

interface PickNoteHeaderProps {
  pickNote: PickNoteDetailOut;
}

export function PickNoteHeader({ pickNote }: PickNoteHeaderProps) {
  const { map: statusLabels } = usePickNoteStatuses();
  const { data: workersData } = useWarehouseWorkers();

  const { data: deliveryNotesData } = useQuery({
    queryKey: shipmentKeys.deliveryNoteList({ limit: 200 }),
    queryFn: async () => {
      const { data, error } = await shipmentsApi.listDeliveryNotes({ limit: 200 });
      if (error) throw error;
      return data;
    },
    enabled: pickNote.status_code === "CLOSED",
  });

  const deliveryNote = deliveryNotesData?.items.find(
    (dn) => dn.pick_note_guid === pickNote.guid,
  );
  const workers = workersData?.items ?? [];
  const picker = pickNote.picker_guid
    ? workers.find((w) => w.guid === pickNote.picker_guid)
    : null;

  const createdAt = new Date(pickNote.created_at).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-4xl flex items-center justify-between pb-2">
      <div className="flex items-center gap-3">
        <BackButton fallback="/pick-notes" className="h-8 w-8 shrink-0" />
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight leading-none">
              Nota #{pickNote.guid.slice(0, 8).toUpperCase()}
            </h1>
            <StatusBadge
              variant={getStatusVariant(pickNote.status_code)}
              label={statusLabels.get(pickNote.status_code) ?? pickNote.status_code}
            />
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span>{createdAt}</span>
            {picker && (
              <>
                <span className="text-muted-foreground/30 select-none">·</span>
                <span>da {picker.name} {picker.surname}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {pickNote.status_code === "CLOSED" && deliveryNote && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => shipmentsApi.downloadDeliveryNotePdf(deliveryNote.guid).catch(() => {})}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {deliveryNote.number != null ? `DDT n. ${deliveryNote.number}` : "Scarica DDT"}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          aria-label="Stampa"
        >
          <Printer className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
