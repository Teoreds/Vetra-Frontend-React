import { useQuery } from "@tanstack/react-query";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";

export function useIntentLetters(partyGuid: string) {
  return useQuery({
    queryKey: partyKeys.intentLetters(partyGuid),
    queryFn: async () => {
      const { data, error } = await partiesApi.listIntentLetters(partyGuid, { limit: 200 });
      if (error) throw error;
      return data;
    },
    enabled: !!partyGuid,
  });
}
