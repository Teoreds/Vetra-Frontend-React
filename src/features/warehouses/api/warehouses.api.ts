import { apiClient } from "@/shared/api/client";

export const warehousesApi = {
  list: () => apiClient.GET("/warehouses"),

  create: (body: { description: string; location_guid?: string | null }) =>
    apiClient.POST("/warehouses", { body }),
};
