import { apiClient } from "@/shared/api/client";
import { env } from "@/config/env";
import { useAuthStore } from "@/features/auth/hooks/use-auth-store";

export const shipmentsApi = {
  listPickNotes: (params?: {
    status_code?: string;
    date_from?: string;
    date_to?: string;
    offset?: number;
    limit?: number;
  }) => apiClient.GET("/shipping/pick-notes", { params: { query: params } }),

  getPickNote: (pickNoteGuid: string) =>
    apiClient.GET("/shipping/pick-notes/{pick_note_guid}", {
      params: { path: { pick_note_guid: pickNoteGuid } },
    }),

  createDeliveryNote: (
    pickNoteGuid: string,
    body: {
      customer_party_guid: string;
      shipping_location_guid: string;
      carrier_party_guid?: string | null;
      delivery_date: string;
    },
  ) =>
    apiClient.POST("/shipping/pick-notes/{pick_note_guid}/delivery-note", {
      params: { path: { pick_note_guid: pickNoteGuid } },
      body,
    }),

  listDeliveryNotes: (params?: {
    customer_party_guid?: string;
    date_from?: string;
    date_to?: string;
    offset?: number;
    limit?: number;
  }) => apiClient.GET("/shipping/delivery-notes", { params: { query: params } }),

  downloadDeliveryNotePdf: async (deliveryNoteGuid: string) => {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(
      `${env.API_BASE_URL}/shipping/delivery-notes/${deliveryNoteGuid}/pdf`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    );
    if (!res.ok) throw new Error("Errore durante il download del PDF.");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    // Cleanup after a short delay to allow the browser to open the tab
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  },
};
