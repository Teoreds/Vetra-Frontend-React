import { useEffect } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { ArrowRight, MapPin, Loader2, CreditCard, CalendarClock } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { DatePicker } from "@/shared/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { PartySearchSelect } from "@/features/parties/components/party-search-select";
import { usePartyLocations, type PartyLocationWithAddress } from "@/features/parties/hooks/use-party-locations";
import { usePaymentMethods, usePaymentTerms } from "@/shared/hooks/use-lookups";
import { useParty } from "@/features/parties/hooks/use-party";

const step1Schema = z.object({
  party_guid: z.uuid("Seleziona un cliente valido"),
  order_date: z.string().min(1, "La data è obbligatoria"),
  payment_method_guid: z.string().optional(),
  payment_term_guid: z.string().optional(),
  shipping_location_guid: z.string().optional(),
  billing_location_guid: z.string().optional(),
});

export type Step1Data = z.infer<typeof step1Schema>;

interface NewOrderStepDetailsProps {
  defaultValues?: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
  isPending?: boolean;
  error?: string | null;
  readOnly?: boolean;
}

function formatAddress(loc: PartyLocationWithAddress): string {
  const parts = [loc.address_line, loc.city].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  return loc.type_code;
}

export function NewOrderStepDetails({ defaultValues, onNext, isPending, error, readOnly }: NewOrderStepDetailsProps) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: paymentMethods } = usePaymentMethods();
  const { data: paymentTerms } = usePaymentTerms();

  const { handleSubmit, control, setValue, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { order_date: today, ...defaultValues },
  });

  const selectedPartyGuid = useWatch({ control, name: "party_guid" });
  const { data: selectedParty } = useParty(selectedPartyGuid || "");
  const { data: locations = [], isLoading: isLoadingLocations } = usePartyLocations(
    selectedPartyGuid || undefined,
  );

  // Reset and preselect defaults when party changes (create mode only)
  useEffect(() => {
    if (readOnly || !selectedPartyGuid) return;

    // Clear previous selections so primaries/defaults can be applied
    setValue("shipping_location_guid", undefined);
    setValue("billing_location_guid", undefined);
    setValue("payment_method_guid", undefined);
    setValue("payment_term_guid", undefined);
  }, [selectedPartyGuid, setValue, readOnly]);

  // Pre-fill payment defaults from party
  useEffect(() => {
    if (readOnly || !selectedParty) return;
    if (selectedParty.default_payment_method_guid) {
      setValue("payment_method_guid", selectedParty.default_payment_method_guid);
    }
    if (selectedParty.default_payment_term_guid) {
      setValue("payment_term_guid", selectedParty.default_payment_term_guid);
    }
  }, [selectedParty, setValue, readOnly]);

  useEffect(() => {
    if (readOnly || isLoadingLocations || locations.length === 0) return;

    const primaryShipping = locations.find((l) => l.type_code === "SHIPPING" && l.is_primary);
    const primaryBilling = locations.find((l) => l.type_code === "BILLING" && l.is_primary);

    if (primaryShipping) {
      setValue("shipping_location_guid", primaryShipping.location_guid);
    }
    if (primaryBilling) {
      setValue("billing_location_guid", primaryBilling.location_guid);
    }
  }, [locations, isLoadingLocations, setValue, readOnly]);

  const shippingLocations = locations.filter((l) => l.type_code === "SHIPPING");
  const billingLocations = locations.filter((l) => l.type_code === "BILLING");

  const onSubmit = (values: Step1Data) => {
    onNext(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-[15px] font-semibold">Dati Ordine</h2>
          <p className="text-[13px] text-muted-foreground">
            Seleziona il cliente, la data e gli indirizzi.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Row 1: Cliente + Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Cliente</label>
              <Controller
                control={control}
                name="party_guid"
                render={({ field }) => (
                  <PartySearchSelect
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={readOnly}
                    typeCode="CUSTOMER"
                  />
                )}
              />
              {errors.party_guid && (
                <p className="text-[12px] text-destructive">{errors.party_guid.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Data Ordine</label>
              <Controller
                control={control}
                name="order_date"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleziona una data…"
                    disabled={readOnly}
                  />
                )}
              />
              {errors.order_date && (
                <p className="text-[12px] text-destructive">{errors.order_date.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Metodo di Pagamento + Condizioni */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[13px] font-medium">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                Metodo di Pagamento
              </label>
              <Controller
                control={control}
                name="payment_method_guid"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona metodo…" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((pm) => (
                        <SelectItem key={pm.guid} value={pm.guid}>
                          {pm.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[13px] font-medium">
                <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                Condizioni di Pagamento
              </label>
              <Controller
                control={control}
                name="payment_term_guid"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona condizioni…" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTerms.map((pt) => (
                        <SelectItem key={pt.guid} value={pt.guid}>
                          {pt.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Row 3: Indirizzi (condizionale) */}
          {selectedPartyGuid && (
            <div className="grid grid-cols-2 gap-4">
              {/* Spedizione */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[13px] font-medium">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Indirizzo di Spedizione
                  {isLoadingLocations && (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                </label>

                {!isLoadingLocations && shippingLocations.length === 0 ? (
                  <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 text-[13px] text-muted-foreground">
                    Nessun indirizzo di spedizione.
                  </p>
                ) : (
                  <Controller
                    control={control}
                    name="shipping_location_guid"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        disabled={isLoadingLocations}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Nessuna preferenza…" />
                        </SelectTrigger>
                        <SelectContent>
                          {shippingLocations.map((loc) => (
                            <SelectItem key={loc.guid} value={loc.location_guid}>
                              {formatAddress(loc)}
                              {loc.is_primary ? " (Primario)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </div>

              {/* Fatturazione */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[13px] font-medium">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Indirizzo di Fatturazione
                  {isLoadingLocations && (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                </label>

                {!isLoadingLocations && billingLocations.length === 0 ? (
                  <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 text-[13px] text-muted-foreground">
                    Nessun indirizzo di fatturazione.
                  </p>
                ) : (
                  <Controller
                    control={control}
                    name="billing_location_guid"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        disabled={isLoadingLocations}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Nessuna preferenza…" />
                        </SelectTrigger>
                        <SelectContent>
                          {billingLocations.map((loc) => (
                            <SelectItem key={loc.guid} value={loc.location_guid}>
                              {formatAddress(loc)}
                              {loc.is_primary ? " (Primario)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-[13px] text-destructive">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Creazione bozza…
            </>
          ) : (
            <>
              Avanti
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
