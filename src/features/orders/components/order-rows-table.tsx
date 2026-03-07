import { DataTable, type Column } from "@/shared/ui/data-table";
import { useOrder } from "../hooks/use-order";
import type { OrderRowOut } from "../types/order.types";

interface OrderRowsTableProps {
  orderGuid: string;
}

function fmt(n: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export function OrderRowsTable({ orderGuid }: OrderRowsTableProps) {
  const { isLoading } = useOrder(orderGuid);

  // Placeholder: le righe verrebbero dal dettaglio ordine o da un endpoint dedicato
  const rows: OrderRowOut[] = [];

  const columns: Column<OrderRowOut>[] = [
    {
      key: "article_guid",
      header: "Articolo",
      render: (row) => (
        <span className="font-mono text-sm">
          {row.article_guid.slice(0, 8)}...
        </span>
      ),
    },
    {
      key: "quantity",
      header: "Quantità",
      render: (row) => <span>{row.quantity}</span>,
    },
    {
      key: "unit_price",
      header: "Prezzo Unitario",
      render: (row) => <span>{fmt(parseFloat(row.unit_price))}</span>,
    },
    {
      key: "total",
      header: "Totale",
      render: (row) => (
        <span className="font-medium">
          {fmt(parseFloat(row.quantity) * parseFloat(row.unit_price))}
        </span>
      ),
    },
    {
      key: "availability",
      header: "Disponibilità",
      render: (row) => (
        <span className="text-sm capitalize">
          {row.availability_status_code.toLowerCase().replace("_", " ")}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      keyExtractor={(row) => row.guid}
      isLoading={isLoading}
      emptyMessage="Nessuna riga aggiunta."
    />
  );
}
