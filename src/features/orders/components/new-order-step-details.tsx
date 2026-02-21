import { useForm, useWatch } from "react-hook-form";
import { z } from "zod/v4";
import { ArrowRight, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { useParties } from "@/features/parties/hooks/use-parties";
import { usePartyLocations } from "@/features/parties/hooks/use-party-locations";

const step1Schema = z.object({
  party_guid: z.uuid("Seleziona un cliente valido"),
  order_date: z.string().min(1, "La data è obbligatoria"),
  shipping_location_guid: z.string().optional(),
});

export type Step1Data = z.infer<typeof step1Schema>;

interface NewOrderStepDetailsProps {
  defaultValues?: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
}

const selectCls =
  "flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-ring/20 disabled:opacity-50";
const inputCls =
  "flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-ring/20";

export function NewOrderStepDetails({ defaultValues, onNext }: NewOrderStepDetailsProps) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: partiesData } = useParties({ limit: 200 });
  const parties = partiesData?.items ?? [];

  const { register, handleSubmit, control, formState: { errors } } = useForm<Step1Data>({
    defaultValues: { order_date: today, ...defaultValues },
  });

  const selectedPartyGuid = useWatch({ control, name: "party_guid" });
  const { data: locations = [], isLoading: isLoadingLocations } = usePartyLocations(
    selectedPartyGuid || undefined,
  );

  const onSubmit = (values: Step1Data) => {
    const parsed = step1Schema.safeParse(values);
    if (!parsed.success) return;
    onNext(parsed.data);
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-[15px] font-semibold">Dati Ordine</h2>
        <p className="text-[13px] text-muted-foreground">
          Seleziona il cliente, la data e l'indirizzo di spedizione.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Row 1: Cliente + Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Cliente</label>
              <select {...register("party_guid")} className={selectCls}>
                <option value="">Seleziona un cliente…</option>
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
              <label className="text-[13px] font-medium">Data Ordine</label>
              <input
                type="date"
                {...register("order_date")}
                className={inputCls}
              />
              {errors.order_date && (
                <p className="text-[12px] text-destructive">{errors.order_date.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Luogo di Spedizione (condizionale) */}
          {selectedPartyGuid && (
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[13px] font-medium">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Luogo di Spedizione
                {isLoadingLocations && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </label>

              {!isLoadingLocations && locations.length === 0 ? (
                <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 text-[13px] text-muted-foreground">
                  Nessun indirizzo associato al cliente selezionato.
                </p>
              ) : (
                <select
                  {...register("shipping_location_guid")}
                  className={selectCls}
                  disabled={isLoadingLocations}
                >
                  <option value="">Nessuna preferenza…</option>
                  {locations.map((loc) => (
                    <option key={loc.guid} value={loc.location_guid}>
                      {loc.type_code.charAt(0).toUpperCase() + loc.type_code.slice(1).toLowerCase()}
                      {loc.is_primary ? " — Primario" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="flex justify-end border-t border-border/60 pt-4">
            <Button type="submit">
              Avanti
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
