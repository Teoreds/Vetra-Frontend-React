import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import { Button } from "@/shared/ui/button";
import { useCreateOrderRow } from "../hooks/use-order-rows";

const addRowSchema = z.object({
  article_guid: z.uuid("Valid article ID required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit_price: z.coerce.number().min(0, "Price must be non-negative"),
  vat_code: z.string().optional(),
});

type AddRowFormValues = z.infer<typeof addRowSchema>;

interface AddRowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderGuid: string;
}

export function AddRowModal({ open, onOpenChange, orderGuid }: AddRowModalProps) {
  const createRow = useCreateOrderRow(orderGuid);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddRowFormValues>();

  const onSubmit = (values: AddRowFormValues) => {
    const parsed = addRowSchema.safeParse(values);
    if (!parsed.success) return;

    createRow.mutate(
      {
        article_guid: parsed.data.article_guid,
        quantity: parsed.data.quantity,
        unit_price: parsed.data.unit_price,
        vat_code: parsed.data.vat_code ?? null,
        availability_status_code: "UNKNOWN",
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
      title="Aggiungi Riga Ordine"
      description="Aggiungi una nuova riga di articoli a questo ordine."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium">ID Articolo</label>
          <input
            {...register("article_guid")}
            className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all placeholder:text-muted-foreground/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20"
            placeholder="UUID dell'articolo"
          />
          {errors.article_guid && (
            <p className="text-[12px] text-destructive">{errors.article_guid.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Quantità</label>
            <input
              type="number"
              step="any"
              {...register("quantity", { valueAsNumber: true })}
              className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20"
            />
            {errors.quantity && (
              <p className="text-[12px] text-destructive">{errors.quantity.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Prezzo Unitario</label>
            <input
              type="number"
              step="0.01"
              {...register("unit_price", { valueAsNumber: true })}
              className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20"
            />
            {errors.unit_price && (
              <p className="text-[12px] text-destructive">{errors.unit_price.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium">Partita IVA</label>
          <input
            {...register("vat_code")}
            className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all placeholder:text-muted-foreground/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20"
            placeholder="e.g., 22"
          />
        </div>

        <div className="flex justify-end gap-2.5 border-t border-border/60 pt-4">
          <Button variant="outline" size="sm" type="button" onClick={() => onOpenChange(false)}>
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
