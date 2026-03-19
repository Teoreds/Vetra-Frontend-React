import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Check, X, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ConfirmActionDialog } from "@/shared/ui/confirm-action-dialog";
import { cn } from "@/shared/lib/utils";
import { apiClient } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

type PaymentTermOut = components["schemas"]["PaymentTermOut"];
type InstalmentCreate = components["schemas"]["InstalmentCreate"];

const QUERY_KEY = ["admin", "payment-terms"];

function fmtPct(v: string | number) {
  return `${Number(v)}%`;
}

function instalmentSummary(inst: { days: number; end_of_month: boolean; extra_days: number; percentage: string | number }): string {
  let s = `${inst.days}gg`;
  if (inst.end_of_month) s += " FM";
  if (inst.extra_days > 0) s += ` +${inst.extra_days}`;
  s += ` (${fmtPct(inst.percentage)})`;
  return s;
}

// ── Instalment row editor ──
interface InstalmentRowProps {
  value: InstalmentCreate;
  onChange: (v: InstalmentCreate) => void;
  onRemove: () => void;
  index: number;
}

const ROW_GRID = "grid grid-cols-[1.25rem_5rem_2.5rem_4rem_5rem_1.25rem_1.5rem] items-center gap-2";

function InstalmentRow({ value, onChange, onRemove, index }: InstalmentRowProps) {
  return (
    <div className={ROW_GRID}>
      <span className="text-center text-[11px] text-muted-foreground">{index + 1}</span>
      <Input
        type="number"
        value={value.days}
        onChange={(e) => onChange({ ...value, days: Number(e.target.value) })}
        placeholder="0"
        className="h-7 text-[12px]"
        min={0}
      />
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={value.end_of_month}
          onChange={(e) => onChange({ ...value, end_of_month: e.target.checked })}
          className="h-3.5 w-3.5 rounded border-border accent-primary"
        />
      </div>
      <Input
        type="number"
        value={value.extra_days}
        onChange={(e) => onChange({ ...value, extra_days: Number(e.target.value) })}
        placeholder="0"
        className="h-7 text-[12px]"
        min={0}
      />
      <Input
        type="number"
        value={Number(value.percentage)}
        onChange={(e) => onChange({ ...value, percentage: Number(e.target.value) })}
        placeholder="0"
        className="h-7 text-[12px]"
        min={0}
        max={100}
        step="0.01"
      />
      <span className="text-[11px] text-muted-foreground">%</span>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// ── Inline form for create/edit ──
interface TermFormProps {
  initialCode?: string;
  initialDescription?: string;
  initialInstalments?: InstalmentCreate[];
  codeDisabled?: boolean;
  onSave: (data: { code: string; description: string; instalments: InstalmentCreate[] }) => void;
  onCancel: () => void;
  isPending: boolean;
  error?: string | null;
}

function TermForm({ initialCode = "", initialDescription = "", initialInstalments, codeDisabled, onSave, onCancel, isPending, error }: TermFormProps) {
  const [code, setCode] = useState(initialCode);
  const [description, setDescription] = useState(initialDescription);
  const [instalments, setInstalments] = useState<InstalmentCreate[]>(
    initialInstalments ?? [{ days: 0, end_of_month: false, extra_days: 0, percentage: 100 }],
  );

  const updateInst = (idx: number, val: InstalmentCreate) => {
    const next = [...instalments];
    next[idx] = val;
    setInstalments(next);
  };

  const removeInst = (idx: number) => {
    setInstalments(instalments.filter((_, i) => i !== idx));
  };

  const addInst = () => {
    setInstalments([...instalments, { days: 0, end_of_month: false, extra_days: 0, percentage: 0 }]);
  };

  const handleSave = () => {
    if (!code.trim() || !description.trim() || instalments.length === 0) return;
    onSave({ code: code.trim(), description: description.trim(), instalments });
  };

  return (
    <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/[0.02] p-4">
      <div className="flex gap-3">
        <div className="space-y-1 w-40">
          <label className="text-[11px] font-medium text-muted-foreground">Codice</label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={codeDisabled}
            className="h-8 text-[13px]"
            autoFocus={!codeDisabled}
          />
        </div>
        <div className="space-y-1 flex-1">
          <label className="text-[11px] font-medium text-muted-foreground">Descrizione</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-8 text-[13px]"
            autoFocus={codeDisabled}
          />
        </div>
      </div>

      {/* Instalments */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-muted-foreground">Rate</label>
        <div className={cn(ROW_GRID, "text-[10px] font-medium text-muted-foreground/60")}>
          <span />
          <span>Giorni</span>
          <span className="text-center">FM</span>
          <span>Extra gg</span>
          <span>Perc.</span>
          <span />
          <span />
        </div>
        {instalments.map((inst, idx) => (
          <InstalmentRow
            key={idx}
            index={idx}
            value={inst}
            onChange={(v) => updateInst(idx, v)}
            onRemove={() => removeInst(idx)}
          />
        ))}
        <button
          type="button"
          onClick={addInst}
          className="flex items-center gap-1 text-[12px] text-primary hover:underline"
        >
          <Plus className="h-3 w-3" />
          Aggiungi rata
        </button>
      </div>

      {error && <p className="text-[12px] text-destructive">{error}</p>}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
          Annulla
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isPending || !code.trim() || !description.trim() || instalments.length === 0}>
          {isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
          Salva
        </Button>
      </div>
    </div>
  );
}

// ── Main table ──
export function PaymentTermsTable() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/payment-terms", { params: { query: { limit: 200 } } });
      if (error) throw error;
      return data?.items ?? [];
    },
  });

  const [addMode, setAddMode] = useState(false);
  const [editGuid, setEditGuid] = useState<string | null>(null);
  const [expandedGuid, setExpandedGuid] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentTermOut | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: (body: { code: string; description: string; instalments: InstalmentCreate[] }) =>
      apiClient.POST("/payment-terms", { body }),
    onSuccess: (res) => {
      if (res.error) {
        setFormError("Codice già esistente.");
        return;
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["lookups", "payment-terms"] });
      setAddMode(false);
      setFormError(null);
    },
    onError: () => setFormError("Errore nella creazione."),
  });

  const updateMut = useMutation({
    mutationFn: (vars: { guid: string; body: { description?: string; instalments?: InstalmentCreate[] } }) =>
      apiClient.PATCH("/payment-terms/{guid}", { params: { path: { guid: vars.guid } }, body: vars.body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["lookups", "payment-terms"] });
      setEditGuid(null);
      setFormError(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (guid: string) =>
      apiClient.DELETE("/payment-terms/{guid}", { params: { path: { guid } } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["lookups", "payment-terms"] });
      setDeleteTarget(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] text-muted-foreground">
          {items.length} {items.length === 1 ? "condizione" : "condizioni"}
        </p>
        <Button size="sm" onClick={() => { setAddMode(true); setEditGuid(null); }} disabled={addMode}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Aggiungi
        </Button>
      </div>

      {/* Create form */}
      {addMode && (
        <div className="mb-4">
          <TermForm
            onSave={(data) => { setFormError(null); createMut.mutate(data); }}
            onCancel={() => { setAddMode(false); setFormError(null); }}
            isPending={createMut.isPending}
            error={formError}
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="h-9 w-8 px-2" />
              <th className="h-9 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-36">
                Codice
              </th>
              <th className="h-9 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Descrizione
              </th>
              <th className="h-9 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-40">
                Rate
              </th>
              <th className="h-9 w-24 px-4" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !addMode ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[13px] text-muted-foreground">
                  Nessuna condizione configurata.
                </td>
              </tr>
            ) : (
              items.map((term, idx) => {
                const isExpanded = expandedGuid === term.guid;
                const isEditing = editGuid === term.guid;
                const isLast = idx === items.length - 1;

                return (
                  <tr
                    key={term.guid}
                    className={cn(
                      "transition-colors hover:bg-muted/30",
                      !isLast && "border-b border-border/40",
                    )}
                  >
                    {isEditing ? (
                      <td colSpan={5} className="p-4">
                        <TermForm
                          initialCode={term.code}
                          initialDescription={term.description}
                          initialInstalments={term.instalments.map((i) => ({
                            days: i.days,
                            end_of_month: i.end_of_month,
                            extra_days: i.extra_days,
                            percentage: Number(i.percentage),
                          }))}
                          codeDisabled
                          onSave={(data) => {
                            setFormError(null);
                            updateMut.mutate({
                              guid: term.guid,
                              body: { description: data.description, instalments: data.instalments },
                            });
                          }}
                          onCancel={() => { setEditGuid(null); setFormError(null); }}
                          isPending={updateMut.isPending}
                          error={formError}
                        />
                      </td>
                    ) : (
                      <>
                        <td className="px-2 py-2.5">
                          <button
                            type="button"
                            onClick={() => setExpandedGuid(isExpanded ? null : term.guid)}
                            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground">
                          {term.code}
                        </td>
                        <td className="px-4 py-2.5">
                          <div>
                            <span className="text-[13px]">{term.description}</span>
                            {/* Expanded: instalment detail */}
                            {isExpanded && term.instalments.length > 0 && (
                              <div className="mt-2 space-y-1 rounded-md border border-border/40 bg-muted/20 p-2.5">
                                {term.instalments.map((inst, i) => (
                                  <div key={inst.guid} className="flex items-center gap-3 text-[12px] text-muted-foreground">
                                    <span className="w-4 text-center font-mono text-[11px]">{i + 1}.</span>
                                    <span className="font-medium text-foreground">{inst.days} giorni</span>
                                    {inst.end_of_month && (
                                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">FM</span>
                                    )}
                                    {inst.extra_days > 0 && (
                                      <span>+{inst.extra_days}gg</span>
                                    )}
                                    <span className="ml-auto tabular-nums">{fmtPct(inst.percentage)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-[12px] text-muted-foreground">
                          {term.instalments.length === 1
                            ? instalmentSummary(term.instalments[0])
                            : `${term.instalments.length} rate`}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => { setEditGuid(term.guid); setAddMode(false); }}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground [tr:hover_&]:opacity-100"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(term)}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive [tr:hover_&]:opacity-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmActionDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Elimina condizione"
        description={`Vuoi eliminare "${deleteTarget?.description}" (${deleteTarget?.code})? L'operazione non è reversibile.`}
        confirmLabel="Elimina"
        cancelLabel="Annulla"
        variant="destructive"
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.guid)}
        isLoading={deleteMut.isPending}
      />
    </div>
  );
}
