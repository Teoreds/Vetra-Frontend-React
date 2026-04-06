import { useQuery } from "@tanstack/react-query";
import { quotesApi, type QuoteListParams } from "../api/quotes.api";
import { quoteKeys } from "../api/quotes.queries";

export function useQuotes(params?: QuoteListParams) {
  return useQuery({
    queryKey: quoteKeys.list(params),
    queryFn: async () => {
      const { data, error } = await quotesApi.list(params);
      if (error) throw error;
      return data;
    },
  });
}
