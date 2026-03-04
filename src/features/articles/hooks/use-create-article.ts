import { useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "../api/articles.api";
import { articleKeys } from "../api/articles.queries";

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      code: string;
      description: string;
      unit_of_measure_code: string;
      type_code?: string | null;
      is_active: boolean;
      list_price?: number | null;
    }) => {
      const { data, error } = await articlesApi.create(body);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
    },
  });
}
