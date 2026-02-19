import { useMutation, useQueryClient } from "@tanstack/react-query";
import { warehousesApi } from "../api/warehouses.api";
import { warehouseKeys } from "../api/warehouses.queries";

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { description: string; location_guid?: string | null }) => {
      const { data, error } = await warehousesApi.create(body);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.list() });
    },
  });
}
