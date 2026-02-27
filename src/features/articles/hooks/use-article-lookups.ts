import { useQuery } from "@tanstack/react-query";
import { articlesApi } from "../api/articles.api";
import { articleKeys } from "../api/articles.queries";

export function useUnitOfMeasures() {
  return useQuery({
    queryKey: articleKeys.unitOfMeasures(),
    queryFn: async () => {
      const { data, error } = await articlesApi.listUnitOfMeasures();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useArticleTypes() {
  return useQuery({
    queryKey: articleKeys.articleTypes(),
    queryFn: async () => {
      const { data, error } = await articlesApi.listArticleTypes();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
