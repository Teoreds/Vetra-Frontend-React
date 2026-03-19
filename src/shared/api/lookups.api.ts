import { apiClient } from "./client";

export const lookupsApi = {
  partyTypes: () => apiClient.GET("/party-types"),
  locationTypes: () => apiClient.GET("/location-types"),
  contactTypes: () => apiClient.GET("/contact-types"),
  orderStatuses: () => apiClient.GET("/order-statuses"),
  pickNoteStatuses: () => apiClient.GET("/pick-note-statuses"),
  logActionTypes: () => apiClient.GET("/log-action-types"),
  fiscalAreas: () => apiClient.GET("/fiscal-areas"),
  partyCategories: () => apiClient.GET("/party-categories"),
  paymentMethodTypes: () => apiClient.GET("/payment-method-types"),
  paymentMethods: (params?: { offset?: number; limit?: number }) =>
    apiClient.GET("/payment-methods", { params: { query: params } }),
  paymentTerms: (params?: { offset?: number; limit?: number }) =>
    apiClient.GET("/payment-terms", { params: { query: params } }),
};
