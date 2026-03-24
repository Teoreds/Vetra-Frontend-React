import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";

const schema = z.object({
  protocol_number: z.string().optional().default(""),
  year: z.coerce.number().min(2000).max(2100),
  max_amount: z.coerce.number().min(0, "Importo min. 0"),
  valid_from: z.string().min(1, "Obbligatorio"),
  valid_to: z.string().min(1, "Obbligatorio"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partyGuid: string;
}

export function AddIntentLetterDialog({ open, onOpenChange, partyGuid }: Props) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const currentYear = new Date().getFullYear();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      protocol_number: "",
      year: currentYear,
      max_amount: 0,
      valid_from: "",
      valid_to: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const { error } = await partiesApi.createIntentLetter({
        party_guid: partyGuid,
        protocol_number: values.protocol_number || null,
        year: values.year,
        max_amount: values.max_amount,
        valid_from: values.valid_from,
        valid_to: values.valid_to,
        is_active: true,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: partyKeys.intentLetters(partyGuid) });
      reset();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalDialog open={open} onOpenChange={onOpenChange} title="Aggiungi Lettera d'Intento" description="Registra una nuova lettera d'intento per il cliente.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">N. Protocollo</label>
            <Input {...register("protocol_number")} placeholder="es. 12345" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Anno *</label>
            <Input type="number" {...register("year")} error={!!errors.year} />
            {errors.year && (
              <p className="text-[12px] text-destructive">{errors.year.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium">Importo Massimo *</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register("max_amount")}
            placeholder="0.00"
            error={!!errors.max_amount}
          />
          {errors.max_amount && (
            <p className="text-[12px] text-destructive">{errors.max_amount.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Valida dal *</label>
            <Input type="date" {...register("valid_from")} error={!!errors.valid_from} />
            {errors.valid_from && (
              <p className="text-[12px] text-destructive">{errors.valid_from.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Valida al *</label>
            <Input type="date" {...register("valid_to")} error={!!errors.valid_to} />
            {errors.valid_to && (
              <p className="text-[12px] text-destructive">{errors.valid_to.message}</p>
            )}
          </div>
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
