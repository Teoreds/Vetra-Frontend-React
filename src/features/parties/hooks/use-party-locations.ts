import { useQuery } from "@tanstack/react-query";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";

export function usePartyLocations(partyGuid: string | undefined) {
  return useQuery({
    queryKey: partyKeys.locations(partyGuid ?? ""),
    queryFn: async () => {
      const { data, error } = await partiesApi.listLocations(partyGuid!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!partyGuid,
    staleTime: 30_000,
  });
}
