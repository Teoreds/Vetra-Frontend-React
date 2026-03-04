export const warehouseWorkerKeys = {
  all: ["warehouse-workers"] as const,
  list: () => [...warehouseWorkerKeys.all, "list"] as const,
};
