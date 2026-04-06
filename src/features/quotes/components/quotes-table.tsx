import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Pencil, Trash2, ShoppingCart } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { StatusBadge } from "@/shared/ui/status-badge";
import { getStatusVariant } from "@/shared/ui/status-variants";
import { formatDate, formatCurrency } from "@/shared/lib/utils";
import { useParties } from "@/features/parties/hooks/use-parties";
import { PartyAvatar } from "@/features/parties/components/party-avatar";
import { QUOTE_STATUS_LABELS } from "../types/quote-status";
import { isQuoteDeletable, canConvertQuoteToOrder } from "../types/quote-status";
import { useDeleteQuote } from "../hooks/use-delete-quote";
import { quotesApi } from "../api/quotes.api";
import { quoteKeys } from "../api/quotes.queries";
import { orderKeys } from "@/features/orders/api/orders.queries";
import { useQueryClient } from "@tanstack/react-query";
import type { QuoteOut } from "../types/quote.types";

interface QuotesTableProps {
  quotes: QuoteOut[];
  isLoading?: boolean;
}

export function QuotesTable({ quotes, isLoading }: QuotesTableProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteQuote = useDeleteQuote();
  const { data: partiesData } = useParties({ limit: 200 });

  async function handleConvertToOrder(quoteGuid: string) {
    const { data: order, error } = await quotesApi.convertToOrder(quoteGuid);
    if (error || !order) return;
    queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteGuid) });
    queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    navigate(`/orders/${order.guid}/edit`);
  }

  const partyMap = useMemo(() => {
    const map = new Map<
      string,
      { name: string; guid: string; imagePath?: string | null }
    >();
    if (partiesData?.items) {
      for (const p of partiesData.items) {
        map.set(p.guid, {
          name: p.description ?? p.guid.slice(0, 8),
          guid: p.guid,
          imagePath: p.image_path,
        });
      }
    }
    return map;
  }, [partiesData]);

  const columns: Column<QuoteOut>[] = [
    {
      key: "code",
      header: "ID Preventivo",
      className: "w-36",
      render: (row) => (
        <span className="text-[13px] font-semibold text-primary">
          #{row.code.replace(/^QUO-/i, "")}
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
          label={
            QUOTE_STATUS_LABELS[row.status_code as keyof typeof QUOTE_STATUS_LABELS] ??
            row.status_code
          }
        />
      ),
    },
    {
      key: "valid_until",
      header: "Scadenza",
      className: "w-32",
      render: (row) =>
        row.valid_until ? (
          <span className="text-[13px] text-muted-foreground">
            {formatDate(row.valid_until)}
          </span>
        ) : (
          <span className="text-[13px] text-muted-foreground/50">—</span>
        ),
    },
    {
      key: "total",
      header: "Totale",
      className: "w-28 text-right",
      render: (row) => {
        const net = Number(row.total_net ?? 0);
        const vat = Number(row.total_vat ?? 0);
        return (
          <span className="text-[13px] font-medium tabular-nums">
            {formatCurrency(net + vat)}
          </span>
        );
      },
    },
    {
      key: "quote_date",
      header: "Data",
      className: "w-32 text-right",
      render: (row) => (
        <span className="text-[13px] text-muted-foreground">
          {formatDate(row.quote_date)}
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
                  onSelect={() => navigate(`/quotes/${row.guid}/edit`)}
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  Modifica
                </DropdownMenu.Item>
                {canConvertQuoteToOrder(row.status_code) && (
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors hover:bg-accent"
                    onSelect={() => handleConvertToOrder(row.guid)}
                  >
                    <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
                    Converti in Ordine
                  </DropdownMenu.Item>
                )}
                {isQuoteDeletable(row.status_code) && (
                  <>
                    <DropdownMenu.Separator className="my-1 h-px bg-border/60" />
                    <DropdownMenu.Item
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-destructive outline-none transition-colors hover:bg-destructive/10"
                      onSelect={() => deleteQuote.mutate(row.guid)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Elimina
                    </DropdownMenu.Item>
                  </>
                )}
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
      data={quotes}
      keyExtractor={(row) => row.guid}
      onRowClick={(row) => navigate(`/quotes/${row.guid}`)}
      isLoading={isLoading}
      emptyMessage="Nessun preventivo trovato."
    />
  );
}
