import type { OrderListParams } from "./orders.api";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params?: OrderListParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  log: (id: string) => [...orderKeys.all, "log", id] as const,
  attachments: (id: string) => [...orderKeys.all, "attachments", id] as const,
};
