import { useNavigate } from "react-router-dom";
import { Pencil, MoreVertical } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { AuthImage } from "@/shared/ui/auth-image";
import { useArticleTypes, useUnitOfMeasures } from "../hooks/use-article-lookups";
import type { ArticleOut } from "../types/article.types";

interface ArticlesTableProps {
  articles: ArticleOut[];
  isLoading?: boolean;
}

function fmtPrice(v: string | null) {
  if (!v) return "—";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(v));
}

export function ArticlesTable({ articles, isLoading }: ArticlesTableProps) {
  const navigate = useNavigate();
  const { data: articleTypes = [] } = useArticleTypes();
  const typeMap = new Map(articleTypes.map((t) => [t.code, t.description]));
  const { data: unitOfMeasures = [] } = useUnitOfMeasures();
  const uomMap = new Map(unitOfMeasures.map((u) => [u.code, u.description]));

  const columns: Column<ArticleOut>[] = [
    {
      key: "code",
      header: "Articolo",
      render: (row) => (
        <div className="flex items-center gap-3">
          <AuthImage
            src={row.image_path ? `/articles/${row.guid}/image` : null}
            alt={row.description}
            className="h-8 w-8 shrink-0 rounded-lg"
            fallbackClassName="h-8 w-8 shrink-0 rounded-lg"
          />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold">{row.code}</p>
            <p className="truncate text-[12px] text-muted-foreground">{row.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type_code",
      header: "Tipo",
      className: "w-40",
      render: (row) => (
        <span className="text-[13px] text-muted-foreground">
          {row.type_code ? typeMap.get(row.type_code) ?? row.type_code : "—"}
        </span>
      ),
    },
    {
      key: "unit_of_measure_code",
      header: "UdM",
      className: "w-20",
      render: (row) => (
        <span className="text-[13px] text-muted-foreground">
          {uomMap.get(row.unit_of_measure_code) ?? row.unit_of_measure_code}
        </span>
      ),
    },
    {
      key: "list_price",
      header: "Prezzo",
      className: "w-28 text-right",
      render: (row) => (
        <span className="text-[13px] font-medium tabular-nums">
          {fmtPrice(row.list_price)}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Stato",
      className: "w-24",
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide ${
            row.is_active
              ? "bg-emerald-500/8 text-emerald-600"
              : "bg-slate-500/8 text-slate-500"
          }`}
        >
          {row.is_active ? "Attivo" : "Inattivo"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-0",
      render: (row) => (
        <div className="flex justify-end opacity-0 transition-opacity group-hover/row:opacity-100">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                className="z-50 min-w-[160px] rounded-lg border border-border/60 bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors hover:bg-accent"
                  onSelect={() => navigate(`/articles/${row.code}`)}
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  Dettaglio
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={articles}
      keyExtractor={(row) => row.guid}
      onRowClick={(row) => navigate(`/articles/${row.code}`)}
      isLoading={isLoading}
      emptyMessage="Nessun articolo trovato."
    />
  );
}
