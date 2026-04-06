import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quotesApi } from "../api/quotes.api";
import { quoteKeys } from "../api/quotes.queries";
import { orderKeys } from "@/features/orders/api/orders.queries";

export function useConvertQuoteToOrder(quoteGuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await quotesApi.convertToOrder(quoteGuid);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteGuid) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
