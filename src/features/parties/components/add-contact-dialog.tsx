import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useContactTypes } from "@/shared/hooks/use-lookups";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";

const schema = z.object({
  type_code: z.string().min(1, "Seleziona un tipo"),
  content: z.string().min(1, "Obbligatorio"),
  label: z.string().optional().default(""),
  is_primary: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partyGuid: string;
}

export function AddContactDialog({ open, onOpenChange, partyGuid }: Props) {
  const queryClient = useQueryClient();
  const { data: contactTypes } = useContactTypes();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type_code: "", content: "", label: "", is_primary: false },
  });

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const { error } = await partiesApi.createContact(partyGuid, {
        type_code: values.type_code,
        content: values.content,
        label: values.label || null,
        is_primary: values.is_primary,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: partyKeys.contacts(partyGuid) });
      reset();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalDialog open={open} onOpenChange={onOpenChange} title="Aggiungi Contatto" description="Aggiungi un nuovo recapito all'anagrafica.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Tipo *</label>
            <Controller
              control={control}
              name="type_code"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona…" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactTypes.map((ct) => (
                      <SelectItem key={ct.code} value={ct.code}>
                        {ct.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type_code && (
              <p className="text-[12px] text-destructive">{errors.type_code.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Etichetta</label>
            <Input {...register("label")} placeholder="es. Ufficio" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium">Valore *</label>
          <Input {...register("content")} placeholder="es. info@azienda.it" error={!!errors.content} />
          {errors.content && (
            <p className="text-[12px] text-destructive">{errors.content.message}</p>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <Controller
            control={control}
            name="is_primary"
            render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
            )}
          />
          <span className="text-[13px] font-medium">Contatto primario</span>
        </label>

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
