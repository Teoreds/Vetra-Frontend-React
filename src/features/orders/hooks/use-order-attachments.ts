import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../api/orders.api";
import { orderKeys } from "../api/orders.queries";

export function useOrderAttachments(orderGuid: string) {
  return useQuery({
    queryKey: orderKeys.attachments(orderGuid),
    queryFn: async () => {
      const { data, error } = await ordersApi.listAttachments(orderGuid);
      if (error) throw error;
      return data;
    },
    enabled: !!orderGuid,
  });
}
