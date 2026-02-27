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

  createContact: (
    partyGuid: string,
    body: { type_code: string; content: string; label?: string | null; is_primary: boolean },
  ) =>
    apiClient.POST("/parties/{party_guid}/contacts", {
      params: { path: { party_guid: partyGuid } },
      body,
    }),

  listLocations: (partyGuid: string) =>
    apiClient.GET("/parties/{party_guid}/locations", {
      params: { path: { party_guid: partyGuid } },
    }),

  getLocation: (locationGuid: string) =>
    apiClient.GET("/locations/{location_guid}", {
      params: { path: { location_guid: locationGuid } },
    }),

  createLocation: (body: {
    address_line?: string | null;
    city?: string | null;
    province?: string | null;
    post_code?: string | null;
  }) => apiClient.POST("/locations", { body }),

  createPartyLocation: (
    partyGuid: string,
    body: { location_guid: string; type_code: string; is_primary?: boolean },
  ) =>
    apiClient.POST("/parties/{party_guid}/locations", {
      params: { path: { party_guid: partyGuid } },
      body,
    }),

  createPartyDiscount: (body: {
    party_guid: string;
    article_type_code?: string | null;
    discount_percent: number | string;
  }) => apiClient.POST("/party-discounts", { body }),
};
