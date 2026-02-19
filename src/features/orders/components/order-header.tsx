import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { StatusBadge, getStatusVariant } from "@/shared/ui/status-badge";
import { getStatusLabel } from "../types/order-status";
import { StatusTransitionDropdown } from "./status-transition-dropdown";
import type { OrderOut } from "../types/order.types";

interface OrderHeaderProps {
  order: OrderOut;
  onStatusChange: (statusCode: string) => void;
  isUpdating: boolean;
}

export function OrderHeader({ order, onStatusChange, isUpdating }: OrderHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/orders")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold">
              Order #{order.guid.slice(0, 8).toUpperCase()}
            </h1>
            <StatusBadge
              variant={getStatusVariant(order.status_code)}
              label={getStatusLabel(order.status_code)}
            />
          </div>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Created {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StatusTransitionDropdown
          currentStatus={order.status_code}
          onTransition={onStatusChange}
          disabled={isUpdating}
        />
      </div>
    </div>
  );
}
