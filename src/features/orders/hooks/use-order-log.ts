import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../api/orders.api";
import { orderKeys } from "../api/orders.queries";

export function useOrderLog(orderGuid: string) {
  return useQuery({
    queryKey: orderKeys.log(orderGuid),
    queryFn: async () => {
      const { data, error } = await ordersApi.getLog(orderGuid);
      if (error) throw error;
      return data;
    },
    enabled: !!orderGuid,
  });
}
