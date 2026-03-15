import { useNavigate } from "react-router-dom";
import { Pencil, MoreVertical } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DataTable, type Column } from "@/shared/ui/data-table";
import type { PartyOut } from "../types/party.types";
import { TYPE_LABELS } from "./type-multi-select";

interface PartiesTableProps {
  parties: PartyOut[];
  isLoading?: boolean;
}

const TYPE_BADGE_STYLES: Record<string, string> = {
  CUSTOMER: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  SUPPLIER: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  CARRIER: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
};

const AVATAR_COLORS = [
  { bg: "bg-blue-500/12", text: "text-blue-600" },
  { bg: "bg-emerald-500/12", text: "text-emerald-600" },
  { bg: "bg-violet-500/12", text: "text-violet-600" },
  { bg: "bg-amber-500/12", text: "text-amber-600" },
  { bg: "bg-rose-500/12", text: "text-rose-600" },
  { bg: "bg-cyan-500/12", text: "text-cyan-600" },
  { bg: "bg-indigo-500/12", text: "text-indigo-600" },
  { bg: "bg-orange-500/12", text: "text-orange-600" },
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function PartiesTable({ parties, isLoading }: PartiesTableProps) {
  const navigate = useNavigate();

  const columns: Column<PartyOut>[] = [
    {
      key: "description",
      header: "Nome",
      render: (row) => {
        const name = row.description ?? "?";
        const color = getAvatarColor(name);
        return (
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${color.bg} ${color.text}`}
            >
              {name.charAt(0).toUpperCase()}
            </span>
            <span className="text-[13px] font-medium">{name}</span>
          </div>
        );
      },
    },
    {
      key: "type_code",
      header: "Tipo",
      className: "w-36",
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide ${
            TYPE_BADGE_STYLES[row.type_code] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {TYPE_LABELS[row.type_code] ?? row.type_code}
        </span>
      ),
    },
    {
      key: "vat_number",
      header: "Partita IVA",
      className: "w-40",
      render: (row) => (
        <span className="text-[13px] text-muted-foreground font-mono">
          {row.vat_number ?? "—"}
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
                  onSelect={() => navigate(`/parties/${row.guid}`)}
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  Modifica
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
      data={parties}
      keyExtractor={(row) => row.guid}
      onRowClick={(row) => navigate(`/parties/${row.guid}`)}
      isLoading={isLoading}
      emptyMessage="Nessuna anagrafica trovata."
    />
  );
}
