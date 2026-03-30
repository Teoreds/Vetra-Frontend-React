import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { ArrowLeft, ArrowRight, Plus, Trash2, Mail, MapPin } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useContactTypes, useLocationTypes } from "@/shared/hooks/use-lookups";
import type { PartyContactsData, ContactDraft, AddressDraft } from "../stores/use-new-party-store";

/* ── Schema ───────────────────────────────────────────── */

const contactSchema = z.object({
  type_code: z.string().min(1, "Seleziona tipo"),
  content: z.string().min(1, "Obbligatorio"),
  label: z.string().optional().default(""),
  is_primary: z.boolean().default(false),
});

const addressSchema = z.object({
  address_line: z.string().min(1, "Obbligatorio"),
  city: z.string().optional().default(""),
  province: z.string().optional().default(""),
  post_code: z.string().optional().default(""),
  type_code: z.string().min(1, "Seleziona un tipo"),
  is_primary: z.boolean().default(false),
});

function buildStep2Schema(typeCode: string) {
  const base = z.object({
    contacts: z.array(contactSchema),
    addresses: z.array(addressSchema).min(1, "Aggiungi almeno un indirizzo"),
  });

  if (typeCode === "CARRIER") {
    // I corrieri non necessitano di indirizzi di spedizione/fatturazione
    return base;
  }

  return base
    .refine(
      (d) => d.addresses.some((a) => a.type_code === "SHIPPING"),
      { message: "Serve almeno un indirizzo di Spedizione", path: ["addresses"] },
    )
    .refine(
      (d) => d.addresses.some((a) => a.type_code === "BILLING"),
      { message: "Serve almeno un indirizzo di Fatturazione", path: ["addresses"] },
    );
}

/* ── Empty rows ───────────────────────────────────────── */

const EMPTY_CONTACT: ContactDraft = { type_code: "", content: "", label: "", is_primary: false };
const EMPTY_ADDRESS: AddressDraft = { address_line: "", city: "", province: "", post_code: "", type_code: "", is_primary: false };

/* ── Checkbox helper ──────────────────────────────────── */

function InlineCheckbox({ checked, onCheckedChange, label }: { checked: boolean; onCheckedChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(!!v)} />
      <span className="text-[13px] font-medium">{label}</span>
    </label>
  );
}

/* ── Props ────────────────────────────────────────────── */

interface Props {
  typeCode: string;
  defaultValues?: Partial<PartyContactsData>;
  onNext: (data: PartyContactsData) => void;
  onBack: (draft: PartyContactsData) => void;
  error?: string | null;
}

/* ── Component ────────────────────────────────────────── */

export function NewPartyStepContacts({ typeCode, defaultValues, onNext, onBack, error }: Props) {
  const { data: contactTypes } = useContactTypes();
  const { data: locationTypes } = useLocationTypes();

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<PartyContactsData>({
    resolver: zodResolver(buildStep2Schema(typeCode)),
    defaultValues: {
      contacts: defaultValues?.contacts ?? [],
      addresses: defaultValues?.addresses?.length ? defaultValues.addresses : [EMPTY_ADDRESS],
    },
  });

  const contactFields = useFieldArray({ control, name: "contacts" });
  const addressFields = useFieldArray({ control, name: "addresses" });

  const addressRootError =
    (errors.addresses as { root?: { message?: string } } | undefined)?.root?.message ||
    (errors as Record<string, { message?: string }>).addresses?.message;

  const onSubmit = (values: PartyContactsData) => {
    onNext({
      contacts: values.contacts.filter((c) => c.content !== ""),
      addresses: values.addresses,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* ── Contatti ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <h2 className="text-[15px] font-semibold">Contatti</h2>
                <p className="text-[13px] text-muted-foreground">
                  Email, telefono, PEC o altri recapiti.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => contactFields.append(EMPTY_CONTACT)}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Aggiungi
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {contactFields.fields.length === 0 && (
            <p className="text-[13px] text-muted-foreground py-4 text-center rounded-lg border border-dashed border-border/60">
              Nessun contatto aggiunto. Puoi aggiungerli anche dopo.
            </p>
          )}
          {contactFields.fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-end gap-3 rounded-lg border border-border/60 bg-muted/20 p-3"
            >
              <div className="w-36 flex flex-col gap-1">
                <label className="text-[13px] font-medium">Tipo *</label>
                <Controller
                  control={control}
                  name={`contacts.${index}.type_code`}
                  render={({ field: f }) => (
                    <Select value={f.value} onValueChange={f.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo…" />
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
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[13px] font-medium">Valore *</label>
                <Input
                  {...register(`contacts.${index}.content`)}
                  placeholder="es. info@azienda.it"
                />
              </div>
              <div className="w-32 flex flex-col gap-1">
                <label className="text-[13px] font-medium">Etichetta</label>
                <Input
                  {...register(`contacts.${index}.label`)}
                  placeholder="Ufficio"
                />
              </div>
              <div className="flex items-center pb-1">
                <Controller
                  control={control}
                  name={`contacts.${index}.is_primary`}
                  render={({ field: f }) => (
                    <InlineCheckbox checked={f.value} onCheckedChange={f.onChange} label="Primario" />
                  )}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => contactFields.remove(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Indirizzi ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <h2 className="text-[15px] font-semibold">Indirizzi</h2>
                <p className="text-[13px] text-muted-foreground">
                  Almeno un indirizzo di spedizione e uno di fatturazione.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addressFields.append(EMPTY_ADDRESS)}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Aggiungi
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {addressFields.fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-muted-foreground">
                  Indirizzo #{index + 1}
                </span>
                {addressFields.fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => addressFields.remove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[13px] font-medium">Indirizzo *</label>
                  <Input
                    {...register(`addresses.${index}.address_line`)}
                    placeholder="Via Roma 1"
                    error={!!errors.addresses?.[index]?.address_line}
                  />
                  {errors.addresses?.[index]?.address_line && (
                    <p className="text-[11px] text-destructive">{errors.addresses[index].address_line.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[13px] font-medium">Città</label>
                  <Input {...register(`addresses.${index}.city`)} placeholder="Milano" />
                </div>
                <div className="space-y-1">
                  <label className="text-[13px] font-medium">Provincia</label>
                  <Input {...register(`addresses.${index}.province`)} placeholder="MI" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[13px] font-medium">CAP</label>
                  <Input {...register(`addresses.${index}.post_code`)} placeholder="20100" />
                </div>
                <div className="space-y-1">
                  <label className="text-[13px] font-medium">Tipo *</label>
                  <Controller
                    control={control}
                    name={`addresses.${index}.type_code`}
                    render={({ field: f }) => (
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo…" />
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
                  {errors.addresses?.[index]?.type_code && (
                    <p className="text-[11px] text-destructive">{errors.addresses[index].type_code.message}</p>
                  )}
                </div>
                <div className="flex items-end pb-1">
                  <Controller
                    control={control}
                    name={`addresses.${index}.is_primary`}
                    render={({ field: f }) => (
                      <InlineCheckbox checked={f.value} onCheckedChange={f.onChange} label="Primario" />
                    )}
                  />
                </div>
              </div>
            </div>
          ))}

          {addressRootError && (
            <p className="text-[11px] text-destructive">{addressRootError}</p>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-[13px] text-destructive">{error}</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => onBack(getValues())}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Indietro
        </Button>
        <Button type="submit">
          Avanti
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
