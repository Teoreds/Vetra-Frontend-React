import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, Download, FileCode, Send, Trash2, Wallet } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { BackButton } from "@/shared/ui/back-button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { StatusBadge } from "@/shared/ui/status-badge";
import { getStatusVariant } from "@/shared/ui/status-variants";
import { ConfirmActionDialog } from "@/shared/ui/confirm-action-dialog";
import { EmptyState } from "@/shared/ui/empty-state";
import { formatCurrency, formatDate } from "@/shared/lib/utils";
import { useInvoice } from "../hooks/use-invoice";
import {
  useDeleteInvoice,
  useIssueInvoice,
  useSetInvoiceStatus,
} from "../hooks/use-invoice-mutations";
import { invoicesApi } from "../api/invoices.api";
import { INVOICE_STATUS_LABELS, isInvoiceEditable } from "../types/invoice-status";
import { invoiceDisplayNumber } from "../types/invoice.types";

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoice(id);
  const issueInvoice = useIssueInvoice(id ?? "");
  const setStatus = useSetInvoiceStatus(id ?? "");
  const deleteInvoice = useDeleteInvoice();
  const [confirmIssue, setConfirmIssue] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);

  if (isLoading || !invoice) {
    return <div className="p-6 text-[13px] text-muted-foreground">Caricamento fattura…</div>;
  }

  const editable = isInvoiceEditable(invoice.status_code);

  async function handleIssue() {
    setConfirmIssue(false);
    setIssueError(null);
    try {
      await issueInvoice.mutateAsync();
    } catch (err) {
      const detail =
        err && typeof err === "object" && "detail" in err
          ? String((err as { detail: unknown }).detail)
          : "Errore durante l'emissione.";
      setIssueError(detail);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackButton fallback="/invoices" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-semibold">Fattura {invoiceDisplayNumber(invoice)}</h1>
              <StatusBadge
                variant={getStatusVariant(invoice.status_code)}
                label={
                  INVOICE_STATUS_LABELS[
                    invoice.status_code as keyof typeof INVOICE_STATUS_LABELS
                  ] ?? invoice.status_code
                }
              />
            </div>
            <p className="text-[13px] text-muted-foreground">
              {invoice.customer_description} · {formatDate(invoice.invoice_date)} ·{" "}
              {invoice.tipo_documento}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => invoicesApi.downloadPdf(invoice.guid)}>
            <Download className="mr-1 h-3.5 w-3.5" /> PDF
          </Button>
          {!editable && invoice.status_code !== "CANCELLED" && (
            <Button variant="outline" size="sm" onClick={() => invoicesApi.downloadXml(invoice.guid)}>
              <FileCode className="mr-1 h-3.5 w-3.5" /> XML SDI
            </Button>
          )}
          {editable && (
            <>
              <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Elimina
              </Button>
              <Button size="sm" onClick={() => setConfirmIssue(true)} disabled={issueInvoice.isPending}>
                <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                {issueInvoice.isPending ? "Emissione…" : "Emetti"}
              </Button>
            </>
          )}
          {invoice.status_code === "ISSUED" && (
            <Button size="sm" variant="outline" onClick={() => setStatus.mutate("SENT_SDI")}>
              <Send className="mr-1 h-3.5 w-3.5" /> Segna inviata a SDI
            </Button>
          )}
          {(invoice.status_code === "ISSUED" || invoice.status_code === "SENT_SDI") && (
            <Button size="sm" variant="outline" onClick={() => setStatus.mutate("PAID")}>
              <Wallet className="mr-1 h-3.5 w-3.5" /> Segna pagata
            </Button>
          )}
        </div>
      </div>

      {issueError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
          {issueError}
        </div>
      )}

      <Card>
        <CardHeader className="text-sm font-semibold">Righe</CardHeader>
        <CardContent>
          {invoice.rows.length === 0 ? (
            <EmptyState title="Nessuna riga" description="La fattura non contiene righe." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-2 py-2 font-medium">#</th>
                    <th className="px-2 py-2 font-medium">DDT</th>
                    <th className="px-2 py-2 font-medium">Codice</th>
                    <th className="px-2 py-2 font-medium">Descrizione</th>
                    <th className="px-2 py-2 text-right font-medium">Qtà</th>
                    <th className="px-2 py-2 font-medium">UM</th>
                    <th className="px-2 py-2 text-right font-medium">Prezzo</th>
                    <th className="px-2 py-2 text-right font-medium">Sc.%</th>
                    <th className="px-2 py-2 text-right font-medium">IVA</th>
                    <th className="px-2 py-2 text-right font-medium">Totale</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.rows.map((row) => (
                    <tr key={row.guid} className="border-b border-border/60">
                      <td className="px-2 py-2 text-muted-foreground">{row.line_number}</td>
                      <td className="px-2 py-2">
                        {row.delivery_note_number != null
                          ? `${row.delivery_note_number}/${row.delivery_note_year}`
                          : "—"}
                      </td>
                      <td className="px-2 py-2 font-mono text-[12px]">{row.article_code ?? "—"}</td>
                      <td className="px-2 py-2">{row.description}</td>
                      <td className="px-2 py-2 text-right">{Number(row.quantity).toLocaleString("it-IT")}</td>
                      <td className="px-2 py-2">{row.unit_of_measure_code}</td>
                      <td className="px-2 py-2 text-right">{formatCurrency(row.unit_price, { maximumFractionDigits: 3 })}</td>
                      <td className="px-2 py-2 text-right">
                        {Number(row.discount_percent) > 0 ? `${Number(row.discount_percent)}%` : "—"}
                      </td>
                      <td className="px-2 py-2 text-right">
                        {row.vat_natura ?? `${Number(row.vat_rate)}%`}
                      </td>
                      <td className="px-2 py-2 text-right font-semibold">{formatCurrency(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader className="text-sm font-semibold">Riepilogo IVA</CardHeader>
          <CardContent>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Aliquota</th>
                  <th className="px-2 py-2 text-right font-medium">Imponibile</th>
                  <th className="px-2 py-2 text-right font-medium">Imposta</th>
                </tr>
              </thead>
              <tbody>
                {invoice.vat_summaries.map((s, i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td className="px-2 py-2">
                      {s.natura ? `Natura ${s.natura} (non imp.)` : `IVA ${Number(s.vat_rate)}%`}
                    </td>
                    <td className="px-2 py-2 text-right">{formatCurrency(s.taxable)}</td>
                    <td className="px-2 py-2 text-right">{formatCurrency(s.tax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-sm font-semibold">Totali</CardHeader>
          <CardContent className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sconti applicati</span>
              <span>{invoice.total_discount != null ? formatCurrency(invoice.total_discount) : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Imponibile</span>
              <span>{invoice.total_net != null ? formatCurrency(invoice.total_net) : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IVA</span>
              <span>{invoice.total_vat != null ? formatCurrency(invoice.total_vat) : "—"}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
              <span>Totale documento</span>
              <span>{invoice.total_gross != null ? formatCurrency(invoice.total_gross) : "—"}</span>
            </div>
            {invoice.intent_letter_guid && (
              <p className="pt-2 text-[12px] text-muted-foreground">
                Operazione non imponibile — lettera d'intento attiva.
              </p>
            )}
            {invoice.progressivo_invio && (
              <p className="text-[12px] text-muted-foreground">
                Progressivo invio SDI: <span className="font-mono">{invoice.progressivo_invio}</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="text-sm font-semibold">DDT fatturati</CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-[13px]">
          {invoice.delivery_notes.map((d) => (
            <span key={d.guid} className="rounded-md bg-muted px-2.5 py-1">
              DDT {d.number}/{d.year} · {formatDate(d.delivery_date)}
            </span>
          ))}
        </CardContent>
      </Card>

      <ConfirmActionDialog
        open={confirmIssue}
        onOpenChange={setConfirmIssue}
        title="Emetti fattura"
        description="L'emissione assegna il numero fiscale definitivo e rende la fattura non modificabile. Continuare?"
        confirmLabel="Emetti"
        onConfirm={handleIssue}
        isLoading={issueInvoice.isPending}
      />
      <ConfirmActionDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Elimina bozza"
        description="La bozza verrà eliminata e i DDT collegati torneranno fatturabili. Continuare?"
        confirmLabel="Elimina"
        variant="destructive"
        onConfirm={async () => {
          setConfirmDelete(false);
          await deleteInvoice.mutateAsync(invoice.guid);
          navigate("/invoices");
        }}
      />
    </div>
  );
}
