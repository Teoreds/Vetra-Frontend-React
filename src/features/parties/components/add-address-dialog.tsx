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
import { useLocationTypes } from "@/shared/hooks/use-lookups";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";

const schema = z.object({
  address_line: z.string().min(1, "L'indirizzo è obbligatorio"),
  city: z.string().optional().default(""),
  province: z.string().optional().default(""),
  post_code: z.string().optional().default(""),
  type_code: z.string().min(1, "Seleziona un tipo"),
  is_primary: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partyGuid: string;
}

export function AddAddressDialog({ open, onOpenChange, partyGuid }: Props) {
  const queryClient = useQueryClient();
  const { data: locationTypes } = useLocationTypes();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { address_line: "", city: "", province: "", post_code: "", type_code: "", is_primary: false },
  });

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      // 1. Create location
      const { data: loc, error: locError } = await partiesApi.createLocation({
        address_line: values.address_line || null,
        city: values.city || null,
        province: values.province || null,
        post_code: values.post_code || null,
      });
      if (locError || !loc) throw locError ?? new Error("Failed to create location");

      // 2. Link to party
      const { error: linkError } = await partiesApi.createPartyLocation(partyGuid, {
        location_guid: loc.guid,
        type_code: values.type_code,
        is_primary: values.is_primary,
      });
      if (linkError) throw linkError;

      queryClient.invalidateQueries({ queryKey: partyKeys.locations(partyGuid) });
      reset();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalDialog open={open} onOpenChange={onOpenChange} title="Aggiungi Indirizzo" description="Aggiungi un nuovo indirizzo all'anagrafica.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium">Indirizzo *</label>
          <Input {...register("address_line")} placeholder="Via Roma 1" error={!!errors.address_line} />
          {errors.address_line && (
            <p className="text-[11px] text-destructive">{errors.address_line.message}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Città</label>
            <Input {...register("city")} placeholder="Milano" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Provincia</label>
            <Input {...register("province")} placeholder="MI" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">CAP</label>
            <Input {...register("post_code")} placeholder="20100" />
          </div>
        </div>

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
                  {locationTypes.map((lt) => (
                    <SelectItem key={lt.code} value={lt.code}>
                      {lt.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.type_code && (
            <p className="text-[11px] text-destructive">{errors.type_code.message}</p>
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
          <span className="text-[13px] font-medium">Indirizzo primario</span>
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
