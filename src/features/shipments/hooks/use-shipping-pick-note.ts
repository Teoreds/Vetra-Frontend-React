import { useQuery } from "@tanstack/react-query";
import { shipmentsApi } from "../api/shipments.api";
import { shipmentKeys } from "../api/shipments.queries";

export function useShippingPickNote(pickNoteGuid: string) {
  return useQuery({
    queryKey: shipmentKeys.pickNoteDetail(pickNoteGuid),
    queryFn: async () => {
      const { data, error } = await shipmentsApi.getPickNote(pickNoteGuid);
      if (error) throw error;
      return data;
    },
    enabled: !!pickNoteGuid,
  });
}
