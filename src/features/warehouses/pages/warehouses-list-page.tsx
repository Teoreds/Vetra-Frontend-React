import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useWarehouses } from "../hooks/use-warehouses";
import { WarehousesTable } from "../components/warehouses-table";

export function WarehousesListPage() {
  const { data: warehouses = [], isLoading } = useWarehouses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Warehouses</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Manage storage locations.</p>
        </div>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          New Warehouse
        </Button>
      </div>

      <div className="rounded-xl border border-border/60 bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <WarehousesTable warehouses={warehouses} isLoading={isLoading} />
      </div>
    </div>
  );
}
