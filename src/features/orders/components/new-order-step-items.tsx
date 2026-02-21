import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod/v4";
import { ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Badge } from "@/shared/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { ArticleInlineSearch } from "./article-inline-search";
import { NewOrderSummaryCard } from "./new-order-summary-card";
import type { ArticleOut } from "@/features/articles/types/article.types";
import { cn } from "@/shared/lib/utils";

const rowSchema = z.object({
  article_guid: z.string(),
  article_code: z.string(),
  article_description: z.string(),
  quantity: z.coerce.number().positive("Quantità > 0"),
  unit_price: z.coerce.number().min(0, "Prezzo ≥ 0"),
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
  initialAvailableRows: OrderRowDraft[];
  initialCommitmentRows: OrderRowDraft[];
  onNext: (data: { availableRows: OrderRowDraft[]; commitmentRows: OrderRowDraft[] }) => void;
  onBack: () => void;
}

export function NewOrderStepItems({
  initialAvailableRows,
  initialCommitmentRows,
  onNext,
  onBack,
}: NewOrderStepItemsProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step2FormValues>({
    defaultValues: {
      available_rows: initialAvailableRows,
      commitment_rows: initialCommitmentRows,
    },
  });

  const available = useFieldArray({ control, name: "available_rows" });
  const commitment = useFieldArray({ control, name: "commitment_rows" });

  const watchedAvailable = watch("available_rows");
  const watchedCommitment = watch("commitment_rows");

  function handleArticleSelect(article: ArticleOut) {
    commitment.append({
      article_guid: article.guid,
      article_code: article.code,
      article_description: article.description,
      quantity: 1,
      unit_price: 0,
      vat_code: "",
    });
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

  const onSubmit = (values: Step2FormValues) => {
    const parsed = step2Schema.safeParse(values);
    if (!parsed.success) return;
    onNext({
      availableRows: parsed.data.available_rows,
      commitmentRows: parsed.data.commitment_rows,
    });
  };

  const inputCls =
    "h-7 w-full rounded-md border border-border/60 bg-background px-2 text-[12px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-ring/20";
  const th = "px-2 h-7";
  const td = "px-2 py-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-6">
        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Inline article search */}
          <div className="space-y-1.5">
            <ArticleInlineSearch onSelect={handleArticleSelect} />
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
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className={th}>Articolo</TableHead>
                        <TableHead className={cn(th, "w-20")}>Qtà</TableHead>
                        <TableHead className={cn(th, "w-24")}>Prezzo</TableHead>
                        <TableHead className={cn(th, "w-16")}>IVA %</TableHead>
                        <TableHead className={cn(th, "w-16")} />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {available.fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell className={td}>
                            <div>
                              <p className="text-[12px] font-medium leading-tight">{watchedAvailable[index]?.article_description}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {watchedAvailable[index]?.article_code}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className={td}>
                            <input
                              type="number"
                              step="any"
                              min="0"
                              {...register(`available_rows.${index}.quantity`, { valueAsNumber: true })}
                              className={inputCls}
                            />
                          </TableCell>
                          <TableCell className={td}>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              {...register(`available_rows.${index}.unit_price`, { valueAsNumber: true })}
                              className={inputCls}
                            />
                          </TableCell>
                          <TableCell className={td}>
                            <input
                              {...register(`available_rows.${index}.vat_code`)}
                              placeholder="22"
                              className={inputCls}
                            />
                          </TableCell>
                          <TableCell className={td}>
                            <div className="flex items-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                title="Sposta in Impegno"
                                onClick={() => moveToCommitment(index)}
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                title="Rimuovi"
                                onClick={() => available.remove(index)}
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
                Articoli da ordinare dal fornitore per soddisfare la richiesta.
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              {commitment.fields.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-muted-foreground">
                  Nessun articolo in impegno. Usa "Aggiungi articolo" per iniziare.
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className={th}>Articolo</TableHead>
                        <TableHead className={cn(th, "w-20")}>Qtà</TableHead>
                        <TableHead className={cn(th, "w-24")}>Prezzo</TableHead>
                        <TableHead className={cn(th, "w-16")}>IVA %</TableHead>
                        <TableHead className={cn(th, "w-16")} />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commitment.fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell className={td}>
                            <div>
                              <p className="text-[12px] font-medium leading-tight">{watchedCommitment[index]?.article_description}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {watchedCommitment[index]?.article_code}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className={td}>
                            <input
                              type="number"
                              step="any"
                              min="0"
                              {...register(`commitment_rows.${index}.quantity`, { valueAsNumber: true })}
                              className={inputCls}
                            />
                          </TableCell>
                          <TableCell className={td}>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              {...register(`commitment_rows.${index}.unit_price`, { valueAsNumber: true })}
                              className={inputCls}
                            />
                          </TableCell>
                          <TableCell className={td}>
                            <input
                              {...register(`commitment_rows.${index}.vat_code`)}
                              placeholder="22"
                              className={inputCls}
                            />
                          </TableCell>
                          <TableCell className={td}>
                            <div className="flex items-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                title="Sposta in Disponibili"
                                onClick={() => moveToAvailable(index)}
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                title="Rimuovi"
                                onClick={() => commitment.remove(index)}
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
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Indietro
            </Button>
            <Button type="submit">
              Avanti — Revisione
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar summary */}
        <div className="w-80 shrink-0">
          <NewOrderSummaryCard
            availableRows={watchedAvailable ?? []}
            commitmentRows={watchedCommitment ?? []}
          />
        </div>
      </div>
    </form>
  );
}
