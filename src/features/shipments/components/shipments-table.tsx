import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Printer, MoreVertical, FileText } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { StatusBadge } from "@/shared/ui/status-badge";
import { getStatusVariant } from "@/shared/ui/status-variants";
import { formatDateTime } from "@/shared/lib/utils";
import { useWarehouses } from "@/features/warehouses/hooks/use-warehouses";
import { CreateDdtPanel } from "./create-ddt-panel";
import { usePickNoteStatuses } from "@/shared/hooks/use-lookups";
import type { PickNoteOut } from "../types/shipment.types";

interface ShipmentsTableProps {
  pickNotes: PickNoteOut[];
  isLoading?: boolean;
}

export function ShipmentsTable({ pickNotes, isLoading }: ShipmentsTableProps) {
  const navigate = useNavigate();
  const { map: statusLabels } = usePickNoteStatuses();
  const { data: warehousesData } = useWarehouses();
  const [ddtGuid, setDdtGuid] = useState<string | null>(null);

  const warehouseMap = useMemo(() => {
    const map = new Map<string, string>();
    if (warehousesData) {
      for (const w of warehousesData) {
        map.set(w.guid, w.description ?? w.guid.slice(0, 8));
      }
    }
    return map;
  }, [warehousesData]);

  const columns: Column<PickNoteOut>[] = [
    {
      key: "guid",
      header: "ID Nota",
      className: "w-32",
      render: (row) => (
        <span className="text-[13px] font-semibold text-primary">
          #{row.guid.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "warehouse_guid",
      header: "Magazzino",
      render: (row) => {
        const name = warehouseMap.get(row.warehouse_guid);
        return (
          <span className="text-[13px] font-medium">
            {name ?? `#${row.warehouse_guid.slice(0, 8).toUpperCase()}`}
          </span>
        );
      },
    },
    {
      key: "status_code",
      header: "Stato",
      className: "w-32",
      render: (row) => (
        <StatusBadge
          variant={getStatusVariant(row.status_code)}
          label={statusLabels.get(row.status_code) ?? row.status_code}
        />
      ),
    },
    {
      key: "created_at",
      header: "Data creazione",
      className: "w-40 text-right",
      render: (row) => (
        <span className="text-[13px] text-muted-foreground">
          {row.created_at ? formatDateTime(row.created_at) : "\u2014"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-0",
      render: (row) => (
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover/row:opacity-100">
          {row.status_code === "CHECKED" && (
            <button
              type="button"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[12px] font-medium text-primary transition-colors hover:bg-primary/8"
              onClick={(e) => {
                e.stopPropagation();
                setDdtGuid(row.guid);
              }}
            >
              <FileText className="h-3.5 w-3.5" />
              Crea DDT
            </button>
          )}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                className="z-50 min-w-[160px] rounded-lg border border-border/60 bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors hover:bg-accent"
                  onSelect={() => navigate(`/pick-notes/${row.guid}`)}
                >
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  Visualizza Nota
                </DropdownMenu.Item>
                {row.status_code === "CHECKED" && (
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors hover:bg-accent"
                    onSelect={() => setDdtGuid(row.guid)}
                  >
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Crea DDT
                  </DropdownMenu.Item>
                )}
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors hover:bg-accent"
                >
                  <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                  Stampa
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={pickNotes}
        keyExtractor={(row) => row.guid}
        onRowClick={(row) => navigate(`/pick-notes/${row.guid}`)}
        isLoading={isLoading}
        emptyMessage="Nessuna nota pronta per la spedizione."
      />
      {ddtGuid && (
        <CreateDdtPanel
          pickNoteGuid={ddtGuid}
          open={!!ddtGuid}
          onOpenChange={(open) => { if (!open) setDdtGuid(null); }}
        />
      )}
    </>
  );
}
