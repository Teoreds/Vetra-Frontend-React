import { useMutation, useQueryClient } from "@tanstack/react-query";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";

export function useUpdateParty(partyGuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { description?: string | null; vat_number?: string | null; type_code?: string | null }) => {
      const { data, error } = await partiesApi.update(partyGuid, body);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partyKeys.detail(partyGuid) });
      queryClient.invalidateQueries({ queryKey: partyKeys.lists() });
    },
  });
}
