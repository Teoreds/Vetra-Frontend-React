import { useQuery } from "@tanstack/react-query";
import { warehouseWorkersApi } from "../api/warehouse-workers.api";
import { warehouseWorkerKeys } from "../api/warehouse-workers.queries";

export function useWarehouseWorkers() {
  return useQuery({
    queryKey: warehouseWorkerKeys.list(),
    queryFn: async () => {
      const { data, error } = await warehouseWorkersApi.list({ limit: 200 });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}
