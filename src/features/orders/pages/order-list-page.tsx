import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { PaginationControls } from "@/shared/ui/pagination-controls";
import { useOrders } from "../hooks/use-orders";
import { OrdersTable } from "../components/orders-table";
import { OrderFiltersBar } from "../components/order-filters-bar";
import type { OrderListParams } from "../api/orders.api";

const DEFAULT_LIMIT = 20;

export function OrderListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<OrderListParams>({
    offset: 0,
    limit: DEFAULT_LIMIT,
  });

  const { data, isLoading } = useOrders(filters);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold">Ordini</h1>
          {data && (
            <span className="rounded-full bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
              {data.total}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Gestisci gli ordini e monitorane lo stato.
        </p>
      </div>

      <Card>
        {/* Toolbar: filtri + azioni sulla stessa riga */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <OrderFiltersBar
            filters={filters}
            onFilterChange={(updated) =>
              setFilters((f) => ({ ...f, ...updated, offset: 0 }))
            }
            onReset={() => setFilters({ offset: 0, limit: DEFAULT_LIMIT })}
          />
          <Button onClick={() => navigate("/orders/new")} size="sm" className="shrink-0">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Nuovo Ordine
          </Button>
        </div>

        <OrdersTable orders={data?.items ?? []} isLoading={isLoading} />
        {data && data.total > 0 && (
          <PaginationControls
            total={data.total}
            offset={data.offset}
            limit={data.limit}
            onPageChange={(offset) => setFilters((f) => ({ ...f, offset }))}
          />
        )}
      </Card>
    </div>
  );
}
