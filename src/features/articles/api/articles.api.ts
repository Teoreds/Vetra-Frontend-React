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

  create: (body: { code: string; description: string; is_active: boolean }) =>
    apiClient.POST("/articles", { body }),

  listAliases: (articleGuid: string) =>
    apiClient.GET("/articles/{article_guid}/aliases", {
      params: { path: { article_guid: articleGuid } },
    }),
};
