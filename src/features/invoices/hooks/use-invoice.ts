import { useQuery } from "@tanstack/react-query";
import { invoicesApi } from "../api/invoices.api";
import { invoiceKeys } from "../api/invoices.queries";

export function useInvoice(invoiceGuid: string | undefined) {
  return useQuery({
    queryKey: invoiceKeys.detail(invoiceGuid ?? ""),
    enabled: !!invoiceGuid,
    queryFn: async () => {
      const { data, error } = await invoicesApi.get(invoiceGuid!);
      if (error) throw error;
      return data;
    },
  });
}
