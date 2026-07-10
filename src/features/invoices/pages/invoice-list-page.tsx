import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { ListPanel } from "@/shared/ui/list-panel";
import { PaginationControls } from "@/shared/ui/pagination-controls";
import { useInvoices } from "../hooks/use-invoices";
import { InvoicesTable } from "../components/invoices-table";
import { InvoiceFiltersBar } from "../components/invoice-filters-bar";
import type { InvoiceListParams } from "../api/invoices.api";

const DEFAULT_LIMIT = 20;

export function InvoiceListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<InvoiceListParams>({
    offset: 0,
    limit: DEFAULT_LIMIT,
  });

  const { data, isLoading, refetch, isRefetching } = useInvoices(filters);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Fatture"
        description="Fattura i DDT del mese e gestisci l'invio a SDI."
        badge={
          data ? (
            <span className="rounded-full bg-primary/8 px-2 py-0.5 text-[length:var(--text-caption)] font-semibold text-primary">
              {data.total}
            </span>
          ) : undefined
        }
      />

      <ListPanel>
        <ListPanel.Toolbar
          left={
            <InvoiceFiltersBar
              filters={filters}
              onFilterChange={(updated) =>
                setFilters((f) => ({ ...f, ...updated, offset: 0 }))
              }
              onReset={() => setFilters({ offset: 0, limit: DEFAULT_LIMIT })}
            />
          }
          right={
            <>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                title="Aggiorna"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
              </button>
              <Button onClick={() => navigate("/invoices/new")} size="sm">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Nuova Fattura
              </Button>
            </>
          }
        />
        <InvoicesTable invoices={data?.items ?? []} isLoading={isLoading} />
        {data && data.total > 0 && (
          <PaginationControls
            total={data.total}
            offset={data.offset}
            limit={data.limit}
            onPageChange={(offset) => setFilters((f) => ({ ...f, offset }))}
          />
        )}
      </ListPanel>
    </div>
  );
}
