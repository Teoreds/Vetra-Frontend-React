export const warehouseKeys = {
  all: ["warehouses"] as const,
  list: () => [...warehouseKeys.all, "list"] as const,
  detail: (id: string) => [...warehouseKeys.all, "detail", id] as const,
};
