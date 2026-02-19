import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useWarehouses } from "../hooks/use-warehouses";
import { WarehouseOverview } from "../components/warehouse-overview";
import { StoredArticlesSection } from "../components/stored-articles-section";

export function WarehouseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Warehouses API returns a flat array; filter client-side.
  const { data: warehouses = [], isLoading } = useWarehouses();
  const warehouse = warehouses.find((w) => w.guid === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Warehouse not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/warehouses")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">{warehouse.description}</h1>
      </div>

      <WarehouseOverview warehouse={warehouse} />
      <StoredArticlesSection warehouseGuid={warehouse.guid} />
    </div>
  );
}
