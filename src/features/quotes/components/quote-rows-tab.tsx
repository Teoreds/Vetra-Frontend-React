import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { formatCurrency } from "@/shared/lib/utils";
import { useDeleteQuoteRow } from "../hooks/use-quote-rows";
import { AddQuoteRowModal } from "./add-quote-row-modal";
import { isQuoteEditable } from "../types/quote-status";
import type { QuoteRowOut } from "../types/quote.types";

interface QuoteRowsTabProps {
  quoteGuid: string;
  statusCode: string;
  rows: QuoteRowOut[];
}

export function QuoteRowsTab({ quoteGuid, statusCode, rows }: QuoteRowsTabProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const deleteRow = useDeleteQuoteRow(quoteGuid);
  const canEdit = isQuoteEditable(statusCode);

  const columns: Column<QuoteRowOut>[] = [
    {
      key: "article_guid",
      header: "Articolo",
      render: (row) => (
        <span className="font-mono text-[13px] text-muted-foreground">
          #{row.article_guid.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "quantity",
      header: "Quantità",
      className: "w-24 text-right",
      render: (row) => (
        <span className="text-[13px] tabular-nums">
          {row.quantity}
          {row.unit_of_measure_code && (
            <span className="ml-1 text-[10px] text-muted-foreground">
              {row.unit_of_measure_code.toUpperCase()}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "unit_price",
      header: "Prezzo",
      className: "w-28 text-right",
      render: (row) => (
        <span className="text-[13px] tabular-nums">
          {formatCurrency(parseFloat(row.unit_price))}
        </span>
      ),
    },
    {
      key: "discount_percent",
      header: "Sc.%",
      className: "w-16 text-right",
      render: (row) => {
        const d = parseFloat(row.discount_percent);
        return (
          <span className="text-[13px] tabular-nums">
            {d > 0 ? `${d}%` : "—"}
          </span>
        );
      },
    },
    {
      key: "total_net",
      header: "Totale",
      className: "w-28 text-right",
      render: (row) => {
        const total =
          parseFloat(row.quantity) *
          parseFloat(row.unit_price) *
          (1 - parseFloat(row.discount_percent) / 100);
        return (
          <span className="text-[13px] font-medium tabular-nums">
            {formatCurrency(total)}
          </span>
        );
      },
    },
    ...(canEdit
      ? [
          {
            key: "del",
            header: "",
            className: "w-0",
            render: (row: QuoteRowOut) => (
              <div className="flex justify-end opacity-0 transition-opacity group-hover/row:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRow.mutate(row.guid);
                  }}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ),
          } satisfies Column<QuoteRowOut>,
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold">Articoli Preventivo</h3>
        {canEdit && (
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Aggiungi Riga
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        keyExtractor={(row) => row.guid}
        emptyMessage="Nessun articolo in questo preventivo."
      />

      <AddQuoteRowModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        quoteGuid={quoteGuid}
      />
    </div>
  );
}
