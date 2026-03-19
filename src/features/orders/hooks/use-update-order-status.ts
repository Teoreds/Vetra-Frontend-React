import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../api/orders.api";
import { orderKeys } from "../api/orders.queries";

export function useUpdateOrderStatus(orderGuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { status_code: string; note?: string | null }) => {
      const { data, error } = await ordersApi.update(orderGuid, body);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderGuid) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.log(orderGuid) });
    },
  });
}
