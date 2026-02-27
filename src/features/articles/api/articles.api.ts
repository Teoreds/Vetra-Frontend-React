import { apiClient } from "@/shared/api/client";

export interface ArticleListParams {
  search?: string;
  starts_with?: string;
  offset?: number;
  limit?: number;
}

export const articlesApi = {
  list: (params?: ArticleListParams) =>
    apiClient.GET("/articles", { params: { query: params } }),

  create: (body: {
    code: string;
    description: string;
    unit_of_measure_code: string;
    type_code?: string | null;
    is_active: boolean;
  }) => apiClient.POST("/articles", { body }),

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
      list_price?: number | string | null;
      is_preferred: boolean;
    },
  ) =>
    apiClient.POST("/articles/{article_guid}/suppliers", {
      params: { path: { article_guid: articleGuid } },
      body,
    }),
};
