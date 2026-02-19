import { useQuery } from "@tanstack/react-query";
import { articlesApi, type ArticleListParams } from "../api/articles.api";
import { articleKeys } from "../api/articles.queries";

export function useArticles(params?: ArticleListParams) {
  return useQuery({
    queryKey: articleKeys.list(params),
    queryFn: async () => {
      const { data, error } = await articlesApi.list(params);
      if (error) throw error;
      return data;
    },
  });
}
