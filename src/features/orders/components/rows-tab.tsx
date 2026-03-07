import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { OrderRowsTable } from "./order-rows-table";
import { AddRowModal } from "./add-row-modal";

interface RowsTabProps {
  orderGuid: string;
  statusCode: string;
}

export function RowsTab({ orderGuid, statusCode }: RowsTabProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const canAddRows = statusCode === "DRAFT";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold">Articoli Ordine</h3>
        {canAddRows && (
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Aggiungi Riga
          </Button>
        )}
      </div>
      <OrderRowsTable orderGuid={orderGuid} />
      <AddRowModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        orderGuid={orderGuid}
      />
    </div>
  );
}
