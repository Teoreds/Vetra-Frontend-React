import { useQuery } from "@tanstack/react-query";
import { shipmentsApi } from "../api/shipments.api";
import { shipmentKeys } from "../api/shipments.queries";

export interface ShippingPickNoteListParams {
  status_code?: string;
  date_from?: string;
  date_to?: string;
  offset?: number;
  limit?: number;
}

export function useShippingPickNotes(params?: ShippingPickNoteListParams) {
  return useQuery({
    queryKey: shipmentKeys.pickNoteList(params),
    queryFn: async () => {
      const { data, error } = await shipmentsApi.listPickNotes(params);
      if (error) throw error;
      return data;
    },
  });
}
