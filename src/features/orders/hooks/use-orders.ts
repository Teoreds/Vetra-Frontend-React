import { useQuery } from "@tanstack/react-query";
import { ordersApi, type OrderListParams } from "../api/orders.api";
import { orderKeys } from "../api/orders.queries";

export function useOrders(params?: OrderListParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: async () => {
      const { data, error } = await ordersApi.list(params);
      if (error) throw error;
      return data;
    },
  });
}
