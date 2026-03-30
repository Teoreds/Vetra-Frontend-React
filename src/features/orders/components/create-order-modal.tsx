import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod/v4";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { DatePicker } from "@/shared/ui/date-picker";
import { useParties } from "@/features/parties/hooks/use-parties";
import { useCreateOrder } from "../hooks/use-create-order";

const createOrderSchema = z.object({
  party_guid: z.uuid("Please select a valid party"),
  order_date: z.string().min(1, "Order date is required"),
});

type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

interface CreateOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOrderModal({ open, onOpenChange }: CreateOrderModalProps) {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const { data: partiesData } = useParties({ limit: 200 });
  const parties = partiesData?.items ?? [];

  const today = new Date().toISOString().slice(0, 10);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateOrderFormValues>({
    defaultValues: { order_date: today },
  });

  const onSubmit = (values: CreateOrderFormValues) => {
    const parsed = createOrderSchema.safeParse(values);
    if (!parsed.success) return;

    createOrder.mutate(
      { party_guid: parsed.data.party_guid, order_date: parsed.data.order_date },
      {
        onSuccess: (data) => {
          reset();
          onOpenChange(false);
          if (data?.guid) navigate(`/orders/${data.guid}`);
        },
      },
    );
  };

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nuovo Ordine"
      description="Seleziona un cliente e una data per creare un nuovo ordine."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium">Cliente</label>
          <Controller
            control={control}
            name="party_guid"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un cliente…" />
                </SelectTrigger>
                <SelectContent>
                  {parties.map((p) => (
                    <SelectItem key={p.guid} value={p.guid}>
                      {p.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.party_guid && (
            <p className="text-[11px] text-destructive">{errors.party_guid.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium">Data Ordine</label>
          <Controller
            control={control}
            name="order_date"
            render={({ field }) => (
              <DatePicker value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.order_date && (
            <p className="text-[11px] text-destructive">{errors.order_date.message}</p>
          )}
        </div>

        {createOrder.error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
            <p className="text-[13px] text-destructive">Impossibile creare l'ordine. Riprova.</p>
          </div>
        )}

        <div className="flex justify-end gap-2.5 border-t border-border/60 pt-4">
          <Button variant="outline" size="sm" type="button" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button size="sm" type="submit" disabled={createOrder.isPending}>
            {createOrder.isPending ? "Creazione in corso…" : "Crea Ordine"}
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
}
