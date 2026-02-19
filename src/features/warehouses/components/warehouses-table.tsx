import { useNavigate } from "react-router-dom";
import { DataTable, type Column } from "@/shared/ui/data-table";
import type { WarehouseOut } from "../types/warehouse.types";

interface WarehousesTableProps {
  warehouses: WarehouseOut[];
  isLoading?: boolean;
}

export function WarehousesTable({ warehouses, isLoading }: WarehousesTableProps) {
  const navigate = useNavigate();

  const columns: Column<WarehouseOut>[] = [
    {
      key: "description",
      header: "Name",
      render: (row) => <span className="text-[13px] font-semibold">{row.description}</span>,
    },
    {
      key: "location_guid",
      header: "Location",
      render: (row) => (
        <span className="text-[13px] text-muted-foreground font-mono">
          {row.location_guid ? `${row.location_guid.slice(0, 8)}...` : "—"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={warehouses}
      keyExtractor={(row) => row.guid}
      onRowClick={(row) => navigate(`/warehouses/${row.guid}`)}
      isLoading={isLoading}
      emptyMessage="No warehouses found."
    />
  );
}
