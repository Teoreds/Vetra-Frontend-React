export const ORDER_STATUSES = [
  "DRAFT",
  "CONFIRMED",
  "COMMITTED",
  "PICKING",
  "SHIPPED",
  "COMPLETED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Finite state machine: valid transitions from each status.
 * The frontend MUST NOT invent transitions outside this map.
 */
const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  DRAFT: ["CONFIRMED"],
  CONFIRMED: ["COMMITTED"],
  COMMITTED: ["PICKING"],
  PICKING: ["SHIPPED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
};

export function getValidTransitions(currentStatus: string): OrderStatus[] {
  const key = currentStatus.toUpperCase() as OrderStatus;
  return [...(ORDER_TRANSITIONS[key] ?? [])];
}

export function canTransitionTo(
  currentStatus: string,
  targetStatus: string,
): boolean {
  return getValidTransitions(currentStatus).includes(
    targetStatus.toUpperCase() as OrderStatus,
  );
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  COMMITTED: "Committed",
  PICKING: "Picking",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
};

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status.toUpperCase() as OrderStatus] ?? status;
}
