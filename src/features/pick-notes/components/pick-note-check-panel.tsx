import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, PenLine, Loader2, Package, Weight, StickyNote, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { CheckboxDisplay } from "@/shared/ui/checkbox";
import { usePickNote } from "../hooks/use-pick-note";
import { useWarehouseWorkers } from "@/features/warehouses/hooks/use-warehouse-workers";
import { useArticles } from "@/features/articles/hooks/use-articles";
import { pickNotesApi } from "../api/pick-notes.api";
import { pickNoteKeys } from "../api/pick-notes.queries";

interface PickNoteCheckPanelProps {
  pickNoteGuid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PickNoteCheckPanel({
  pickNoteGuid,
  open,
  onOpenChange,
}: PickNoteCheckPanelProps) {
  const queryClient = useQueryClient();
  const { data: pickNote, isLoading } = usePickNote(pickNoteGuid);
  const { data: workersData } = useWarehouseWorkers();
  const { data: articlesData } = useArticles({ limit: 200 });
  const workers = workersData?.items ?? [];

  const articleMap = new Map(
    (articlesData?.items ?? []).map((a) => [a.guid, a]),
  );

  const [checkedRows, setCheckedRows] = useState<Set<string>>(new Set());
  const [checkerGuid, setCheckerGuid] = useState("");
  const [weight, setWeight] = useState("");
  const [packages, setPackages] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize form when data arrives
  if (pickNote && !initialized) {
    setNote(pickNote.note ?? "");
    setWeight(pickNote.weight != null ? String(pickNote.weight) : "");
    setPackages(pickNote.packages != null ? String(pickNote.packages) : "");
    setInitialized(true);
  }

  // Reset when panel closes
  function handleOpenChange(next: boolean) {
    if (!next) {
      setCheckedRows(new Set());
      setCheckerGuid("");
      setWeight("");
      setPackages("");
      setNote("");
      setSubmitError(null);
      setInitialized(false);
    }
    onOpenChange(next);
  }

  function toggleRow(guid: string) {
    setCheckedRows((prev) => {
      const next = new Set(prev);
      if (next.has(guid)) next.delete(guid);
      else next.add(guid);
      return next;
    });
  }

  function toggleAll() {
    if (!pickNote) return;
    const allChecked = pickNote.rows.length > 0 && checkedRows.size === pickNote.rows.length;
    if (allChecked) {
      setCheckedRows(new Set());
    } else {
      setCheckedRows(new Set(pickNote.rows.map((r) => r.guid)));
    }
  }

  const allChecked = (pickNote?.rows.length ?? 0) > 0 && checkedRows.size === (pickNote?.rows.length ?? 0);

  async function handleSubmit() {
    if (!pickNote) return;
    setSubmitError(null);

    if (!checkerGuid) {
      setSubmitError("Seleziona l'operatore verificatore.");
      return;
    }

    if (!allChecked) {
      setSubmitError("Conferma tutte le righe prima di procedere.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await pickNotesApi.update(pickNote.guid, {
        status_code: "CHECKED",
        checker_guid: checkerGuid,
        weight: weight ? parseFloat(weight) : null,
        packages: packages ? parseInt(packages, 10) : null,
        note: note.trim() || null,
      });

      if (error) throw new Error("Errore durante l'aggiornamento.");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: pickNoteKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: pickNoteKeys.detail(pickNote.guid) }),
      ]);

      handleOpenChange(false);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Errore durante il controllo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-border/80 bg-background shadow-[0_0_40px_-12px_rgba(0,0,0,0.25)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            "duration-300",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
            <div>
              <DialogPrimitive.Title className="text-base font-semibold">
                Controllo Nota
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-[13px] text-muted-foreground">
                Verifica le righe e conferma il prelievo.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {isLoading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {pickNote && (
              <>
                {/* Righe */}
                <div className="space-y-2">
                  <h3 className="text-[13px] font-semibold">Righe da verificare</h3>
                  <div className="rounded-lg border border-border/60 divide-y divide-border/40">
                    {pickNote.rows.map((row) => {
                      const article = articleMap.get(row.article_guid);
                      const checked = checkedRows.has(row.guid);
                      return (
                        <div
                          key={row.guid}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
                            checked ? "bg-emerald-50/50 dark:bg-emerald-950/20" : "hover:bg-muted/40",
                          )}
                          onClick={() => toggleRow(row.guid)}
                        >
                          <CheckboxDisplay checked={checked} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium truncate">
                              {article?.description ?? row.article_guid.slice(0, 8)}
                            </p>
                            {article && (
                              <p className="text-[11px] text-muted-foreground">{article.code}</p>
                            )}
                          </div>
                          <span className="shrink-0 text-[13px] font-medium tabular-nums">
                            {parseFloat(row.quantity)}
                          </span>
                          <Badge
                            variant={row.source_type_code === "COMMITMENT" ? "default" : "secondary"}
                            className="shrink-0 text-[10px]"
                          >
                            {row.source_type_code === "COMMITMENT" ? "Impegno" : row.source_type_code === "STOCK" ? "Stock" : row.source_type_code}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                  {checkedRows.size > 0 && (
                    <p className="text-[12px] text-emerald-600">
                      {checkedRows.size}/{pickNote.rows.length} righe confermate
                    </p>
                  )}
                </div>

                {/* Peso e Colli */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[13px] font-medium">
                      <Weight className="h-3.5 w-3.5 text-muted-foreground" />
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="0.00"
                      className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 text-[13px] outline-none transition-all placeholder:text-muted-foreground/60 hover:border-border focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[13px] font-medium">
                      <Package className="h-3.5 w-3.5 text-muted-foreground" />
                      Colli
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={packages}
                      onChange={(e) => setPackages(e.target.value)}
                      placeholder="0"
                      className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 text-[13px] outline-none transition-all placeholder:text-muted-foreground/60 hover:border-border focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                {/* Note */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium">
                    <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                    Note
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Note aggiuntive…"
                    rows={3}
                    className="flex w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all placeholder:text-muted-foreground/60 hover:border-border focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20 resize-none"
                  />
                </div>

                {/* Firma Verificatore */}
                <div
                  className={cn(
                    "rounded-xl border p-4 space-y-3 transition-colors",
                    !checkerGuid
                      ? "border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20"
                      : "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <PenLine className={`h-4 w-4 ${!checkerGuid ? "text-amber-500" : "text-emerald-500"}`} />
                    <h3 className="text-[13px] font-semibold">Firma Verificatore</h3>
                    {!checkerGuid && (
                      <Badge variant="secondary" className="ml-auto border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950 dark:text-amber-400 text-[10px]">
                        Richiesta
                      </Badge>
                    )}
                  </div>
                  <Select value={checkerGuid} onValueChange={setCheckerGuid}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona verificatore…" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.map((w) => (
                        <SelectItem key={w.guid} value={w.guid}>
                          {w.name} {w.surname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/60 px-6 py-4 space-y-3">
            {submitError && (
              <p className="text-[12px] font-medium text-destructive">{submitError}</p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Annulla
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={isSubmitting || !checkerGuid || !allChecked}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Salvataggio…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Completa Controllo
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
