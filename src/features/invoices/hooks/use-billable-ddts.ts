import { useQuery } from "@tanstack/react-query";
import { invoicesApi, type BillableDdtParams } from "../api/invoices.api";
import { invoiceKeys } from "../api/invoices.queries";

export function useBillableDdts(params: BillableDdtParams | undefined) {
  return useQuery({
    queryKey: invoiceKeys.billableDdts(params ?? { party_guid: "" }),
    enabled: !!params?.party_guid,
    queryFn: async () => {
      const { data, error } = await invoicesApi.listBillableDdts(params!);
      if (error) throw error;
      return data;
    },
  });
}
