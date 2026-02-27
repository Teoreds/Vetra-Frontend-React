import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { articlesApi } from "../api/articles.api";
import { articleKeys } from "../api/articles.queries";
import { ArticleOverview } from "../components/article-overview";
import { RelatedOrdersSection } from "../components/related-orders-section";

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: articles, isLoading } = useQuery({
    queryKey: articleKeys.detail(id!),
    queryFn: async () => {
      const { data, error } = await articlesApi.list({ search: id, limit: 1 });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const article = articles?.items?.[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Articolo non trovato.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/articles")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">{article.code}</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{article.description}</p>
        </div>
      </div>

      <ArticleOverview article={article} />
      <RelatedOrdersSection articleGuid={article.guid} />
    </div>
  );
}
