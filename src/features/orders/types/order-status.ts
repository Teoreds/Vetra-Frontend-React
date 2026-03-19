export const ORDER_STATUSES = [
  "DRAFT",
  "CONFIRMED",
  "PARTIAL",
  "FULFILLED",
  "COMPLETED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Finite state machine: valid transitions from each status.
 * The frontend MUST NOT invent transitions outside this map.
 */
const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  DRAFT: ["CONFIRMED"],
  CONFIRMED: ["PARTIAL"],
  PARTIAL: ["FULFILLED"],
  FULFILLED: ["COMPLETED"],
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

export const EDITABLE_STATUSES: readonly OrderStatus[] = [
  "DRAFT",
  "CONFIRMED",
  "PARTIAL",
] as const;

export function isOrderEditable(status: string): boolean {
  return (EDITABLE_STATUSES as readonly string[]).includes(status.toUpperCase());
}
