import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod/v4";
import { ArrowRight, Loader2, Building2, Truck, FileText, Tag, CreditCard } from "lucide-react";
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
import { usePartyTypes, useFiscalAreas, usePartyCategories, usePaymentMethods, usePaymentTerms } from "@/shared/hooks/use-lookups";
import { useParties } from "../hooks/use-parties";

const SHIPPING_MODES = [
  { value: "FRANCO", label: "Franco" },
  { value: "ASSEGNATO", label: "Assegnato" },
] as const;

const step1Schema = z.object({
  description: z.string().min(1, "La descrizione è obbligatoria"),
  vat_number: z.string().optional().default(""),
  type_code: z.string().min(1, "Seleziona un tipo"),
  bank_name: z.string().optional().default(""),
  bank_iban: z.string().optional().default(""),
  bank_bic: z.string().optional().default(""),
  courier_guid: z.string().optional().default(""),
  shipping_mode: z.string().default("FRANCO"),
  fiscal_area_code: z.string().optional().default(""),
  sdi_code: z.string().max(7, "Max 7 caratteri").optional().default(""),
  category_code: z.string().optional().default(""),
  default_payment_method_guid: z.string().optional().default(""),
  default_payment_term_guid: z.string().optional().default(""),
});

export type Step1Data = z.infer<typeof step1Schema>;

interface Props {
  defaultValues?: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
  isPending?: boolean;
  error?: string | null;
}

export function NewPartyStepDetails({ defaultValues, onNext, isPending, error }: Props) {
  const { data: partyTypes } = usePartyTypes();
  const { data: fiscalAreas } = useFiscalAreas();
  const { data: partyCategories } = usePartyCategories();
  const { data: paymentMethods } = usePaymentMethods();
  const { data: paymentTerms } = usePaymentTerms();
  const { data: carriersData } = useParties({ type_code: "CARRIER", limit: 200 });
  const carriers = carriersData?.items ?? [];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step1Data>({
    defaultValues: {
      description: "",
      vat_number: "",
      type_code: "",
      bank_name: "",
      bank_iban: "",
      bank_bic: "",
      courier_guid: "",
      shipping_mode: "FRANCO",
      fiscal_area_code: "",
      sdi_code: "",
      category_code: "",
      default_payment_method_guid: "",
      default_payment_term_guid: "",
      ...defaultValues,
    },
  });

  const courierGuid = watch("courier_guid");

  useEffect(() => {
    if (courierGuid && courierGuid !== "") {
      setValue("shipping_mode", "ASSEGNATO");
    }
  }, [courierGuid, setValue]);

  const onSubmit = (values: Step1Data) => {
    const parsed = step1Schema.safeParse(values);
    if (!parsed.success) return;
    onNext(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Dati Anagrafica */}
      <Card>
        <CardHeader>
          <h2 className="text-[15px] font-semibold">Dati Anagrafica</h2>
          <p className="text-[13px] text-muted-foreground">
            Informazioni principali dell'anagrafica.
          </p>
        </CardHeader>
        <CardContent>
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
                      {partyTypes.map((t) => (
                        <SelectItem key={t.code} value={t.code}>
                          {t.description}
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
        </CardContent>
      </Card>

      {/* Dati Bancari */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[15px] font-semibold">Dati Bancari</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Banca</label>
              <Input {...register("bank_name")} placeholder="Nome banca…" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">IBAN</label>
              <Input {...register("bank_iban")} placeholder="IT60X0542811101000000123456" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">BIC/SWIFT</label>
              <Input {...register("bank_bic")} placeholder="BPPIITRRXXX" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spedizione */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[15px] font-semibold">Spedizione</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Vettore</label>
              <Controller
                control={control}
                name="courier_guid"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Porto franco (nessuno)…" />
                    </SelectTrigger>
                    <SelectContent>
                      {carriers.map((c) => (
                        <SelectItem key={c.guid} value={c.guid}>
                          {c.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Modalità</label>
              <Controller
                control={control}
                name="shipping_mode"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIPPING_MODES.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagamento */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[15px] font-semibold">Pagamento</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Metodo di Pagamento</label>
              <Controller
                control={control}
                name="default_payment_method_guid"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
              <label className="text-[13px] font-medium">Condizioni di Pagamento</label>
              <Controller
                control={control}
                name="default_payment_term_guid"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
        </CardContent>
      </Card>

      {/* Dati Fiscali + Classificazione */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[15px] font-semibold">Dati Fiscali & Classificazione</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Area Fiscale</label>
              <Controller
                control={control}
                name="fiscal_area_code"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona…" />
                    </SelectTrigger>
                    <SelectContent>
                      {fiscalAreas.map((fa) => (
                        <SelectItem key={fa.code} value={fa.code}>
                          {fa.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Codice SDI</label>
              <Input
                {...register("sdi_code")}
                placeholder="0000000"
                maxLength={7}
              />
              {errors.sdi_code && (
                <p className="text-[12px] text-destructive">{errors.sdi_code.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Categoria
                </span>
              </label>
              <Controller
                control={control}
                name="category_code"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nessuna…" />
                    </SelectTrigger>
                    <SelectContent>
                      {partyCategories.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
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
  );
}
