import { apiClient } from "@/shared/api/client";

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

  get: (orderGuid: string) =>
    apiClient.GET("/orders/{order_guid}", {
      params: { path: { order_guid: orderGuid } },
    }),

  create: (body: {
    party_guid: string;
    order_date: string;
    payment_method_guid?: string | null;
    billing_location_guid?: string | null;
    shipping_location_guid?: string | null;
  }) => apiClient.POST("/orders", { body }),

  updateStatus: (orderGuid: string, body: { status_code: string; note?: string | null }) =>
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

  createRow: (
    orderGuid: string,
    body: {
      article_guid: string;
      quantity: number | string;
      unit_price: number | string;
      vat_code?: string | null;
      availability_status_code: string;
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
