import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { ArrowRight, ArrowLeft, Trash2, Loader2, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { CurrencySelector } from "@/shared/ui/currency-selector";
import {
  ArticleInlineSearch,
  type ArticleInlineSearchHandle,
} from "@/features/orders/components/article-inline-search";
import { CreateArticleDialog } from "@/features/orders/components/create-article-dialog";
import { NewQuoteSummaryCard } from "./new-quote-summary-card";
import { quotesApi } from "../api/quotes.api";
import type { ArticleOut } from "@/features/articles/types/article.types";
import { cn } from "@/shared/lib/utils";
import {
  useCurrencyRates,
  type Currency,
} from "@/shared/hooks/use-currency-rates";
import { useUnitOfMeasures } from "@/features/articles/hooks/use-article-lookups";

const rowSchema = z.object({
  article_guid: z.string(),
  article_code: z.string(),
  article_description: z.string(),
  unit_of_measure_code: z.string().optional(),
  quantity: z.coerce.number().positive("Quantità > 0"),
  unit_price: z.coerce.number().min(0, "Prezzo ≥ 0"),
  discount_percent: z.coerce.number().min(0).max(100).default(0),
  vat_code: z.string().optional(),
  _serverGuid: z.string().optional(),
});

export type QuoteRowDraft = z.infer<typeof rowSchema>;

const stepSchema = z.object({
  rows: z.array(rowSchema),
});

type StepFormValues = z.infer<typeof stepSchema>;

interface NewQuoteStepItemsProps {
  quoteGuid: string;
  initialRows: QuoteRowDraft[];
  initialVatRate?: number;
  onNext: () => void;
  onBack: () => void;
  mode?: "create" | "edit";
  originalRowGuids?: Set<string>;
}

export function NewQuoteStepItems({
  quoteGuid,
  initialRows,
  initialVatRate = 0.22,
  onNext,
  onBack,
  mode = "create",
  originalRowGuids,
}: NewQuoteStepItemsProps) {
  const searchRef = useRef<ArticleInlineSearchHandle>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [vatRate, setVatRate] = useState(initialVatRate);
  const { data: rates } = useCurrencyRates();
  const { data: uomList } = useUnitOfMeasures();

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<StepFormValues>({
      resolver: zodResolver(stepSchema),
      defaultValues: { rows: initialRows },
    });

  const { fields, append, remove } = useFieldArray({ control, name: "rows" });
  const watchedRows = watch("rows");

  function handleArticleSelect(article: ArticleOut) {
    const listPrice =
      article.list_price != null ? parseFloat(article.list_price) : 0;
    append({
      article_guid: article.guid,
      article_code: article.code,
      article_description: article.description,
      unit_of_measure_code: article.unit_of_measure_code,
      quantity: 1,
      unit_price: listPrice,
      discount_percent: 0,
      vat_code: "",
    });
  }

  async function handleRemoveRow(index: number) {
    const row = watchedRows[index];
    if (row?._serverGuid) {
      const { error } = await quotesApi.deleteRow(row._serverGuid);
      if (error) {
        setSaveError("Errore nell'eliminazione della riga. Riprova.");
        return;
      }
    }
    remove(index);
  }

  const onSubmit = async (values: StepFormValues) => {
    setIsSaving(true);
    setSaveError(null);

    if (mode === "edit") {
      // Elimina le righe rimosse
      const currentServerGuids = new Set(
        values.rows.map((r) => r._serverGuid).filter(Boolean) as string[],
      );
      if (originalRowGuids) {
        for (const guid of originalRowGuids) {
          if (!currentServerGuids.has(guid)) {
            const { error } = await quotesApi.deleteRow(guid);
            if (error) {
              setSaveError("Errore nel salvataggio delle righe. Riprova.");
              setIsSaving(false);
              return;
            }
          }
        }
      }

      // Aggiorna o crea le righe
      for (let i = 0; i < values.rows.length; i++) {
        const row = values.rows[i];
        if (row._serverGuid) {
          const { error } = await quotesApi.updateRow(row._serverGuid, {
            quantity: row.quantity,
            unit_price: row.unit_price,
            discount_percent: row.discount_percent,
          });
          if (error) {
            setSaveError("Errore nel salvataggio delle righe. Riprova.");
            setIsSaving(false);
            return;
          }
        } else {
          const { data, error } = await quotesApi.createRow(quoteGuid, {
            article_guid: row.article_guid,
            quantity: row.quantity,
            unit_price: row.unit_price,
            discount_percent: row.discount_percent,
            unit_of_measure_code: row.unit_of_measure_code || null,
            vat_code: row.vat_code || null,
          });
          if (error) {
            setSaveError("Errore nel salvataggio delle righe. Riprova.");
            setIsSaving(false);
            return;
          }
          if (data) setValue(`rows.${i}._serverGuid`, data.guid);
        }
      }
    } else {
      // Create mode — salva solo le righe senza _serverGuid
      for (let i = 0; i < values.rows.length; i++) {
        const row = values.rows[i];
        if (row._serverGuid) continue;
        const { data, error } = await quotesApi.createRow(quoteGuid, {
          article_guid: row.article_guid,
          quantity: row.quantity,
          unit_price: row.unit_price,
          discount_percent: row.discount_percent,
          unit_of_measure_code: row.unit_of_measure_code || null,
          vat_code: row.vat_code || null,
        });
        if (error) {
          setSaveError("Errore nel salvataggio delle righe. Riprova.");
          setIsSaving(false);
          return;
        }
        if (data) setValue(`rows.${i}._serverGuid`, data.guid);
      }
    }

    setIsSaving(false);
    onNext();
  };

  function handleTableInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      searchRef.current?.focus();
    }
  }

  const inputCls =
    "h-7 w-full rounded-md border border-border/60 bg-background px-2 text-[13px] outline-none transition-all focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20";
  const th = "px-2 h-7";
  const td = "px-2 py-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-6">
        {/* Contenuto principale */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Ricerca articolo + bottone nuovo */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <ArticleInlineSearch ref={searchRef} onSelect={handleArticleSelect} />
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
            {errors.rows && (
              <p className="text-[11px] text-destructive">
                {errors.rows.message ?? errors.rows.root?.message}
              </p>
            )}
          </div>

          {/* Tabella righe */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Articoli Preventivo</h3>
                <Badge variant="default">{fields.length}</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Qtà, prezzo e sconto sono modificabili direttamente nella tabella.
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              {fields.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-muted-foreground">
                  Nessun articolo aggiunto. Cerca un articolo qui sopra.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={cn(th, "min-w-[180px]")}>Articolo</TableHead>
                      <TableHead className={cn(th, "w-16")}>Qtà</TableHead>
                      <TableHead className={cn(th, "w-14 pl-4")}>UdM</TableHead>
                      <TableHead className={cn(th, "w-24 pl-4 whitespace-nowrap")}>
                        Prezzo ({currency})
                      </TableHead>
                      <TableHead className={cn(th, "w-20 pl-4 whitespace-nowrap")}>
                        Sconto %
                      </TableHead>
                      <TableHead className={cn(th, "w-8")} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell className={td}>
                          <div>
                            <p className="text-[13px] font-medium leading-tight">
                              {watchedRows[index]?.article_description}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {watchedRows[index]?.article_code}
                            </p>
                          </div>
                        </TableCell>

                        {/* Quantità */}
                        <TableCell className={td}>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            {...register(`rows.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
                            onKeyDown={handleTableInputKeyDown}
                            className={cn(
                              inputCls,
                              "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                            )}
                          />
                        </TableCell>

                        {/* UdM */}
                        <TableCell className={td}>
                          <div className="group/uom relative">
                            <span className="flex h-7 items-center px-2 text-[11px] text-muted-foreground uppercase group-focus-within/uom:invisible">
                              {(uomList ?? []).find(
                                (u) => u.code === watchedRows[index]?.unit_of_measure_code,
                              )?.description ||
                                watchedRows[index]?.unit_of_measure_code ||
                                "—"}
                            </span>
                            <select
                              {...register(`rows.${index}.unit_of_measure_code`)}
                              onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                  e.preventDefault();
                                  searchRef.current?.focus();
                                }
                              }}
                              className="absolute inset-0 h-full w-full cursor-pointer rounded-md border border-border/60 bg-background px-2 text-[11px] opacity-0 outline-none transition-all focus:opacity-100 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20 appearance-none"
                            >
                              {(uomList ?? []).map((u) => (
                                <option key={u.code} value={u.code}>
                                  {u.description}
                                </option>
                              ))}
                            </select>
                          </div>
                        </TableCell>

                        {/* Prezzo */}
                        <TableCell className={td}>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            {...register(`rows.${index}.unit_price`, {
                              valueAsNumber: true,
                            })}
                            onKeyDown={handleTableInputKeyDown}
                            className={cn(
                              inputCls,
                              "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                            )}
                          />
                        </TableCell>

                        {/* Sconto % */}
                        <TableCell className={td}>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            max="100"
                            {...register(`rows.${index}.discount_percent`, {
                              valueAsNumber: true,
                            })}
                            onKeyDown={handleTableInputKeyDown}
                            className={cn(
                              inputCls,
                              "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                            )}
                          />
                        </TableCell>

                        {/* Elimina */}
                        <TableCell className={td}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            title="Rimuovi"
                            onClick={() => handleRemoveRow(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Errore */}
          {saveError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
              <p className="text-[13px] text-destructive">{saveError}</p>
            </div>
          )}

          {/* Navigazione */}
          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSaving}
            >
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
                  {mode === "edit" ? "Salva Modifiche" : "Completa Preventivo"}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar riepilogo */}
        <div className="w-72 shrink-0">
          <NewQuoteSummaryCard
            rows={watchedRows ?? []}
            vatRate={vatRate}
            onVatRateChange={setVatRate}
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
