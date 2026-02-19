import type { ArticleListParams } from "./articles.api";

export const articleKeys = {
  all: ["articles"] as const,
  lists: () => [...articleKeys.all, "list"] as const,
  list: (params?: ArticleListParams) => [...articleKeys.lists(), params] as const,
  details: () => [...articleKeys.all, "detail"] as const,
  detail: (id: string) => [...articleKeys.details(), id] as const,
  aliases: (id: string) => [...articleKeys.all, "aliases", id] as const,
};
