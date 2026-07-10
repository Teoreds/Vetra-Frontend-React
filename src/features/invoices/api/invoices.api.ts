import { apiClient } from "@/shared/api/client";
import { env } from "@/config/env";
import { useAuthStore } from "@/features/auth/hooks/use-auth-store";
import type { components } from "@/shared/api/schema";

export interface InvoiceListParams {
  party_guid?: string;
  status_code?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  offset?: number;
  limit?: number;
}

export interface BillableDdtParams {
  party_guid: string;
  date_from?: string;
  date_to?: string;
}

async function downloadFile(path: string, errorMessage: string) {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(`${env.API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(errorMessage);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const disposition = res.headers.get("content-disposition");
  const match = disposition?.match(/filename="?([^";]+)"?/);
  if (match) {
    const a = document.createElement("a");
    a.href = url;
    a.download = match[1];
    a.click();
  } else {
    window.open(url, "_blank");
  }
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export const invoicesApi = {
  list: (params?: InvoiceListParams) =>
    apiClient.GET("/invoices", { params: { query: params } }),

  get: (invoiceGuid: string) =>
    apiClient.GET("/invoices/{invoice_guid}", {
      params: { path: { invoice_guid: invoiceGuid } },
    }),

  listBillableDdts: (params: BillableDdtParams) =>
    apiClient.GET("/invoices/billable-ddts", { params: { query: params } }),

  create: (body: components["schemas"]["InvoiceCreate"]) =>
    apiClient.POST("/invoices", { body }),

  update: (invoiceGuid: string, body: components["schemas"]["InvoiceUpdate"]) =>
    apiClient.PATCH("/invoices/{invoice_guid}", {
      params: { path: { invoice_guid: invoiceGuid } },
      body,
    }),

  delete: (invoiceGuid: string) =>
    apiClient.DELETE("/invoices/{invoice_guid}", {
      params: { path: { invoice_guid: invoiceGuid } },
    }),

  updateRow: (rowGuid: string, body: components["schemas"]["InvoiceRowUpdate"]) =>
    apiClient.PATCH("/invoice-rows/{row_guid}", {
      params: { path: { row_guid: rowGuid } },
      body,
    }),

  deleteRow: (rowGuid: string) =>
    apiClient.DELETE("/invoice-rows/{row_guid}", {
      params: { path: { row_guid: rowGuid } },
    }),

  issue: (invoiceGuid: string) =>
    apiClient.POST("/invoices/{invoice_guid}/issue", {
      params: { path: { invoice_guid: invoiceGuid } },
    }),

  setStatus: (invoiceGuid: string, statusCode: string) =>
    apiClient.POST("/invoices/{invoice_guid}/status", {
      params: { path: { invoice_guid: invoiceGuid } },
      body: { status_code: statusCode },
    }),

  downloadPdf: (invoiceGuid: string) =>
    downloadFile(`/invoices/${invoiceGuid}/pdf`, "Errore durante il download del PDF."),

  downloadXml: (invoiceGuid: string) =>
    downloadFile(`/invoices/${invoiceGuid}/xml`, "Errore durante il download dell'XML."),
};
