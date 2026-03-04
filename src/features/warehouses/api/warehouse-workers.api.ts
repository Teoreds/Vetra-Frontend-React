import { apiClient } from "@/shared/api/client";

export const warehouseWorkersApi = {
  list: (params?: { offset?: number; limit?: number }) =>
    apiClient.GET("/warehouse-workers", { params: { query: params } }),
};
