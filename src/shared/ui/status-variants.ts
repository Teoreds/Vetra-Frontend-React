import type { StatusBadgeVariant } from "./status-badge";

const STATUS_VARIANT_MAP: Record<string, StatusBadgeVariant> = {
  CREATED: "pending",
  DRAFT: "draft",
  CONFIRMED: "confirmed",
  PARTIAL: "partial",
  FULFILLED: "fulfilled",
  PICKING: "picking",
  CHECKED: "shipped",
  SHIPPED: "shipped",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  PENDING: "pending",
  DELIVERED: "delivered",
};

export function getStatusVariant(statusCode: string): StatusBadgeVariant {
  return STATUS_VARIANT_MAP[statusCode.toUpperCase()] ?? "default";
}
