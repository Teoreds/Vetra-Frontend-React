import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Printer, Copy } from "lucide-react";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { StatusBadge, getStatusVariant } from "@/shared/ui/status-badge";
import { formatDate, formatDateTime } from "@/shared/lib/utils";
import { getStatusLabel } from "../types/order-status";
import { useParties } from "@/features/parties/hooks/use-parties";
import type { OrderOut } from "../types/order.types";

interface OrdersTableProps {
  orders: OrderOut[];
  isLoading?: boolean;
}

const AVATAR_COLORS = [
  { bg: "bg-blue-500/12", text: "text-blue-600" },
  { bg: "bg-emerald-500/12", text: "text-emerald-600" },
  { bg: "bg-violet-500/12", text: "text-violet-600" },
  { bg: "bg-amber-500/12", text: "text-amber-600" },
  { bg: "bg-rose-500/12", text: "text-rose-600" },
  { bg: "bg-cyan-500/12", text: "text-cyan-600" },
  { bg: "bg-indigo-500/12", text: "text-indigo-600" },
  { bg: "bg-orange-500/12", text: "text-orange-600" },
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  const navigate = useNavigate();
  const { data: partiesData } = useParties({ limit: 200 });

  const partyMap = useMemo(() => {
    const map = new Map<string, string>();
    if (partiesData?.items) {
      for (const p of partiesData.items) {
        map.set(p.guid, p.description ?? p.guid.slice(0, 8));
      }
    }
    return map;
  }, [partiesData]);

  const columns: Column<OrderOut>[] = [
    {
      key: "guid",
      header: "ID Ordine",
      render: (row) => (
        <span className="text-[13px] font-semibold text-primary">
          #{row.guid.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "party_guid",
      header: "Cliente",
      render: (row) => {
        const name = partyMap.get(row.party_guid);
        if (name) {
          const color = getAvatarColor(name);
          return (
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${color.bg} ${color.text}`}
              >
                {name.charAt(0).toUpperCase()}
              </span>
              <span className="text-[13px] font-medium">{name}</span>
            </div>
          );
        }
        return (
          <span className="text-[13px] text-muted-foreground font-mono">
            #{row.party_guid.slice(0, 8).toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "status_code",
      header: "Stato",
      render: (row) => (
        <StatusBadge
          variant={getStatusVariant(row.status_code)}
          label={getStatusLabel(row.status_code)}
        />
      ),
    },
    {
      key: "order_date",
      header: "Data",
      render: (row) => {
        const showCreated =
          row.created_at && !isSameDay(row.order_date, row.created_at);
        return (
          <div>
            <span className="text-[13px] text-muted-foreground">
              {formatDate(row.order_date)}
            </span>
            {showCreated && (
              <span className="block text-[11px] text-muted-foreground/60">
                Creato: {formatDateTime(row.created_at)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-0",
      render: (row) => (
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover/row:opacity-100">
          <button
            type="button"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Modifica"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/orders/${row.guid}`);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Stampa"
            onClick={(e) => e.stopPropagation()}
          >
            <Printer className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Duplica"
            onClick={(e) => e.stopPropagation()}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      keyExtractor={(row) => row.guid}
      onRowClick={(row) => navigate(`/orders/${row.guid}`)}
      isLoading={isLoading}
      emptyMessage="Nessun ordine trovato."
    />
  );
}
