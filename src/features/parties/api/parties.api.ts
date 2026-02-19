import { apiClient } from "@/shared/api/client";

export interface PartyListParams {
  type_code?: string;
  search?: string;
  offset?: number;
  limit?: number;
}

export const partiesApi = {
  list: (params?: PartyListParams) =>
    apiClient.GET("/parties", { params: { query: params } }),

  get: (partyGuid: string) =>
    apiClient.GET("/parties/{party_guid}", {
      params: { path: { party_guid: partyGuid } },
    }),

  create: (body: { description: string; vat_number?: string | null; type_code: string }) =>
    apiClient.POST("/parties", { body }),

  update: (partyGuid: string, body: { description?: string | null; vat_number?: string | null; type_code?: string | null }) =>
    apiClient.PATCH("/parties/{party_guid}", {
      params: { path: { party_guid: partyGuid } },
      body,
    }),

  delete: (partyGuid: string) =>
    apiClient.DELETE("/parties/{party_guid}", {
      params: { path: { party_guid: partyGuid } },
    }),

  listContacts: (partyGuid: string) =>
    apiClient.GET("/parties/{party_guid}/contacts", {
      params: { path: { party_guid: partyGuid } },
    }),

  listLocations: (partyGuid: string) =>
    apiClient.GET("/parties/{party_guid}/locations", {
      params: { path: { party_guid: partyGuid } },
    }),
};
