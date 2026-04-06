export const QUOTE_STATUSES = [
  "CREATED",
  "SENT",
  "ACCEPTED",
  "REJECTED",
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  CREATED: "Creato",
  SENT: "Inviato",
  ACCEPTED: "Accettato",
  REJECTED: "Rifiutato",
};

/**
 * Finite state machine: valid transitions from each status.
 */
const QUOTE_TRANSITIONS: Record<QuoteStatus, readonly QuoteStatus[]> = {
  CREATED: ["SENT"],
  SENT: ["ACCEPTED", "REJECTED"],
  ACCEPTED: [],
  REJECTED: [],
};

export function getValidQuoteTransitions(currentStatus: string): QuoteStatus[] {
  const key = currentStatus.toUpperCase() as QuoteStatus;
  return [...(QUOTE_TRANSITIONS[key] ?? [])];
}

export function canTransitionQuoteTo(
  currentStatus: string,
  targetStatus: string,
): boolean {
  return getValidQuoteTransitions(currentStatus).includes(
    targetStatus.toUpperCase() as QuoteStatus,
  );
}

/** Statuses that allow field and row edits */
export const EDITABLE_QUOTE_STATUSES: readonly QuoteStatus[] = [
  "CREATED",
] as const;

export function isQuoteEditable(status: string): boolean {
  return (EDITABLE_QUOTE_STATUSES as readonly string[]).includes(
    status.toUpperCase(),
  );
}

/** Statuses that allow deletion */
export const DELETABLE_QUOTE_STATUSES: readonly QuoteStatus[] = [
  "CREATED",
  "SENT",
] as const;

export function isQuoteDeletable(status: string): boolean {
  return (DELETABLE_QUOTE_STATUSES as readonly string[]).includes(
    status.toUpperCase(),
  );
}

/** Non-rejected quotes can be converted to an order (backend sets status to ACCEPTED) */
export function canConvertQuoteToOrder(status: string): boolean {
  return status.toUpperCase() !== "REJECTED";
}
