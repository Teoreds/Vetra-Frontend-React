import { useMutation, useQueryClient } from "@tanstack/react-query";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";

export function useDeleteParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partyGuid: string) => {
      const { error } = await partiesApi.delete(partyGuid);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partyKeys.lists() });
    },
  });
}
