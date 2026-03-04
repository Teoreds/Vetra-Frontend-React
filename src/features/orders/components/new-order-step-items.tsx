import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Trash2, Loader2, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Badge } from "@/shared/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { CurrencySelector } from "@/shared/ui/currency-selector";
import { ArticleInlineSearch } from "./article-inline-search";
import { NewOrderSummaryCard } from "./new-order-summary-card";
import { CreateArticleDialog } from "./create-article-dialog";
import { ordersApi } from "../api/orders.api";
import type { ArticleOut } from "@/features/articles/types/article.types";
import { cn } from "@/shared/lib/utils";
import { useCurrencyRates, fromEur, type Currency } from "@/shared/hooks/use-currency-rates";

const rowSchema = z.object({
  article_guid: z.string(),
  article_code: z.string(),
  article_description: z.string(),
  quantity: z.coerce.number().positive("Quantità > 0"),
  unit_price: z.coerce.number().min(0, "Prezzo ≥ 0"),
  discount_percent: z.coerce.number().min(0).max(100).default(0),
  vat_code: z.string().optional(),
});

export type OrderRowDraft = z.infer<typeof rowSchema>;

const step2Schema = z.object({
  available_rows: z.array(rowSchema),
  commitment_rows: z
    .array(rowSchema)
    .min(1, "Aggiungere almeno un articolo all'impegno cliente"),
});

type Step2FormValues = z.infer<typeof step2Schema>;

interface NewOrderStepItemsProps {
  orderGuid: string;
  vatRate: number;
  onVatRateChange: (rate: number) => void;
  initialAvailableRows: OrderRowDraft[];
  initialCommitmentRows: OrderRowDraft[];
  onNext: (data: { availableRows: OrderRowDraft[]; commitmentRows: OrderRowDraft[] }) => void;
  onBack: () => void;
}

