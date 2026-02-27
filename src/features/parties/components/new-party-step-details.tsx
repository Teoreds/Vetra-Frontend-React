import { useForm, Controller } from "react-hook-form";
import { z } from "zod/v4";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

const PARTY_TYPES = [
  { value: "CUSTOMER", label: "Cliente" },
  { value: "SUPPLIER", label: "Fornitore" },
  { value: "CARRIER", label: "Trasportatore" },
] as const;

const step1Schema = z.object({
  description: z.string().min(1, "La descrizione è obbligatoria"),
  vat_number: z.string().optional().default(""),
  type_code: z.string().min(1, "Seleziona un tipo"),
});

export type Step1Data = z.infer<typeof step1Schema>;

interface Props {
  defaultValues?: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
  isPending?: boolean;
  error?: string | null;
}

export function NewPartyStepDetails({ defaultValues, onNext, isPending, error }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step1Data>({
    defaultValues: {
      description: "",
      vat_number: "",
      type_code: "",
      ...defaultValues,
    },
  });

  const onSubmit = (values: Step1Data) => {
    const parsed = step1Schema.safeParse(values);
    if (!parsed.success) return;
    onNext(parsed.data);
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-[15px] font-semibold">Dati Anagrafica</h2>
        <p className="text-[13px] text-muted-foreground">
          Informazioni principali dell'anagrafica.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Descrizione *</label>
              <Input
                {...register("description", { required: "Obbligatorio" })}
                placeholder="Ragione sociale…"
                error={!!errors.description}
              />
              {errors.description && (
                <p className="text-[12px] text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Partita IVA</label>
              <Input {...register("vat_number")} placeholder="IT01234567890" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Tipo *</label>
              <Controller
                control={control}
                name="type_code"
                rules={{ required: "Seleziona un tipo" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo…" />
                    </SelectTrigger>
                    <SelectContent>
                      {PARTY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
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
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
              <p className="text-[13px] text-destructive">{error}</p>
            </div>
          )}

          <div className="flex justify-end border-t border-border/60 pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Avanti
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
