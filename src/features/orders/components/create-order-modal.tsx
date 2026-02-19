import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import { Button } from "@/shared/ui/button";
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
    register,
    handleSubmit,
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
      title="New Order"
      description="Select a party and date to create a new order."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium">Party</label>
          <select
            {...register("party_guid")}
            className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-ring/20"
          >
            <option value="">Select a party…</option>
            {parties.map((p) => (
              <option key={p.guid} value={p.guid}>
                {p.description}
              </option>
            ))}
          </select>
          {errors.party_guid && (
            <p className="text-[12px] text-destructive">{errors.party_guid.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium">Order Date</label>
          <input
            type="date"
            {...register("order_date")}
            className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-ring/20"
          />
          {errors.order_date && (
            <p className="text-[12px] text-destructive">{errors.order_date.message}</p>
          )}
        </div>

        {createOrder.error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
            <p className="text-[13px] text-destructive">Failed to create order. Please try again.</p>
          </div>
        )}

        <div className="flex justify-end gap-2.5 border-t border-border/60 pt-4">
          <Button variant="outline" size="sm" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={createOrder.isPending}>
            {createOrder.isPending ? "Creating…" : "Create Order"}
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
}
