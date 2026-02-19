import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../api/orders.api";
import { orderKeys } from "../api/orders.queries";

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await ordersApi.get(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
