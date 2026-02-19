import { useQuery } from "@tanstack/react-query";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";

export function useParty(id: string) {
  return useQuery({
    queryKey: partyKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await partiesApi.get(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
