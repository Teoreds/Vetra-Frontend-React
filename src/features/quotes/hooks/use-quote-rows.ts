import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quotesApi } from "../api/quotes.api";
import { quoteKeys } from "../api/quotes.queries";
import type { QuoteRowCreate, QuoteRowUpdate } from "../types/quote.types";

export function useCreateQuoteRow(quoteGuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: QuoteRowCreate) => {
      const { data, error } = await quotesApi.createRow(quoteGuid, body);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteGuid) });
    },
  });
}

export function useUpdateQuoteRow(quoteGuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rowGuid,
      body,
    }: {
      rowGuid: string;
      body: QuoteRowUpdate;
    }) => {
      const { data, error } = await quotesApi.updateRow(rowGuid, body);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteGuid) });
    },
  });
}

export function useDeleteQuoteRow(quoteGuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rowGuid: string) => {
      const { error } = await quotesApi.deleteRow(rowGuid);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteGuid) });
    },
  });
}
