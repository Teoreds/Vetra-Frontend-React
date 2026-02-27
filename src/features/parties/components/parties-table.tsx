import { useNavigate } from "react-router-dom";
import { DataTable, type Column } from "@/shared/ui/data-table";
import type { PartyOut } from "../types/party.types";
import { TYPE_LABELS } from "./type-multi-select";

interface PartiesTableProps {
  parties: PartyOut[];
  isLoading?: boolean;
}

const TYPE_BADGE_STYLES: Record<string, string> = {
  CUSTOMER: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  SUPPLIER: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  CARRIER: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
};

export function PartiesTable({ parties, isLoading }: PartiesTableProps) {
  const navigate = useNavigate();

  const columns: Column<PartyOut>[] = [
    {
      key: "description",
      header: "Nome",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[13px] font-semibold text-primary">
            {row.description?.charAt(0)?.toUpperCase() ?? "?"}
          </span>
          <span className="text-[13px] font-medium">{row.description}</span>
        </div>
      ),
    },
    {
      key: "type_code",
      header: "Tipo",
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide ${
            TYPE_BADGE_STYLES[row.type_code] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {TYPE_LABELS[row.type_code] ?? row.type_code}
        </span>
      ),
    },
    {
      key: "vat_number",
      header: "Partita IVA",
      render: (row) => (
        <span className="text-[13px] text-muted-foreground font-mono">{row.vat_number ?? "—"}</span>
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
