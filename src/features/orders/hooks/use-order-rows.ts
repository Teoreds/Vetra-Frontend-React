import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../api/orders.api";
import { orderKeys } from "../api/orders.queries";

export function useCreateOrderRow(orderGuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      article_guid: string;
      quantity: number | string;
      unit_price: number | string;
      vat_code?: string | null;
      availability_status_code: string;
    }) => {
      const { data, error } = await ordersApi.createRow(orderGuid, body);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderGuid) });
    },
  });
}

export function useUpdateOrderRow(orderGuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderRowGuid,
      body,
    }: {
      orderRowGuid: string;
      body: {
        quantity?: number | string | null;
        unit_price?: number | string | null;
        availability_status_code?: string | null;
      };
    }) => {
      const { data, error } = await ordersApi.updateRow(orderRowGuid, body);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderGuid) });
    },
  });
}
