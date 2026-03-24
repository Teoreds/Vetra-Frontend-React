import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import { SearchableSelect } from "@/shared/ui/searchable-select";
import { useArticleTypes } from "@/features/articles/hooks/use-article-lookups";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";

const schema = z.object({
  article_type_code: z.string().optional().default(""),
  discount_percent: z.coerce.number().min(0, "Min 0").max(100, "Max 100"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partyGuid: string;
}

export function AddDiscountDialog({ open, onOpenChange, partyGuid }: Props) {
  const queryClient = useQueryClient();
  const { data: articleTypes = [] } = useArticleTypes();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { article_type_code: "", discount_percent: 0 },
  });

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const { error } = await partiesApi.createPartyDiscount({
        party_guid: partyGuid,
        article_type_code: values.article_type_code || null,
        discount_percent: values.discount_percent,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: partyKeys.discounts(partyGuid) });
      reset();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalDialog open={open} onOpenChange={onOpenChange} title="Aggiungi Sconto" description="Definisci uno sconto per tipo articolo.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium">
            Tipo Articolo
            <span className="ml-1 font-normal text-muted-foreground">(vuoto = tutti)</span>
          </label>
          <Controller
            control={control}
            name="article_type_code"
            render={({ field }) => (
              <SearchableSelect
                items={articleTypes.map((t) => ({ value: t.code, label: t.description }))}
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Tutti i tipi…"
              />
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium">Sconto % *</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...register("discount_percent")}
            placeholder="es. 10"
            error={!!errors.discount_percent}
          />
          {errors.discount_percent && (
            <p className="text-[12px] text-destructive">{errors.discount_percent.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
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
