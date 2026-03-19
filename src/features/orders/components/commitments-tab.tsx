import { DataTable, type Column } from "@/shared/ui/data-table";
import { StatusBadge } from "@/shared/ui/status-badge";
import { getStatusVariant } from "@/shared/ui/status-variants";
import { formatDate } from "@/shared/lib/utils";
import type { CommitmentOut } from "../types/order.types";

interface CommitmentsTabProps {
  orderGuid: string;
}

export function CommitmentsTab({ orderGuid: _orderGuid }: CommitmentsTabProps) {
  // Placeholder: in produzione, gli impegni vengono recuperati dal backend
  const commitments: CommitmentOut[] = [];

  const columns: Column<CommitmentOut>[] = [
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
      key: "status_code",
      header: "Stato",
      render: (row) => (
        <StatusBadge
          variant={getStatusVariant(row.status_code)}
          label={row.status_code}
        />
      ),
    },
    {
      key: "created_at",
      header: "Creato il",
      render: (row) => (
        <span className="text-sm">{formatDate(row.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-[15px] font-semibold">Impegni Cliente</h3>
      <DataTable
        columns={columns}
        data={commitments}
        keyExtractor={(row) => row.guid}
        emptyMessage="Nessun impegno cliente generato."
      />
    </div>
  );
}
