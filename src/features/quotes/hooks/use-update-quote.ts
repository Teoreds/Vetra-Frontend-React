import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quotesApi } from "../api/quotes.api";
import { quoteKeys } from "../api/quotes.queries";
import type { QuoteUpdate } from "../types/quote.types";

export function useUpdateQuote(quoteGuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: QuoteUpdate) => {
      const { data, error } = await quotesApi.update(quoteGuid, body);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteGuid) });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}
