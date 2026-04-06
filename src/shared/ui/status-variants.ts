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
  CLOSED: "completed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  PENDING: "pending",
  DELIVERED: "delivered",
  // Quote statuses
  SENT: "confirmed",
  ACCEPTED: "fulfilled",
  REJECTED: "cancelled",
};

export function getStatusVariant(statusCode: string): StatusBadgeVariant {
  return STATUS_VARIANT_MAP[statusCode.toUpperCase()] ?? "default";
}
