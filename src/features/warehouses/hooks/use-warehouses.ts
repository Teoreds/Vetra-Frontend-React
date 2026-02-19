import { useQuery } from "@tanstack/react-query";
import { warehousesApi } from "../api/warehouses.api";
import { warehouseKeys } from "../api/warehouses.queries";

export function useWarehouses() {
  return useQuery({
    queryKey: warehouseKeys.list(),
    queryFn: async () => {
      const { data, error } = await warehousesApi.list();
      if (error) throw error;
      return data;
    },
  });
}
