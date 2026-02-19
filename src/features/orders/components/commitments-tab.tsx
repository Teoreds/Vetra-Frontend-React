import { DataTable, type Column } from "@/shared/ui/data-table";
import { StatusBadge, getStatusVariant } from "@/shared/ui/status-badge";
import { formatDate } from "@/shared/lib/utils";
import type { CommitmentOut } from "../types/order.types";

interface CommitmentsTabProps {
  orderGuid: string;
}

export function CommitmentsTab({ orderGuid: _orderGuid }: CommitmentsTabProps) {
  // Placeholder: In production, fetch commitments filtered by order
  const commitments: CommitmentOut[] = [];

  const columns: Column<CommitmentOut>[] = [
    {
      key: "article_guid",
      header: "Article",
      render: (row) => <span className="font-mono text-sm">{row.article_guid.slice(0, 8)}...</span>,
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (row) => <span>{row.quantity}</span>,
    },
    {
      key: "status_code",
      header: "Status",
      render: (row) => (
        <StatusBadge variant={getStatusVariant(row.status_code)} label={row.status_code} />
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (row) => <span className="text-sm">{formatDate(row.created_at)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-[15px] font-semibold">Commitments</h3>
      <DataTable
        columns={columns}
        data={commitments}
        keyExtractor={(row) => row.guid}
        emptyMessage="No commitments generated yet."
      />
    </div>
  );
}
