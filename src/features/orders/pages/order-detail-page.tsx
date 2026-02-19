import { useParams } from "react-router-dom";
import { useOrder } from "../hooks/use-order";
import { useUpdateOrderStatus } from "../hooks/use-update-order-status";
import { OrderHeader } from "../components/order-header";
import { OrderTabs } from "../components/order-tabs";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useOrder(id!);
  const updateStatus = useUpdateOrderStatus(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Order not found.</p>
      </div>
    );
  }

  function handleStatusChange(statusCode: string) {
    updateStatus.mutate({ status_code: statusCode });
  }

  return (
    <div className="space-y-6">
      <OrderHeader
        order={order}
        onStatusChange={handleStatusChange}
        isUpdating={updateStatus.isPending}
      />
      <OrderTabs order={order} />
    </div>
  );
}
