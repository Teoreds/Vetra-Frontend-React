import { useQuery } from "@tanstack/react-query";
import { invoicesApi, type InvoiceListParams } from "../api/invoices.api";
import { invoiceKeys } from "../api/invoices.queries";

export function useInvoices(params?: InvoiceListParams) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: async () => {
      const { data, error } = await invoicesApi.list(params);
      if (error) throw error;
      return data;
    },
  });
}
