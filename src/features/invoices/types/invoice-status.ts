export const INVOICE_STATUSES = ["DRAFT", "ISSUED", "SENT_SDI", "PAID", "CANCELLED"] as const;

export type InvoiceStatusCode = (typeof INVOICE_STATUSES)[number];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatusCode, string> = {
  DRAFT: "Bozza",
  ISSUED: "Emessa",
  SENT_SDI: "Inviata a SDI",
  PAID: "Pagata",
  CANCELLED: "Annullata",
};

export function isInvoiceEditable(statusCode: string): boolean {
  return statusCode === "DRAFT";
}

export const INVOICE_NEXT_STATUSES: Record<string, InvoiceStatusCode[]> = {
  ISSUED: ["SENT_SDI", "PAID"],
  SENT_SDI: ["PAID"],
};
