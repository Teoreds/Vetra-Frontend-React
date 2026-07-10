import type { BillableDdtParams, InvoiceListParams } from "./invoices.api";

export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (params?: InvoiceListParams) => [...invoiceKeys.lists(), params] as const,
  details: () => [...invoiceKeys.all, "detail"] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
  billableDdts: (params: BillableDdtParams) => [...invoiceKeys.all, "billable-ddts", params] as const,
};
