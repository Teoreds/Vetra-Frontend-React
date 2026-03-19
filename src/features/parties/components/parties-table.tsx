import { useNavigate } from "react-router-dom";
import { Pencil, MoreVertical } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DataTable, type Column } from "@/shared/ui/data-table";
import type { PartyOut } from "../types/party.types";
import { usePartyTypes } from "@/shared/hooks/use-lookups";
import { PartyAvatar } from "./party-avatar";

interface PartiesTableProps {
  parties: PartyOut[];
  isLoading?: boolean;
}

const TYPE_BADGE_STYLES: Record<string, string> = {
  CUSTOMER: "bg-primary/8 text-primary ring-1 ring-inset ring-primary/20",
  SUPPLIER: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  CARRIER: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
};

export function PartiesTable({ parties, isLoading }: PartiesTableProps) {
  const navigate = useNavigate();
  const { map: typeLabels } = usePartyTypes();

  const columns: Column<PartyOut>[] = [
    {
      key: "description",
      header: "Nome",
      render: (row) => {
        const name = row.description ?? "?";
        return (
          <div className="flex items-center gap-2.5">
            <PartyAvatar
              partyGuid={row.guid}
              name={name}
              imagePath={row.image_path}
              className="h-7 w-7"
              textClassName="text-[11px]"
            />
            <span className="text-[13px] font-medium">{name}</span>
          </div>
        );
      },
    },
    {
      key: "type_code",
      header: "Tipo",
      className: "w-36",
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide ${
            TYPE_BADGE_STYLES[row.type_code] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {typeLabels.get(row.type_code) ?? row.type_code}
        </span>
      ),
    },
    {
      key: "vat_number",
      header: "Partita IVA",
      className: "w-40",
      render: (row) => (
        <span className="text-[13px] text-muted-foreground font-mono">
          {row.vat_number ?? "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-0",
      render: (row) => (
        <div className="flex justify-end opacity-0 transition-opacity group-hover/row:opacity-100">
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
                  onSelect={() => navigate(`/parties/${row.guid}`)}
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  Modifica
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={parties}
      keyExtractor={(row) => row.guid}
      onRowClick={(row) => navigate(`/parties/${row.guid}`)}
      isLoading={isLoading}
      emptyMessage="Nessuna anagrafica trovata."
    />
  );
}
