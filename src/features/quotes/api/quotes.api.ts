import { apiClient } from "@/shared/api/client";
import { env } from "@/config/env";
import { useAuthStore } from "@/features/auth/hooks/use-auth-store";
import type { components } from "@/shared/api/schema";

export interface QuoteListParams {
  party_guid?: string;
  status_code?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  offset?: number;
  limit?: number;
}

export const quotesApi = {
  list: (params?: QuoteListParams) =>
    apiClient.GET("/quotes", { params: { query: params } }),

  get: (quoteGuid: string) =>
    apiClient.GET("/quotes/{quote_guid}", {
      params: { path: { quote_guid: quoteGuid } },
    }),

  create: (body: components["schemas"]["QuoteCreate"]) =>
    apiClient.POST("/quotes", { body }),

  update: (quoteGuid: string, body: components["schemas"]["QuoteUpdate"]) =>
    apiClient.PATCH("/quotes/{quote_guid}", {
      params: { path: { quote_guid: quoteGuid } },
      body,
    }),

  delete: (quoteGuid: string) =>
    apiClient.DELETE("/quotes/{quote_guid}", {
      params: { path: { quote_guid: quoteGuid } },
    }),

  createRow: (
    quoteGuid: string,
    body: components["schemas"]["QuoteRowCreate"],
  ) =>
    apiClient.POST("/quotes/{quote_guid}/rows", {
      params: { path: { quote_guid: quoteGuid } },
      body,
    }),

  updateRow: (
    quoteRowGuid: string,
    body: components["schemas"]["QuoteRowUpdate"],
  ) =>
    apiClient.PATCH("/quote-rows/{quote_row_guid}", {
      params: { path: { quote_row_guid: quoteRowGuid } },
      body,
    }),

  deleteRow: (quoteRowGuid: string) =>
    apiClient.DELETE("/quote-rows/{quote_row_guid}", {
      params: { path: { quote_row_guid: quoteRowGuid } },
    }),

  convertToOrder: (quoteGuid: string) =>
    apiClient.POST("/quotes/{quote_guid}/convert-to-order", {
      params: { path: { quote_guid: quoteGuid } },
    }),

  downloadPdf: async (quoteGuid: string) => {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(
      `${env.API_BASE_URL}/quotes/${quoteGuid}/pdf`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    );
    if (!res.ok) throw new Error("Errore durante il download del PDF.");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  },
};
