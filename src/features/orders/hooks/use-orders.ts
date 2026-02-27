import { useQuery } from "@tanstack/react-query";
import { ordersApi, type OrderListParams } from "../api/orders.api";
import { orderKeys } from "../api/orders.queries";

export function useOrders(params?: OrderListParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: async () => {
      const { search, offset, limit, ...rest } = params ?? {};

      const { data, error } = search
        ? await ordersApi.search(search, { offset, limit })
        : await ordersApi.list({ ...rest, offset, limit });

      if (error) throw error;
      return data;
    },
  });
}
