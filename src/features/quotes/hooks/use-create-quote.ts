import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quotesApi } from "../api/quotes.api";
import { quoteKeys } from "../api/quotes.queries";
import type { QuoteCreate } from "../types/quote.types";

export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: QuoteCreate) => {
      const { data, error } = await quotesApi.create(body);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}
