import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Printer, Copy, MoreVertical, ClipboardList } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DataTable, type Column, type SortDirection } from "@/shared/ui/data-table";
import { StatusBadge } from "@/shared/ui/status-badge";
import { getStatusVariant } from "@/shared/ui/status-variants";
import { formatDate, formatCurrency } from "@/shared/lib/utils";
import { useParties } from "@/features/parties/hooks/use-parties";
import { useOrderStatuses } from "@/shared/hooks/use-lookups";
import { useLocationsMap } from "@/features/parties/hooks/use-locations-map";
import { PartyAvatar } from "@/features/parties/components/party-avatar";
import type { OrderOut } from "../types/order.types";

interface OrdersTableProps {
  orders: OrderOut[];
  isLoading?: boolean;
}


export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  const navigate = useNavigate();
  const { map: statusLabels } = useOrderStatuses();
  const { data: partiesData } = useParties({ limit: 200 });

  type SortKey = "code" | "order_date" | "total";
  const [sortKey, setSortKey] = useState<SortKey>("order_date");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const shippingGuids = useMemo(
    () => orders.map((o) => o.shipping_location_guid).filter(Boolean) as string[],
    [orders],
  );
  const { data: locationsMap } = useLocationsMap(shippingGuids);

  const partyMap = useMemo(() => {
    const map = new Map<string, { name: string; guid: string; imagePath?: string | null }>();
    if (partiesData?.items) {
      for (const p of partiesData.items) {
        map.set(p.guid, { name: p.description ?? p.guid.slice(0, 8), guid: p.guid, imagePath: p.image_path });
      }
    }
    return map;
  }, [partiesData]);

  const sortedOrders = useMemo(() => {
    if (!sortDir) return orders;
    return [...orders].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "code") {
        cmp = a.code.localeCompare(b.code);
      } else if (sortKey === "order_date") {
        cmp = a.order_date.localeCompare(b.order_date);
      } else if (sortKey === "total") {
        const aTotal = Number(a.total_net ?? 0) + Number(a.total_vat ?? 0);
        const bTotal = Number(b.total_net ?? 0) + Number(b.total_vat ?? 0);
        cmp = aTotal - bTotal;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [orders, sortKey, sortDir]);

  const columns: Column<OrderOut>[] = [
    {
      key: "code",
      header: "ID Ordine",
      className: "w-32",
      sortable: true,
      sortDirection: sortKey === "code" ? sortDir : null,
      onSort: () => handleSort("code"),
      render: (row) => (
        <span className="text-[13px] font-semibold text-primary">
          #{row.code.replace(/^ORD-/i, "")}
        </span>
      ),
    },
    {
      key: "party_guid",
      header: "Cliente",
      render: (row) => {
        const party = partyMap.get(row.party_guid);
        if (party) {
          return (
            <div className="flex items-center gap-2.5">
              <PartyAvatar
                partyGuid={party.guid}
                name={party.name}
                imagePath={party.imagePath}
                className="h-7 w-7 text-[11px]"
              />
              <span className="text-[13px] font-medium">{party.name}</span>
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
      className: "w-32",
      render: (row) => (
        <StatusBadge
          variant={getStatusVariant(row.status_code)}
          label={statusLabels.get(row.status_code) ?? row.status_code}
        />
      ),
    },
    {
      key: "shipping",
      header: "Spedizione",
      render: (row) => {
        if (!row.shipping_location_guid) {
          return <span className="text-[13px] text-muted-foreground/50">—</span>;
        }
        const loc = locationsMap?.get(row.shipping_location_guid);
        if (!loc) return null;
        const city = [loc.city, loc.province].filter(Boolean).join(", ");
        const fullAddress = [loc.address_line, loc.city, loc.province].filter(Boolean).join(", ");
        return (
          <span
            className="text-[13px] text-muted-foreground"
            title={fullAddress || undefined}
          >
            {city || "—"}
          </span>
        );
      },
    },
    {
      key: "total",
      header: "Totale",
      className: "w-28 text-right",
      sortable: true,
      sortDirection: sortKey === "total" ? sortDir : null,
      onSort: () => handleSort("total"),
      render: (row) => {
        const net = Number(row.total_net ?? 0);
        const vat = Number(row.total_vat ?? 0);
        const total = net + vat;
        return (
          <span className="text-[13px] font-medium tabular-nums">
            {formatCurrency(total)}
          </span>
        );
      },
    },
    {
      key: "order_date",
      header: "Data",
      className: "w-32 text-right",
      sortable: true,
      sortDirection: sortKey === "order_date" ? sortDir : null,
      onSort: () => handleSort("order_date"),
      render: (row) => (
        <span className="text-[13px] text-muted-foreground">
          {formatDate(row.order_date)}
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
                className="z-50 min-w-[160px] rounded-xl border border-border/60 bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors hover:bg-accent"
                  onSelect={() => navigate(`/orders/${row.guid}/edit`)}
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  Modifica
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors hover:bg-accent"
                  onSelect={() => navigate(`/pick-notes/new?order=${row.guid}`)}
                >
                  <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                  Nota di Prelievo
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors hover:bg-accent"
                >
                  <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                  Stampa
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors hover:bg-accent"
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  Duplica
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
      data={sortedOrders}
      keyExtractor={(row) => row.guid}
      onRowClick={(row) => navigate(`/orders/${row.guid}`)}
      isLoading={isLoading}
      emptyMessage="Nessun ordine trovato."
    />
  );
}
