import { useNavigate } from "react-router-dom";
import { DataTable, type Column } from "@/shared/ui/data-table";
import type { ArticleOut } from "../types/article.types";

interface ArticlesTableProps {
  articles: ArticleOut[];
  isLoading?: boolean;
}

export function ArticlesTable({ articles, isLoading }: ArticlesTableProps) {
  const navigate = useNavigate();

  const columns: Column<ArticleOut>[] = [
    {
      key: "code",
      header: "Code",
      render: (row) => <span className="font-mono text-[13px] font-semibold">{row.code}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (row) => <span className="text-[13px]">{row.description}</span>,
    },
    {
      key: "is_active",
      header: "Status",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide ${
            row.is_active
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${row.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={articles}
      keyExtractor={(row) => row.guid}
      onRowClick={(row) => navigate(`/articles/${row.guid}`)}
      isLoading={isLoading}
      emptyMessage="No articles found."
    />
  );
}
