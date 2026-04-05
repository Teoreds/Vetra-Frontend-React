import { apiClient } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";
import { env } from "@/config/env";
import { useAuthStore } from "@/features/auth/hooks/use-auth-store";

export interface ArticleListParams {
  search?: string;
  starts_with?: string;
  offset?: number;
  limit?: number;
}

export const articlesApi = {
  list: (params?: ArticleListParams) =>
    apiClient.GET("/articles", { params: { query: params } }),

  create: (body: components["schemas"]["ArticleCreate"]) =>
    apiClient.POST("/articles", { body }),

  listAliases: (articleGuid: string) =>
    apiClient.GET("/articles/{article_guid}/aliases", {
      params: { path: { article_guid: articleGuid } },
    }),

  createAlias: (articleGuid: string, body: { alias: string }) =>
    apiClient.POST("/articles/{article_guid}/aliases", {
      params: { path: { article_guid: articleGuid } },
      body,
    }),

  listUnitOfMeasures: () =>
    apiClient.GET("/unit-of-measures"),

  listArticleTypes: () =>
    apiClient.GET("/article-types"),

  listSuppliers: (articleGuid: string) =>
    apiClient.GET("/articles/{article_guid}/suppliers", {
      params: { path: { article_guid: articleGuid } },
    }),

  addSupplier: (
    articleGuid: string,
    body: {
      party_guid: string;
      supplier_code?: string | null;
      purchase_price?: number | string | null;
      is_preferred: boolean;
    },
  ) =>
    apiClient.POST("/articles/{article_guid}/suppliers", {
      params: { path: { article_guid: articleGuid } },
      body,
    }),

  update: (articleGuid: string, body: components["schemas"]["ArticleUpdate"]) =>
    apiClient.PATCH("/articles/{article_guid}", {
      params: { path: { article_guid: articleGuid } },
      body,
    }),

  updateSupplier: (
    articleGuid: string,
    partyGuid: string,
    body: components["schemas"]["ArticleSupplierUpdate"],
  ) =>
    apiClient.PATCH("/articles/{article_guid}/suppliers/{party_guid}", {
      params: { path: { article_guid: articleGuid, party_guid: partyGuid } },
      body,
    }),

  removeSupplier: (articleGuid: string, partyGuid: string) =>
    apiClient.DELETE("/articles/{article_guid}/suppliers/{party_guid}", {
      params: { path: { article_guid: articleGuid, party_guid: partyGuid } },
    }),

  uploadImage: async (articleGuid: string, file: File) => {
    const token = useAuthStore.getState().accessToken;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${env.API_BASE_URL}/articles/${articleGuid}/image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) throw new Error("Upload failed");
    return (await res.json()) as components["schemas"]["ArticleOut"];
  },

  deleteImage: (articleGuid: string) =>
    apiClient.DELETE("/articles/{article_guid}/image", {
      params: { path: { article_guid: articleGuid } },
    }),

  listOrders: async (articleGuid: string, params?: { offset?: number; limit?: number }) => {
    const token = useAuthStore.getState().accessToken;
    const query = new URLSearchParams();
    if (params?.offset !== undefined) query.set("offset", String(params.offset));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    const qs = query.toString();
    const res = await fetch(`${env.API_BASE_URL}/articles/${articleGuid}/orders${qs ? `?${qs}` : ""}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Failed to fetch article orders");
    return (await res.json()) as components["schemas"]["Page_OrderOut_"];
  },
};
