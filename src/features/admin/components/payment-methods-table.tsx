import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ConfirmActionDialog } from "@/shared/ui/confirm-action-dialog";
import { cn } from "@/shared/lib/utils";
import { apiClient } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

type PaymentMethodOut = components["schemas"]["PaymentMethodOut"];

const QUERY_KEY = ["admin", "payment-methods"];

export function PaymentMethodsTable() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/payment-methods", { params: { query: { limit: 200 } } });
      if (error) throw error;
      return data?.items ?? [];
    },
  });

  const [addMode, setAddMode] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [editGuid, setEditGuid] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethodOut | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["lookups", "payment-methods"] });
  };

  const createMut = useMutation({
    mutationFn: () =>
      apiClient.POST("/payment-methods", { body: { description: newDesc.trim() } }),
    onSuccess: (res) => {
      if (res.error) {
        setCreateError("Errore nella creazione.");
        return;
      }
      invalidate();
      setAddMode(false);
      setNewDesc("");
      setCreateError(null);
    },
    onError: () => setCreateError("Errore nella creazione."),
  });

  const updateMut = useMutation({
    mutationFn: (vars: { guid: string; description: string }) =>
      apiClient.PATCH("/payment-methods/{guid}", {
        params: { path: { guid: vars.guid } },
        body: { description: vars.description },
      }),
    onSuccess: () => {
      invalidate();
      setEditGuid(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (guid: string) =>
      apiClient.DELETE("/payment-methods/{guid}", { params: { path: { guid } } }),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
    },
  });

  const startEdit = (item: PaymentMethodOut) => {
    setEditGuid(item.guid);
    setEditDesc(item.description);
    setAddMode(false);
  };

  const confirmEdit = () => {
    if (!editGuid || !editDesc.trim()) return;
    updateMut.mutate({ guid: editGuid, description: editDesc.trim() });
  };

  const confirmCreate = () => {
    if (!newDesc.trim()) return;
    setCreateError(null);
    createMut.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] text-muted-foreground">
          {items.length} {items.length === 1 ? "metodo" : "metodi"}
        </p>
        <Button size="sm" onClick={() => { setAddMode(true); setEditGuid(null); }} disabled={addMode}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Aggiungi
        </Button>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="h-9 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Descrizione
              </th>
              <th className="h-9 w-24 px-4" />
            </tr>
          </thead>
          <tbody>
            {addMode && (
              <tr className="border-b border-border/60 bg-primary/[0.03]">
                <td className="px-4 py-2">
                  <Input
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Es. Ri.Ba., Bonifico, Contrassegno…"
                    className="h-8 text-[13px]"
                    autoFocus
                    error={!!createError}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmCreate();
                      if (e.key === "Escape") { setAddMode(false); setNewDesc(""); setCreateError(null); }
                    }}
                  />
                  {createError && <p className="mt-0.5 text-[11px] text-destructive">{createError}</p>}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={confirmCreate}
                      disabled={createMut.isPending || !newDesc.trim()}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-40"
                    >
                      {createMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddMode(false); setNewDesc(""); setCreateError(null); }}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {items.length === 0 && !addMode ? (
              <tr>
                <td colSpan={2} className="py-10 text-center text-[13px] text-muted-foreground">
                  Nessun metodo di pagamento configurato.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => {
                const isEditing = editGuid === item.guid;
                const isLast = idx === items.length - 1 && !addMode;

                return (
                  <tr
                    key={item.guid}
                    className={cn(
                      "transition-colors hover:bg-muted/30",
                      !isLast && "border-b border-border/40",
                      isEditing && "bg-primary/[0.03]",
                    )}
                  >
                    <td className="px-4 py-2.5">
                      {isEditing ? (
                        <Input
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="h-8 text-[13px]"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmEdit();
                            if (e.key === "Escape") setEditGuid(null);
                          }}
                        />
                      ) : (
                        <span className="text-[13px]">{item.description}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={confirmEdit}
                              disabled={updateMut.isPending || !editDesc.trim()}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-40"
                            >
                              {updateMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditGuid(null)}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground [tr:hover_&]:opacity-100"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive [tr:hover_&]:opacity-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
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
        title="Elimina metodo"
        description={`Vuoi eliminare "${deleteTarget?.description}"? L'operazione non è reversibile.`}
        confirmLabel="Elimina"
        cancelLabel="Annulla"
        variant="destructive"
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.guid)}
        isLoading={deleteMut.isPending}
      />
    </div>
  );
}
