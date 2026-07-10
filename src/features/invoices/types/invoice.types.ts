import type { components } from "@/shared/api/schema";

export type InvoiceOut = components["schemas"]["InvoiceOut"];
export type InvoiceDetailOut = components["schemas"]["InvoiceDetailOut"];
export type InvoiceCreate = components["schemas"]["InvoiceCreate"];
export type InvoiceUpdate = components["schemas"]["InvoiceUpdate"];
export type InvoiceRowOut = components["schemas"]["InvoiceRowOut"];
export type InvoiceRowUpdate = components["schemas"]["InvoiceRowUpdate"];
export type BillableDdtOut = components["schemas"]["BillableDdtOut"];
export type VatSummaryOut = components["schemas"]["VatSummaryOut"];

export function invoiceDisplayNumber(invoice: Pick<InvoiceOut, "number" | "year">): string {
  return invoice.number != null ? `${invoice.number}/${invoice.year}` : "Bozza";
}
