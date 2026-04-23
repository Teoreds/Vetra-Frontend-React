import { useMutation, useQueryClient } from "@tanstack/react-query";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";

export function useCreateParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { description: string; vat_number?: string | null; type_code: string }) => {
      const { data, error } = await partiesApi.create({ shipping_mode: "FRANCO", ...body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partyKeys.lists() });
    },
  });
}