export function NewOrderStepItems({
  orderGuid,
  vatRate,
  onVatRateChange,
  initialAvailableRows,
  initialCommitmentRows,
  onNext,
  onBack,
}: NewOrderStepItemsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const { data: rates } = useCurrencyRates();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      available_rows: initialAvailableRows,
      commitment_rows: initialCommitmentRows,
    },
  });

  const available = useFieldArray({ control, name: "available_rows" });
  const commitment = useFieldArray({ control, name: "commitment_rows" });

  const watchedAvailable = watch("available_rows");
  const watchedCommitment = watch("commitment_rows");

  async function handleArticleSelect(article: ArticleOut) {
    const listPrice = article.list_price != null ? parseFloat(article.list_price) : 0;
    commitment.append({
      article_guid: article.guid,
      article_code: article.code,
      article_description: article.description,
      quantity: 1,
      unit_price: listPrice,
      discount_percent: 0,
      vat_code: "",
    });

    // Call preview-row to resolve discount
    const { data } = await ordersApi.previewRow(orderGuid, {
      article_guid: article.guid,
      quantity: 1,
      unit_price: listPrice,
    });

    if (data) {
      const newIndex = commitment.fields.length; // index of just-appended row
      const resolvedDiscount = parseFloat((data as Record<string, unknown>).resolved_discount_percent as string);
      if (!isNaN(resolvedDiscount)) {
        setValue(`commitment_rows.${newIndex}.discount_percent`, resolvedDiscount);
      }
      const vatRate = parseFloat((data as Record<string, unknown>).vat_rate as string);
      if (!isNaN(vatRate)) {
        onVatRateChange(vatRate);
      }
    }
  }

  function moveToAvailable(index: number) {
    const row = watchedCommitment[index];
    if (!row) return;
    commitment.remove(index);
    available.append(row);
  }

  function moveToCommitment(index: number) {
    const row = watchedAvailable[index];
    if (!row) return;
    available.remove(index);
    commitment.append(row);
  }

  const onSubmit = async (values: Step2FormValues) => {
    setIsSaving(true);
    setSaveError(null);

    // Save rows sequentially
    const allRows = [...values.available_rows, ...values.commitment_rows];
    for (const row of allRows) {
      const { error } = await ordersApi.createRow(orderGuid, {
        article_guid: row.article_guid,
        quantity: row.quantity,
        unit_price: row.unit_price,
        discount_percent: row.discount_percent,
        availability_status_code: "UNKNOWN",
      });
      if (error) {
        setSaveError("Errore nel salvataggio delle righe. Riprova.");
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(false);
    onNext({
      availableRows: values.available_rows,
      commitmentRows: values.commitment_rows,
    });
  };

  const inputCls =
    "h-7 w-full rounded-md border border-border/60 bg-background px-2 text-[12px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-ring/20";
  const th = "px-2 h-7";
  const td = "px-2 py-1";

  function renderTable(
    fields: { id: string }[],
    watchedRows: OrderRowDraft[],
    prefix: "available_rows" | "commitment_rows",
    moveAction: (index: number) => void,
    MoveIcon: typeof ArrowUp,
    moveTitle: string,
    removeAction: (index: number) => void,
  ) {
    return (
      <div className="max-h-64 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={th}>Articolo</TableHead>
              <TableHead className={cn(th, "w-20")}>Qtà</TableHead>
              <TableHead className={cn(th, "w-28 whitespace-nowrap")}>Prezzo ({currency})</TableHead>
              <TableHead className={cn(th, "w-24 whitespace-nowrap")}>Sconto %</TableHead>
              <TableHead className={cn(th, "w-16")} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell className={td}>
                  <div>
                    <p className="text-[12px] font-medium leading-tight">
                      {watchedRows[index]?.article_description}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {watchedRows[index]?.article_code}
                    </p>
                  </div>
                </TableCell>
                <TableCell className={td}>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    {...register(`${prefix}.${index}.quantity`, { valueAsNumber: true })}
                    className={inputCls}
                  />
                </TableCell>
                <TableCell className={td}>
                  <input type="hidden" {...register(`${prefix}.${index}.unit_price`, { valueAsNumber: true })} />
                  <span className="block px-2 text-[12px]">
                    {rates
                      ? fromEur(watchedRows[index]?.unit_price ?? 0, rates, currency).toFixed(2)
                      : (watchedRows[index]?.unit_price ?? 0).toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className={td}>
                  <input type="hidden" {...register(`${prefix}.${index}.discount_percent`, { valueAsNumber: true })} />
                  <span className="block px-2 text-[12px]">
                    {(watchedRows[index]?.discount_percent ?? 0).toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell className={td}>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      title={moveTitle}
                      onClick={() => moveAction(index)}
                    >
                        <MoveIcon className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      title="Rimuovi"
                      onClick={() => removeAction(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-6">
        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Inline article search + create button */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <ArticleInlineSearch onSelect={handleArticleSelect} />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Nuovo Articolo
              </Button>
              <CurrencySelector value={currency} onChange={setCurrency} />
            </div>
            {errors.commitment_rows && (
              <p className="text-[12px] text-destructive">
                {errors.commitment_rows.message ?? errors.commitment_rows.root?.message}
              </p>
            )}
          </div>

          {/* ── Articoli Disponibili ── */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-semibold">Articoli Disponibili</h3>
                <Badge variant="success">{available.fields.length}</Badge>
              </div>
              <p className="text-[12px] text-muted-foreground">
                Articoli presenti in magazzino, pronti per la spedizione.
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              {available.fields.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-muted-foreground">
                  Nessun articolo disponibile.
                </p>
              ) : (
                renderTable(
                  available.fields,
                  watchedAvailable ?? [],
                  "available_rows",
                  moveToCommitment,
                  ArrowDown,
                  "Sposta in Impegno",
                  (i) => available.remove(i),
                )
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* ── Impegno Cliente ── */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-semibold">Impegno Cliente</h3>
                <Badge variant="default">{commitment.fields.length}</Badge>
              </div>
              <p className="text-[12px] text-muted-foreground">
                Articoli da ordinare dal fornitore.
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              {commitment.fields.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-muted-foreground">
                  Nessun articolo in impegno.
                </p>
              ) : (
                renderTable(
                  commitment.fields,
                  watchedCommitment ?? [],
                  "commitment_rows",
                  moveToAvailable,
                  ArrowUp,
                  "Sposta in Disponibili",
                  (i) => commitment.remove(i),
                )
              )}
            </CardContent>
          </Card>

          {/* Error */}
          {saveError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
              <p className="text-[13px] text-destructive">{saveError}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={onBack} disabled={isSaving}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Indietro
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Salvataggio righe…
                </>
              ) : (
                <>
                  Revisione
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar summary */}
        <div className="w-80 shrink-0">
          <NewOrderSummaryCard
            availableRows={watchedAvailable ?? []}
            commitmentRows={watchedCommitment ?? []}
            vatRate={vatRate}
            currency={currency}
            currencyRate={rates?.[currency] ?? 1}
          />
        </div>
      </div>
      <CreateArticleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={(article) => handleArticleSelect(article)}
      />
    </form>
  );
}
