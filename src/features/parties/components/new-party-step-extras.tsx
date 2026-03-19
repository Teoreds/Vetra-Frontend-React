import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { CheckboxDisplay } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useArticleTypes } from "@/features/articles/hooks/use-article-lookups";
import { useArticles } from "@/features/articles/hooks/use-articles";
import { useContactTypes, useLocationTypes } from "@/shared/hooks/use-lookups";

/* ── Drafts ───────────────────────────────────────────── */

export interface ContactDraft {
  type_code: string;
  content: string;
  label: string;
  is_primary: boolean;
}

export interface AddressDraft {
  address_line: string;
  city: string;
  province: string;
  post_code: string;
  type_code: string;
  is_primary: boolean;
}

export interface DiscountDraft {
  article_type_code: string;
  discount_percent: string;
}

export interface SupplierArticleDraft {
  article_guid: string;
  supplier_code: string;
  purchase_price: string;
  is_preferred: boolean;
}

/* ── Schema ───────────────────────────────────────────── */

const addressSchema = z.object({
  address_line: z.string().min(1, "Obbligatorio"),
  city: z.string().optional().default(""),
  province: z.string().optional().default(""),
  post_code: z.string().optional().default(""),
  type_code: z.string().min(1, "Seleziona un tipo"),
  is_primary: z.boolean().default(false),
});

const step2Schema = z
  .object({
    contacts: z.array(
      z.object({
        type_code: z.string().min(1, "Seleziona tipo"),
        content: z.string().min(1, "Obbligatorio"),
        label: z.string().optional().default(""),
        is_primary: z.boolean().default(false),
      }),
    ),
    addresses: z.array(addressSchema).min(1, "Aggiungi almeno un indirizzo"),
    discounts: z.array(
      z.object({
        article_type_code: z.string().optional().default(""),
        discount_percent: z.string(),
      }),
    ),
    supplier_articles: z.array(
      z.object({
        article_guid: z.string(),
        supplier_code: z.string().optional().default(""),
        purchase_price: z.string().optional().default(""),
        is_preferred: z.boolean().default(false),
      }),
    ),
  })
  .refine(
    (d) => d.addresses.some((a) => a.type_code === "SHIPPING"),
    { message: "Serve almeno un indirizzo di Spedizione", path: ["addresses"] },
  )
  .refine(
    (d) => d.addresses.some((a) => a.type_code === "BILLING"),
    { message: "Serve almeno un indirizzo di Fatturazione", path: ["addresses"] },
  );

/* ── Form values ──────────────────────────────────────── */

interface FormValues {
  contacts: ContactDraft[];
  addresses: AddressDraft[];
  discounts: DiscountDraft[];
  supplier_articles: SupplierArticleDraft[];
}

export type Step2Data = {
  contacts: ContactDraft[];
  addresses: AddressDraft[];
  discounts: DiscountDraft[];
  supplier_articles: SupplierArticleDraft[];
};

/* ── Props ────────────────────────────────────────────── */

interface Props {
  typeCode: string;
  defaultValues?: Partial<Step2Data>;
  onSubmit: (data: Step2Data) => void;
  onBack: (draft: Step2Data) => void;
  isPending?: boolean;
  error?: string | null;
}

/* ── Empty rows ───────────────────────────────────────── */

const EMPTY_CONTACT: ContactDraft = {
  type_code: "",
  content: "",
  label: "",
  is_primary: false,
};

const EMPTY_ADDRESS: AddressDraft = {
  address_line: "",
  city: "",
  province: "",
  post_code: "",
  type_code: "",
  is_primary: false,
};

const EMPTY_DISCOUNT: DiscountDraft = {
  article_type_code: "",
  discount_percent: "",
};

const EMPTY_SUPPLIER_ARTICLE: SupplierArticleDraft = {
  article_guid: "",
  supplier_code: "",
  purchase_price: "",
  is_preferred: false,
};

/* ── Checkbox helper ──────────────────────────────────── */

