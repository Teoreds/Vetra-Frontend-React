import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../api/orders.api";
import { orderKeys } from "../api/orders.queries";

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      party_guid: string;
      order_date: string;
      payment_method_guid?: string | null;
      payment_term_guid?: string | null;
      billing_location_guid?: string | null;
      shipping_location_guid?: string | null;
    }) => {
      const { data, error } = await ordersApi.create(body);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
