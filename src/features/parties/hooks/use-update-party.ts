import { useMutation, useQueryClient } from "@tanstack/react-query";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";
import type { components } from "@/shared/api/schema";

type PartyUpdate = components["schemas"]["PartyUpdate"];

export function useUpdateParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partyGuid, body }: { partyGuid: string; body: PartyUpdate }) => {
      const { data, error } = await partiesApi.update(partyGuid, body);
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { partyGuid }) => {
      queryClient.invalidateQueries({ queryKey: partyKeys.detail(partyGuid) });
      queryClient.invalidateQueries({ queryKey: partyKeys.lists() });
    },
  });
}
