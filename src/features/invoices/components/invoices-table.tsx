import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, FileCode, MoreVertical, Trash2 } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { StatusBadge } from "@/shared/ui/status-badge";
import { getStatusVariant } from "@/shared/ui/status-variants";
import { ConfirmActionDialog } from "@/shared/ui/confirm-action-dialog";
import { formatCurrency, formatDate } from "@/shared/lib/utils";
import { INVOICE_STATUS_LABELS, isInvoiceEditable } from "../types/invoice-status";
import { invoiceDisplayNumber, type InvoiceOut } from "../types/invoice.types";
import { useDeleteInvoice } from "../hooks/use-invoice-mutations";
import { invoicesApi } from "../api/invoices.api";

interface InvoicesTableProps {
  invoices: InvoiceOut[];
  isLoading?: boolean;
}

export function InvoicesTable({ invoices, isLoading }: InvoicesTableProps) {
  const navigate = useNavigate();
  const deleteInvoice = useDeleteInvoice();
  const [toDelete, setToDelete] = useState<InvoiceOut | null>(null);

  const columns: Column<InvoiceOut>[] = [
    {
      key: "number",
      header: "Numero",
      className: "w-28",
      render: (row) => (
        <span className="text-[13px] font-semibold text-primary">
          {invoiceDisplayNumber(row)}
        </span>
      ),
    },
    {
      key: "customer_description",
      header: "Cliente",
      render: (row) => (
        <span className="text-[13px] font-medium">
          {row.customer_description ?? `#${row.customer_party_guid.slice(0, 8).toUpperCase()}`}
        </span>
      ),
    },
    {
      key: "invoice_date",
      header: "Data",
      className: "w-28",
      render: (row) => (
        <span className="text-[13px] text-muted-foreground">{formatDate(row.invoice_date)}</span>
      ),
    },
    {
      key: "status_code",
      header: "Stato",
      className: "w-32",
      render: (row) => (
        <StatusBadge
          variant={getStatusVariant(row.status_code)}
          label={
            INVOICE_STATUS_LABELS[row.status_code as keyof typeof INVOICE_STATUS_LABELS] ??
            row.status_code
          }
        />
      ),
    },
    {
      key: "total_gross",
      header: "Totale",
      className: "w-32 text-right",
      render: (row) => (
        <span className="text-[13px] font-semibold">
          {row.total_gross != null ? formatCurrency(row.total_gross) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (row) => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              className="z-50 min-w-40 rounded-md border border-border bg-popover p-1 shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] outline-none hover:bg-muted"
                onSelect={() => invoicesApi.downloadPdf(row.guid)}
              >
                <Download className="h-3.5 w-3.5" /> Scarica PDF
              </DropdownMenu.Item>
              {!isInvoiceEditable(row.status_code) && row.status_code !== "CANCELLED" && (
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] outline-none hover:bg-muted"
                  onSelect={() => invoicesApi.downloadXml(row.guid)}
                >
                  <FileCode className="h-3.5 w-3.5" /> Scarica XML SDI
                </DropdownMenu.Item>
              )}
              {isInvoiceEditable(row.status_code) && (
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] text-destructive outline-none hover:bg-muted"
                  onSelect={() => setToDelete(row)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Elimina bozza
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        emptyMessage="Nessuna fattura trovata."
        onRowClick={(row) => navigate(`/invoices/${row.guid}`)}
        keyExtractor={(row) => row.guid}
      />
      <ConfirmActionDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Elimina bozza fattura"
        description={`La bozza verrà eliminata e i DDT collegati torneranno fatturabili. Continuare?`}
        confirmLabel="Elimina"
        variant="destructive"
        onConfirm={() => {
          if (toDelete) deleteInvoice.mutate(toDelete.guid);
          setToDelete(null);
        }}
      />
    </>
  );
}
