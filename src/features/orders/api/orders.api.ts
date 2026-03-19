import { apiClient } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

export interface OrderListParams {
  party_guid?: string;
  status_code?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  offset?: number;
  limit?: number;
}

export const ordersApi = {
  list: (params?: OrderListParams) =>
    apiClient.GET("/orders", { params: { query: params } }),

  search: (q: string, params?: { offset?: number; limit?: number }) =>
    apiClient.GET("/orders/search", { params: { query: { q, ...params } } }),

  get: (orderGuid: string) =>
    apiClient.GET("/orders/{order_guid}", {
      params: { path: { order_guid: orderGuid } },
    }),

  create: (body: {
    party_guid: string;
    order_date: string;
    payment_method_guid?: string | null;
    payment_term_guid?: string | null;
    billing_location_guid?: string | null;
    shipping_location_guid?: string | null;
  }) => apiClient.POST("/orders", { body }),

  update: (orderGuid: string, body: components["schemas"]["OrderUpdate"]) =>
    apiClient.PATCH("/orders/{order_guid}", {
      params: { path: { order_guid: orderGuid } },
      body,
    }),

  confirm: (orderGuid: string) =>
    apiClient.POST("/orders/{order_guid}/confirm", {
      params: { path: { order_guid: orderGuid } },
    }),

  generateCommitments: (orderGuid: string) =>
    apiClient.POST("/orders/{order_guid}/generate-commitments", {
      params: { path: { order_guid: orderGuid } },
    }),

  getLog: (orderGuid: string) =>
    apiClient.GET("/orders/{order_guid}/log", {
      params: { path: { order_guid: orderGuid } },
    }),

  previewRow: (
    orderGuid: string,
    body: {
      article_guid: string;
      quantity: number | string;
      unit_price: number | string;
      discount_percent?: number | string | null;
    },
  ) =>
    apiClient.POST("/orders/{order_guid}/preview-row", {
      params: { path: { order_guid: orderGuid } },
      body,
    }),

  createRow: (
    orderGuid: string,
    body: {
      article_guid: string;
      quantity: number | string;
      unit_price: number | string;
      discount_percent?: number | string | null;
      vat_code?: string | null;
      availability_status_code: string;
      unit_of_measure_code?: string | null;
    },
  ) =>
    apiClient.POST("/orders/{order_guid}/rows", {
      params: { path: { order_guid: orderGuid } },
      body,
    }),

  updateRow: (
    orderRowGuid: string,
    body: {
      quantity?: number | string | null;
      unit_price?: number | string | null;
      availability_status_code?: string | null;
    },
  ) =>
    apiClient.PATCH("/order-rows/{order_row_guid}", {
      params: { path: { order_row_guid: orderRowGuid } },
      body,
    }),

  deleteRow: (orderRowGuid: string) =>
    apiClient.DELETE("/order-rows/{order_row_guid}", {
      params: { path: { order_row_guid: orderRowGuid } },
    }),

  createPickNoteFromOrder: (orderGuid: string, warehouseGuid: string) =>
    apiClient.POST("/orders/{order_guid}/pick-notes", {
      params: {
        path: { order_guid: orderGuid },
        query: { warehouse_guid: warehouseGuid },
      },
    }),

  listAttachments: (orderGuid: string) =>
    apiClient.GET("/entities/{entity_type_code}/{entity_guid}/attachments", {
      params: {
        path: { entity_type_code: "ORDER", entity_guid: orderGuid },
      },
    }),
};
