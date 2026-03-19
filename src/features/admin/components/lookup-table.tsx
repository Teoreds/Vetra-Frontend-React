import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ConfirmActionDialog } from "@/shared/ui/confirm-action-dialog";
import { cn } from "@/shared/lib/utils";
import { createLookupApi, type LookupItem } from "../api/admin.api";

interface LookupTableProps {
  lookupKey: string;
  path: Parameters<typeof createLookupApi>[0];
}

export function LookupTable({ lookupKey, path }: LookupTableProps) {
  const queryClient = useQueryClient();
  const api = createLookupApi(path);
  const queryKey = ["admin", "lookups", lookupKey];

  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await api.list();
      if (error) throw error;
      return data ?? [];
    },
  });

  // --- State ---
  const [addMode, setAddMode] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<LookupItem | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // --- Mutations ---
  const createMut = useMutation({
    mutationFn: () => api.create({ code: newCode.trim(), description: newDesc.trim() }),
    onSuccess: (res) => {
      if (res.error) {
        setCreateError("Codice già esistente.");
        return;
      }
      queryClient.invalidateQueries({ queryKey });
      setAddMode(false);
      setNewCode("");
      setNewDesc("");
      setCreateError(null);
    },
    onError: () => setCreateError("Errore nella creazione."),
  });

  const updateMut = useMutation({
    mutationFn: (vars: { code: string; description: string }) =>
      api.update(vars.code, { description: vars.description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setEditingCode(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (code: string) => api.delete(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setDeleteTarget(null);
    },
  });

  const startEdit = (item: LookupItem) => {
    setEditingCode(item.code);
    setEditDesc(item.description);
    setAddMode(false);
  };

  const cancelEdit = () => {
    setEditingCode(null);
    setEditDesc("");
  };

  const confirmEdit = () => {
    if (!editingCode || !editDesc.trim()) return;
    updateMut.mutate({ code: editingCode, description: editDesc.trim() });
  };

  const confirmCreate = () => {
    if (!newCode.trim() || !newDesc.trim()) return;
    setCreateError(null);
    createMut.mutate();
  };

  const cancelAdd = () => {
    setAddMode(false);
    setNewCode("");
    setNewDesc("");
    setCreateError(null);
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
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] text-muted-foreground">
          {items.length} {items.length === 1 ? "voce" : "voci"}
        </p>
        <Button
          size="sm"
          onClick={() => {
            setAddMode(true);
            setEditingCode(null);
          }}
          disabled={addMode}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Aggiungi
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="h-9 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-48">
                Codice
              </th>
              <th className="h-9 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Descrizione
              </th>
              <th className="h-9 w-24 px-4" />
            </tr>
          </thead>
          <tbody>
            {/* New row (inline create) */}
            {addMode && (
              <tr className="border-b border-border/60 bg-primary/[0.03]">
                <td className="px-4 py-2">
                  <Input
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Codice…"
                    className="h-8 text-[13px]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmCreate();
                      if (e.key === "Escape") cancelAdd();
                    }}
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Descrizione…"
                    className="h-8 text-[13px]"
                    error={!!createError}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmCreate();
                      if (e.key === "Escape") cancelAdd();
                    }}
                  />
                  {createError && (
                    <p className="mt-0.5 text-[11px] text-destructive">{createError}</p>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={confirmCreate}
                      disabled={createMut.isPending || !newCode.trim() || !newDesc.trim()}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-40"
                    >
                      {createMut.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={cancelAdd}
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
                <td colSpan={3} className="py-10 text-center text-[13px] text-muted-foreground">
                  Nessuna voce configurata.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => {
                const isEditing = editingCode === item.code;
                const isLast = idx === items.length - 1 && !addMode;

                return (
                  <tr
                    key={item.code}
                    className={cn(
                      "transition-colors hover:bg-muted/30",
                      !isLast && "border-b border-border/40",
                      isEditing && "bg-primary/[0.03]",
                    )}
                  >
                    <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground">
                      {item.code}
                    </td>
                    <td className="px-4 py-2.5">
                      {isEditing ? (
                        <Input
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="h-8 text-[13px]"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmEdit();
                            if (e.key === "Escape") cancelEdit();
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
                              {updateMut.isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
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
                              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all group-hover/row:opacity-100 hover:bg-muted hover:text-foreground [tr:hover_&]:opacity-100"
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

      {/* Delete confirmation */}
      <ConfirmActionDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Elimina voce"
        description={`Vuoi eliminare "${deleteTarget?.description}" (${deleteTarget?.code})? L'operazione non è reversibile.`}
        confirmLabel="Elimina"
        cancelLabel="Annulla"
        variant="destructive"
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.code)}
        isLoading={deleteMut.isPending}
      />
    </div>
  );
}
