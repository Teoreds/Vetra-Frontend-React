import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import { Button } from "@/shared/ui/button";
import { ArticleInlineSearch } from "@/features/orders/components/article-inline-search";
import { useCreateQuoteRow } from "../hooks/use-quote-rows";

const addRowSchema = z.object({
  article_guid: z.uuid("Seleziona un articolo valido"),
  article_code: z.string({ error: "" }).default(""),
  article_description: z.string({ error: "" }).default(""),
  quantity: z.coerce.number({ error: "Inserisci una quantità" }).positive("La quantità deve essere maggiore di zero"),
  unit_price: z.coerce.number({ error: "Inserisci un prezzo" }).min(0, "Il prezzo non può essere negativo"),
  discount_percent: z.coerce.number().min(0).max(100).default(0),
  vat_code: z.string().optional(),
  unit_of_measure_code: z.string().optional(),
});

type AddRowFormValues = z.infer<typeof addRowSchema>;

interface AddQuoteRowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteGuid: string;
}

export function AddQuoteRowModal({
  open,
  onOpenChange,
  quoteGuid,
}: AddQuoteRowModalProps) {
  const createRow = useCreateQuoteRow(quoteGuid);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddRowFormValues>({
    resolver: zodResolver(addRowSchema) as unknown as Resolver<AddRowFormValues>,
    defaultValues: { discount_percent: 0 },
  });

  const onSubmit = (values: AddRowFormValues) => {
    createRow.mutate(
      {
        article_guid: values.article_guid,
        quantity: values.quantity,
        unit_price: values.unit_price,
        discount_percent: values.discount_percent || null,
        vat_code: values.vat_code || null,
        unit_of_measure_code: values.unit_of_measure_code || null,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Aggiungi Riga Preventivo"
      description="Aggiungi un articolo a questo preventivo."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium">Articolo</label>
          <Controller
            control={control}
            name="article_guid"
            render={({ field }) => (
              <ArticleInlineSearch
                onSelect={(article) => {
                  field.onChange(article.guid);
                  setValue("article_code", article.code);
                  setValue("article_description", article.description);
                  setValue(
                    "unit_of_measure_code",
                    article.unit_of_measure_code ?? undefined,
                  );
                  setValue("unit_price", article.list_price ? parseFloat(article.list_price) : 0);
                }}
              />
            )}
          />
          {errors.article_guid && (
            <p className="text-[11px] text-destructive">
              {errors.article_guid.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Quantità</label>
            <input
              type="number"
              step="any"
              {...register("quantity")}
              className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20"
            />
            {errors.quantity && (
              <p className="text-[11px] text-destructive">
                {errors.quantity.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Prezzo Unitario</label>
            <input
              type="number"
              step="0.01"
              {...register("unit_price")}
              className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20"
            />
            {errors.unit_price && (
              <p className="text-[11px] text-destructive">
                {errors.unit_price.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Sconto %</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register("discount_percent")}
              className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Codice IVA</label>
            <input
              {...register("vat_code")}
              placeholder="es. 22"
              className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all placeholder:text-muted-foreground/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-border/60 pt-4">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Annulla
          </Button>
          <Button size="sm" type="submit" disabled={createRow.isPending}>
            {createRow.isPending ? "Aggiungendo..." : "Aggiungi Riga"}
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
}
