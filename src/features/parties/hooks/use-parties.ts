import { useQuery } from "@tanstack/react-query";
import { partiesApi, type PartyListParams } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";

export function useParties(params?: PartyListParams) {
  return useQuery({
    queryKey: partyKeys.list(params),
    queryFn: async () => {
      const { data, error } = await partiesApi.list(params);
      if (error) throw error;
      return data;
    },
  });
}
