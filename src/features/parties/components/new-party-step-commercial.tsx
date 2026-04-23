import { useEffect } from "react";
import { useForm, useFieldArray, Controller, type Resolver } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CreditCard,
  Percent,
  Plus,
  Package,
  Trash2,
  Truck,
} from "lucide-react";
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
import { usePaymentMethods, usePaymentTerms } from "@/shared/hooks/use-lookups";
import { useArticleTypes } from "@/features/articles/hooks/use-article-lookups";
import { useArticles } from "@/features/articles/hooks/use-articles";
import { useParties } from "../hooks/use-parties";
import type {
  PartyCommercialData,
  DiscountDraft,
  SupplierArticleDraft,
} from "../stores/use-new-party-store";

/* ── Shipping modes ───────────────────────────────────── */

const SHIPPING_MODES = [
  { value: "FRANCO", label: "Franco" },
  { value: "ASSEGNATO", label: "Assegnato" },
] as const;

/* ── Schema ───────────────────────────────────────────── */

const step3Schema = z.object({
  default_payment_method_guid: z.string().optional().default(""),
  default_payment_term_guid: z.string().optional().default(""),
  bank_name: z.string().optional().default(""),
  bank_iban: z.string().optional().default(""),
  bank_bic: z.string().optional().default(""),
  courier_guid: z.string().optional().default(""),
  shipping_mode: z.string().default("FRANCO"),
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
});

/* ── Empty rows ───────────────────────────────────────── */

const EMPTY_DISCOUNT: DiscountDraft = { article_type_code: "", discount_percent: "" };
const EMPTY_SUPPLIER_ARTICLE: SupplierArticleDraft = {
  article_guid: "",
  supplier_code: "",
  purchase_price: "",
  is_preferred: false,
};

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
  defaultValues?: Partial<PartyCommercialData>;
  onNext: (data: PartyCommercialData) => void;
  onBack: (draft: PartyCommercialData) => void;
  error?: string | null;
}

/* ── Component ────────────────────────────────────────── */

export function NewPartyStepCommercial({ typeCode, defaultValues, onNext, onBack, error }: Props) {
  const isCustomer = typeCode === "CUSTOMER";
  const isSupplier = typeCode === "SUPPLIER";
  const isCarrier = typeCode === "CARRIER";

  const { data: paymentMethods } = usePaymentMethods();
  const { data: paymentTerms } = usePaymentTerms();
  const { data: carriersData } = useParties({ type_code: "CARRIER", limit: 200 });
  const carriers = carriersData?.items ?? [];
  const { data: articleTypes } = useArticleTypes();
  const { data: articlesData } = useArticles(isSupplier ? { limit: 500 } : undefined);
  const articles = articlesData?.items ?? [];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
  } = useForm<PartyCommercialData>({
    resolver: zodResolver(step3Schema) as unknown as Resolver<PartyCommercialData>,
    defaultValues: {
      default_payment_method_guid: "",
      default_payment_term_guid: "",
      bank_name: "",
      bank_iban: "",
      bank_bic: "",
      courier_guid: "",
      shipping_mode: "FRANCO",
      discounts: [],
      supplier_articles: [],
      ...defaultValues,
    },
  });

  const courierGuid = watch("courier_guid");
  useEffect(() => {
    if (courierGuid && courierGuid !== "") {
      setValue("shipping_mode", "ASSEGNATO");
    }
  }, [courierGuid, setValue]);

  const discountFields = useFieldArray({ control, name: "discounts" });
  const supplierFields = useFieldArray({ control, name: "supplier_articles" });

  const onSubmit = (values: PartyCommercialData) => {
    onNext({
      ...values,
      discounts: values.discounts.filter((d) => d.discount_percent !== ""),
      supplier_articles: values.supplier_articles.filter((a) => a.article_guid !== ""),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* ── Pagamento ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <h2 className="text-[15px] font-semibold">Pagamento</h2>
              <p className="text-[13px] text-muted-foreground">
                Metodo e condizioni di pagamento predefiniti.
              </p>
            </div>
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

      {/* ── Dati Bancari ─────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <h2 className="text-[15px] font-semibold">Dati Bancari</h2>
              <p className="text-[13px] text-muted-foreground">
                Coordinate bancarie per fatturazione e bonifici.
              </p>
            </div>
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

      {/* ── Spedizione (non pertinente per corrieri) ── */}
      {!isCarrier && <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <div>
              <h2 className="text-[15px] font-semibold">Spedizione</h2>
              <p className="text-[13px] text-muted-foreground">
                Vettore e modalità di spedizione predefiniti.
              </p>
            </div>
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
      </Card>}

      {/* ── Sconti (CUSTOMER only) ───────────────────── */}
      {isCustomer && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h2 className="text-[15px] font-semibold">Sconti Cliente</h2>
                  <p className="text-[13px] text-muted-foreground">
                    Sconti per tipo articolo (opzionale).
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => discountFields.append(EMPTY_DISCOUNT)}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Aggiungi
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {discountFields.fields.length === 0 && (
              <p className="text-[13px] text-muted-foreground py-4 text-center rounded-lg border border-dashed border-border/60">
                Nessuno sconto aggiunto.
              </p>
            )}
            {discountFields.fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-end gap-3 rounded-lg border border-border/60 bg-muted/20 p-3"
              >
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[13px] font-medium">Tipo Articolo</label>
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
                <div className="w-36 flex flex-col gap-1">
                  <label className="text-[13px] font-medium">Sconto % *</label>
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
          </CardContent>
        </Card>
      )}

      {/* ── Articoli Forniti (SUPPLIER only) ──────────── */}
      {isSupplier && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h2 className="text-[15px] font-semibold">Articoli Forniti</h2>
                  <p className="text-[13px] text-muted-foreground">
                    Associa gli articoli forniti (opzionale).
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => supplierFields.append(EMPTY_SUPPLIER_ARTICLE)}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Aggiungi
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {supplierFields.fields.length === 0 && (
              <p className="text-[13px] text-muted-foreground py-4 text-center rounded-lg border border-dashed border-border/60">
                Nessun articolo aggiunto.
              </p>
            )}
            {supplierFields.fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-end gap-3 rounded-lg border border-border/60 bg-muted/20 p-3"
              >
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[13px] font-medium">Articolo *</label>
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
                <div className="w-32 flex flex-col gap-1">
                  <label className="text-[13px] font-medium">Cod. Fornitore</label>
                  <Input
                    {...register(`supplier_articles.${index}.supplier_code`)}
                    placeholder="ABC-123"
                  />
                </div>
                <div className="w-28 flex flex-col gap-1">
                  <label className="text-[13px] font-medium">Pr. Acquisto</label>
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
                      <InlineCheckbox checked={f.value} onCheckedChange={f.onChange} label="Preferito" />
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