function InlineCheckbox({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => onCheckedChange(!checked)}
    >
      <CheckboxDisplay checked={checked} />
      <span className="text-[12px] font-medium">{label}</span>
    </div>
  );
}

/* ── Component ────────────────────────────────────────── */

export function NewPartyStepExtras({
  typeCode,
  defaultValues,
  onSubmit,
  onBack,
  isPending,
  error,
}: Props) {
  const isCustomer = typeCode === "CUSTOMER";
  const isSupplier = typeCode === "SUPPLIER";

  const { data: contactTypes } = useContactTypes();
  const { data: locationTypes } = useLocationTypes();
  const { data: articleTypes } = useArticleTypes();
  const { data: articlesData } = useArticles(isSupplier ? { limit: 500 } : undefined);
  const articles = articlesData?.items ?? [];

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      contacts: defaultValues?.contacts ?? [],
      addresses: defaultValues?.addresses?.length ? defaultValues.addresses : [EMPTY_ADDRESS],
      discounts: defaultValues?.discounts ?? [],
      supplier_articles: defaultValues?.supplier_articles ?? [],
    },
  });

  const contactFields = useFieldArray({ control, name: "contacts" });
  const addressFields = useFieldArray({ control, name: "addresses" });
  const discountFields = useFieldArray({ control, name: "discounts" });
  const supplierFields = useFieldArray({ control, name: "supplier_articles" });

  const submit = (values: FormValues) => {
    onSubmit({
      contacts: values.contacts.filter((c) => c.content !== ""),
      addresses: values.addresses,
      discounts: values.discounts.filter((d) => d.discount_percent !== ""),
      supplier_articles: values.supplier_articles.filter((a) => a.article_guid !== ""),
    });
  };

  const addressRootError =
    (errors.addresses as { root?: { message?: string } } | undefined)?.root?.message ||
    (errors as Record<string, { message?: string }>).addresses?.message;

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {/* ── Contatti ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold">Contatti</h2>
              <p className="text-[13px] text-muted-foreground">
                Aggiungi email, telefono o PEC.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => contactFields.append(EMPTY_CONTACT)}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Aggiungi contatto
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {contactFields.fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-end gap-3 rounded-lg border border-border/60 bg-muted/20 p-3"
            >
              <div className="w-36 space-y-1">
                <label className="text-[12px] font-medium">Tipo *</label>
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

              <div className="flex-1 space-y-1">
                <label className="text-[12px] font-medium">Valore *</label>
                <Input
                  {...register(`contacts.${index}.content`)}
                  placeholder="es. info@azienda.it"
                />
              </div>

              <div className="w-32 space-y-1">
                <label className="text-[12px] font-medium">Etichetta</label>
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
                    <InlineCheckbox
                      checked={f.value}
                      onCheckedChange={f.onChange}
                      label="Primario"
                    />
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

          {contactFields.fields.length === 0 && (
            <p className="text-[13px] text-muted-foreground py-4 text-center">
              Nessun contatto aggiunto.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Indirizzi ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold">Indirizzi</h2>
              <p className="text-[13px] text-muted-foreground">
                Almeno un indirizzo di spedizione e uno di fatturazione.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addressFields.append(EMPTY_ADDRESS)}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Aggiungi indirizzo
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
                  <label className="text-[12px] font-medium">Indirizzo *</label>
                  <Input
                    {...register(`addresses.${index}.address_line`)}
                    placeholder="Via Roma 1"
                    error={!!errors.addresses?.[index]?.address_line}
                  />
                  {errors.addresses?.[index]?.address_line && (
                    <p className="text-[12px] text-destructive">{errors.addresses[index].address_line.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium">Città</label>
                  <Input
                    {...register(`addresses.${index}.city`)}
                    placeholder="Milano"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium">Provincia</label>
                  <Input
                    {...register(`addresses.${index}.province`)}
                    placeholder="MI"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-medium">CAP</label>
                  <Input
                    {...register(`addresses.${index}.post_code`)}
                    placeholder="20100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium">Tipo *</label>
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
                    <p className="text-[12px] text-destructive">{errors.addresses[index].type_code.message}</p>
                  )}
                </div>
                <div className="flex items-end pb-1">
                  <Controller
                    control={control}
                    name={`addresses.${index}.is_primary`}
                    render={({ field: f }) => (
                      <InlineCheckbox
                        checked={f.value}
                        onCheckedChange={f.onChange}
                        label="Primario"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          ))}

          {addressRootError && (
            <p className="text-[12px] text-destructive">{addressRootError}</p>
          )}
        </CardContent>
      </Card>

      {/* ── Sconti (CUSTOMER only) ───────────────────── */}
      {isCustomer && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold">Sconti Cliente</h2>
                <p className="text-[13px] text-muted-foreground">
                  Definisci gli sconti per tipo articolo (opzionale).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => discountFields.append(EMPTY_DISCOUNT)}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Aggiungi sconto
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {discountFields.fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-end gap-3 rounded-lg border border-border/60 bg-muted/20 p-3"
              >
                <div className="flex-1 space-y-1">
                  <label className="text-[12px] font-medium">Tipo Articolo</label>
                  <Controller
                    control={control}
                    name={`discounts.${index}.article_type_code`}
                    render={({ field: f }) => (
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tutti i tipi…" />
                        </SelectTrigger>
                        <SelectContent>
                          {(articleTypes ?? []).map((at: { code: string; description: string }) => (
                            <SelectItem key={at.code} value={at.code}>
                              {at.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="w-36 space-y-1">
                  <label className="text-[12px] font-medium">Sconto % *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...register(`discounts.${index}.discount_percent`)}
                    placeholder="10"
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => discountFields.remove(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}

            {discountFields.fields.length === 0 && (
              <p className="text-[13px] text-muted-foreground py-4 text-center">
                Nessuno sconto aggiunto.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Articoli Forniti (SUPPLIER only) ──────────── */}
      {isSupplier && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold">Articoli Forniti</h2>
                <p className="text-[13px] text-muted-foreground">
                  Associa gli articoli forniti (opzionale).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => supplierFields.append(EMPTY_SUPPLIER_ARTICLE)}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Aggiungi articolo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {supplierFields.fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-end gap-3 rounded-lg border border-border/60 bg-muted/20 p-3"
              >
                <div className="flex-1 space-y-1">
                  <label className="text-[12px] font-medium">Articolo *</label>
                  <Controller
                    control={control}
                    name={`supplier_articles.${index}.article_guid`}
                    render={({ field: f }) => (
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona articolo…" />
                        </SelectTrigger>
                        <SelectContent>
                          {articles.map((a) => (
                            <SelectItem key={a.guid} value={a.guid}>
                              {a.code} — {a.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="w-32 space-y-1">
                  <label className="text-[12px] font-medium">Cod. Fornitore</label>
                  <Input
                    {...register(`supplier_articles.${index}.supplier_code`)}
                    placeholder="ABC-123"
                  />
                </div>

                <div className="w-28 space-y-1">
                  <label className="text-[12px] font-medium">Pr. Acquisto</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`supplier_articles.${index}.purchase_price`)}
                    placeholder="0.00"
                  />
                </div>

                <div className="flex items-center pb-1">
                  <Controller
                    control={control}
                    name={`supplier_articles.${index}.is_preferred`}
                    render={({ field: f }) => (
                      <InlineCheckbox
                        checked={f.value}
                        onCheckedChange={f.onChange}
                        label="Preferito"
                      />
                    )}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => supplierFields.remove(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}

            {supplierFields.fields.length === 0 && (
              <p className="text-[13px] text-muted-foreground py-4 text-center">
                Nessun articolo aggiunto.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Footer ───────────────────────────────────── */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-[13px] text-destructive">{error}</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => onBack(getValues())} disabled={isPending}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Indietro
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Creazione…
            </>
          ) : (
            "Crea Anagrafica"
          )}
        </Button>
      </div>
    </form>
  );
}
