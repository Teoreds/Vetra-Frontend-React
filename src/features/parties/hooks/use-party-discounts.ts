import { useQuery } from "@tanstack/react-query";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";

export function usePartyDiscounts(partyGuid: string) {
  return useQuery({
    queryKey: partyKeys.discounts(partyGuid),
    queryFn: async () => {
      const { data, error } = await partiesApi.listPartyDiscounts(partyGuid, { limit: 200 });
      if (error) throw error;
      return data;
    },
    enabled: !!partyGuid,
  });
}
