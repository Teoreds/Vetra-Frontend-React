import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileCheck } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { BackButton } from "@/shared/ui/back-button";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Stepper } from "@/shared/ui/stepper";
import { Checkbox } from "@/shared/ui/checkbox";
import { DateRangePicker } from "@/shared/ui/date-range-picker";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { formatCurrency, formatDate } from "@/shared/lib/utils";
import { PartySearchSelect } from "@/features/parties/components/party-search-select";
import { useBillableDdts } from "../hooks/use-billable-ddts";
import { useCreateInvoice } from "../hooks/use-invoice-mutations";

const STEPS = [
  { label: "Cliente e periodo" },
  { label: "Selezione DDT" },
  { label: "Conferma" },
];

function previousMonthRange(): { from: string; to: string } {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastPrev = new Date(firstOfMonth.getTime() - 86_400_000);
  const firstPrev = new Date(lastPrev.getFullYear(), lastPrev.getMonth(), 1);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(firstPrev), to: iso(lastPrev) };
}

export function InvoiceWizardPage() {
  const navigate = useNavigate();
  const createInvoice = useCreateInvoice();
  const defaultRange = useMemo(() => previousMonthRange(), []);

  const [step, setStep] = useState(0);
  const [partyGuid, setPartyGuid] = useState<string | undefined>();
  const [dateFrom, setDateFrom] = useState<string | undefined>(defaultRange.from);
  const [dateTo, setDateTo] = useState<string | undefined>(defaultRange.to);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  const { data: ddts, isLoading } = useBillableDdts(
    partyGuid ? { party_guid: partyGuid, date_from: dateFrom, date_to: dateTo } : undefined,
  );

  const selectedDdts = (ddts ?? []).filter((d) => selected.has(d.guid));
  const estimatedTotal = selectedDdts.reduce((sum, d) => sum + Number(d.estimated_net), 0);

  function toggle(guid: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(guid)) next.delete(guid);
      else next.add(guid);
      return next;
    });
  }

  async function handleCreate() {
    if (!partyGuid || selected.size === 0) return;
    setError(null);
    try {
      const invoice = await createInvoice.mutateAsync({
        party_guid: partyGuid,
        delivery_note_guids: [...selected],
        invoice_date: invoiceDate,
        tipo_documento: "TD24",
      });
      navigate(`/invoices/${invoice.guid}`);
    } catch (err) {
      const detail =
        err && typeof err === "object" && "detail" in err
          ? String((err as { detail: unknown }).detail)
          : "Errore durante la creazione della fattura.";
      setError(detail);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton fallback="/invoices" />
        <PageHeader
          title="Nuova Fattura"
          description="Aggrega i DDT del periodo in una fattura differita (TD24)."
        />
      </div>

      <Stepper steps={STEPS} currentStep={step} />

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
          {error}
        </div>
      )}

      {step === 0 && (
        <Card>
          <CardHeader className="text-sm font-semibold">Cliente e periodo di consegna</CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Cliente</label>
              <PartySearchSelect
                value={partyGuid}
                onChange={(guid) => {
                  setPartyGuid(guid);
                  setSelected(new Set());
                }}
                typeCode="CUSTOMER"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Periodo consegne</label>
              <div>
                <DateRangePicker
                  from={dateFrom}
                  to={dateTo}
                  onChange={(range) => {
                    setDateFrom(range.from);
                    setDateTo(range.to);
                    setSelected(new Set());
                  }}
                />
              </div>
              <p className="text-[12px] text-muted-foreground">
                Preimpostato al mese precedente ({formatDate(defaultRange.from)} –{" "}
                {formatDate(defaultRange.to)}).
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader className="text-sm font-semibold">DDT fatturabili nel periodo</CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-[13px] text-muted-foreground">Caricamento DDT…</p>
            ) : !ddts || ddts.length === 0 ? (
              <EmptyState
                title="Nessun DDT fatturabile"
                description="Non ci sono DDT non ancora fatturati per il cliente nel periodo selezionato."
              />
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between border-b border-border pb-2 text-[12px] text-muted-foreground">
                  <button
                    type="button"
                    className="font-medium text-primary hover:underline"
                    onClick={() =>
                      setSelected(
                        selected.size === ddts.length
                          ? new Set()
                          : new Set(ddts.map((d) => d.guid)),
                      )
                    }
                  >
                    {selected.size === ddts.length ? "Deseleziona tutti" : "Seleziona tutti"}
                  </button>
                  <span>
                    {selected.size} di {ddts.length} selezionati
                  </span>
                </div>
                {ddts.map((d) => (
                  <label
                    key={d.guid}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 text-[13px] hover:bg-muted/60"
                  >
                    <Checkbox checked={selected.has(d.guid)} onCheckedChange={() => toggle(d.guid)} />
                    <span className="w-24 font-semibold">DDT {d.number}/{d.year}</span>
                    <span className="w-28 text-muted-foreground">{formatDate(d.delivery_date)}</span>
                    <span className="flex-1 text-muted-foreground">{d.rows_count} righe</span>
                    <span className="font-medium">{formatCurrency(d.estimated_net)}</span>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader className="text-sm font-semibold">Riepilogo</CardHeader>
          <CardContent className="space-y-4 text-[13px]">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Data fattura</label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="h-9 w-44"
              />
              <p className="text-[12px] text-muted-foreground">
                Fattura differita TD24: la data deve essere entro il 15 del mese successivo alle consegne.
              </p>
            </div>
            <div className="rounded-md border border-border">
              {selectedDdts.map((d) => (
                <div
                  key={d.guid}
                  className="flex items-center justify-between border-b border-border/60 px-3 py-2 last:border-b-0"
                >
                  <span>
                    DDT {d.number}/{d.year} · {formatDate(d.delivery_date)} · {d.rows_count} righe
                  </span>
                  <span className="font-medium">{formatCurrency(d.estimated_net)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2.5 font-semibold">
                <span>Imponibile stimato (IVA esclusa)</span>
                <span>{formatCurrency(estimatedTotal)}</span>
              </div>
            </div>
            <p className="text-[12px] text-muted-foreground">
              Verrà creata una <strong>bozza</strong>: righe e importi restano modificabili fino
              all'emissione.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => (step === 0 ? navigate("/invoices") : setStep(step - 1))}
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          {step === 0 ? "Annulla" : "Indietro"}
        </Button>
        {step < 2 ? (
          <Button
            size="sm"
            disabled={step === 0 ? !partyGuid : selected.size === 0}
            onClick={() => setStep(step + 1)}
          >
            Avanti <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleCreate} disabled={createInvoice.isPending}>
            <FileCheck className="mr-1 h-3.5 w-3.5" />
            {createInvoice.isPending ? "Creazione…" : "Crea bozza fattura"}
          </Button>
        )}
      </div>
    </div>
  );
}
