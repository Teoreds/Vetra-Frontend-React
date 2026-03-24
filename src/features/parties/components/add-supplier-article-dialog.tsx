import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Loader2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import { ArticleInlineSearch } from "@/features/orders/components/article-inline-search";
import { articlesApi } from "@/features/articles/api/articles.api";
import { articleKeys } from "@/features/articles/api/articles.queries";

const schema = z.object({
  article_guid: z.string().min(1, "Seleziona un articolo"),
  supplier_code: z.string().optional().default(""),
  purchase_price: z.coerce.number().min(0).optional(),
  is_preferred: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partyGuid: string;
}

export function AddSupplierArticleDialog({ open, onOpenChange, partyGuid }: Props) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [selectedArticleLabel, setSelectedArticleLabel] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { article_guid: "", supplier_code: "", purchase_price: undefined, is_preferred: false },
  });

  function handleClose(v: boolean) {
    if (!v) {
      setSelectedArticleLabel(null);
      reset();
      onOpenChange(false);
    }
  }

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const { error } = await articlesApi.addSupplier(values.article_guid, {
        party_guid: partyGuid,
        supplier_code: values.supplier_code || null,
        purchase_price: values.purchase_price ?? null,
        is_preferred: values.is_preferred,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: articleKeys.suppliers(values.article_guid) });
      setSelectedArticleLabel(null);
      reset();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalDialog open={open} onOpenChange={handleClose} title="Aggiungi Articolo Fornito" description="Associa un articolo che questo fornitore può fornire.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium">Articolo *</label>
          {selectedArticleLabel ? (
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
              <span className="flex-1 text-[13px] font-medium truncate">{selectedArticleLabel}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedArticleLabel(null);
                  setValue("article_guid", "");
                }}
                className="shrink-0 rounded-md p-0.5 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <ArticleInlineSearch
              onSelect={(article) => {
                setValue("article_guid", article.guid);
                setSelectedArticleLabel(`${article.code} — ${article.description}`);
              }}
            />
          )}
          {errors.article_guid && (
            <p className="text-[12px] text-destructive">{errors.article_guid.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Codice Fornitore</label>
            <Input {...register("supplier_code")} placeholder="es. SUP-001" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Prezzo Acquisto</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("purchase_price")}
              placeholder="0.00"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <Controller
            control={control}
            name="is_preferred"
            render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
            )}
          />
          <span className="text-[13px] font-medium">Fornitore preferito</span>
        </label>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={saving}>
            Annulla
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />Salvataggio…</> : "Aggiungi"}
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
}
