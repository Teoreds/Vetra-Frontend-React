export const shipmentKeys = {
  all: ["shipments"] as const,
  pickNotes: () => [...shipmentKeys.all, "pick-notes"] as const,
  pickNoteList: (params?: Record<string, unknown>) => [...shipmentKeys.pickNotes(), params] as const,
  pickNoteDetail: (id: string) => [...shipmentKeys.pickNotes(), "detail", id] as const,
  deliveryNotes: () => [...shipmentKeys.all, "delivery-notes"] as const,
  deliveryNoteList: (params?: Record<string, unknown>) => [...shipmentKeys.deliveryNotes(), params] as const,
};
