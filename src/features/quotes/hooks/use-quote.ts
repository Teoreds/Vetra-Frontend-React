import { useQuery } from "@tanstack/react-query";
import { quotesApi } from "../api/quotes.api";
import { quoteKeys } from "../api/quotes.queries";

export function useQuote(id: string) {
  return useQuery({
    queryKey: quoteKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await quotesApi.get(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
