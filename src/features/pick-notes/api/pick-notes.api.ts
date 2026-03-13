import { apiClient } from "@/shared/api/client";

export const pickNotesApi = {
  create: (body: { warehouse_guid: string; order_guid?: string | null }) =>
    apiClient.POST("/pick-notes", { body }),

  createRow: (
    pickNoteGuid: string,
    body: {
      article_guid: string;
      quantity: number | string;
      source_type_code: string;
      source_guid?: string | null;
    },
  ) =>
    apiClient.POST("/pick-notes/{pick_note_guid}/rows", {
      params: { path: { pick_note_guid: pickNoteGuid } },
      body,
    }),

  get: (pickNoteGuid: string) =>
    apiClient.GET("/pick-notes/{pick_note_guid}", {
      params: { path: { pick_note_guid: pickNoteGuid } },
    }),

  list: (params?: { warehouse_guid?: string; date_from?: string; date_to?: string; offset?: number; limit?: number }) =>
    apiClient.GET("/pick-notes", { params: { query: params } }),
};
