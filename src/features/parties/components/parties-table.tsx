import { useNavigate } from "react-router-dom";
import { DataTable, type Column } from "@/shared/ui/data-table";
import type { PartyOut } from "../types/party.types";

interface PartiesTableProps {
  parties: PartyOut[];
  isLoading?: boolean;
}

export function PartiesTable({ parties, isLoading }: PartiesTableProps) {
  const navigate = useNavigate();

  const columns: Column<PartyOut>[] = [
    {
      key: "description",
      header: "Name",
      render: (row) => <span className="text-[13px] font-semibold">{row.description}</span>,
    },
    {
      key: "type_code",
      header: "Type",
      render: (row) => (
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold capitalize tracking-wide">
          {row.type_code.toLowerCase()}
        </span>
      ),
    },
    {
      key: "vat_number",
      header: "VAT Number",
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
      emptyMessage="No parties found."
    />
  );
}
