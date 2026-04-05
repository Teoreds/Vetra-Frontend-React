import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/shared/ui/card";
import { PaginationControls } from "@/shared/ui/pagination-controls";
import { OrdersTable } from "@/features/orders/components/orders-table";
import { articlesApi } from "../api/articles.api";
import { articleKeys } from "../api/articles.queries";

const LIMIT = 20;

interface ArticleOrdersTabProps {
  articleGuid: string;
}

export function ArticleOrdersTab({ articleGuid }: ArticleOrdersTabProps) {
  const [offset, setOffset] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: articleKeys.orders(articleGuid, { offset, limit: LIMIT }),
    queryFn: () => articlesApi.listOrders(articleGuid, { offset, limit: LIMIT }),
  });

  return (
    <Card>
      <OrdersTable orders={data?.items ?? []} isLoading={isLoading} />
      {data && data.total > 0 && (
        <PaginationControls
          total={data.total}
          offset={offset}
          limit={LIMIT}
          onPageChange={setOffset}
        />
      )}
    </Card>
  );
}
