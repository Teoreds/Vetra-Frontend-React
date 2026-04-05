import { useRef, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod/v4";
import {
  Loader2,
  Plus,
  Trash2,
  ImagePlus,
} from "lucide-react";
import { BackButton } from "@/shared/ui/back-button";
import { useBack } from "@/shared/hooks/use-back";
import { Checkbox } from "@/shared/ui/checkbox";
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
import { SearchableSelect } from "@/shared/ui/searchable-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { CurrencySelector } from "@/shared/ui/currency-selector";
import { useCurrencyRates, toEur, type Currency } from "@/shared/hooks/use-currency-rates";
import { useUnitOfMeasures, useArticleTypes } from "../hooks/use-article-lookups";
import { PartySearchSelect } from "@/features/parties/components/party-search-select";
import { articlesApi } from "../api/articles.api";
import { articleKeys } from "../api/articles.queries";
import { AuthImage } from "@/shared/ui/auth-image";

const supplierSchema = z.object({
  party_guid: z.string().min(1, "Seleziona un fornitore"),
  supplier_code: z.string().optional().default(""),
  purchase_price: z.coerce.number().min(0).optional(),
  is_preferred: z.boolean().default(false),
  _isNew: z.boolean().default(false),
});

const editSchema = z.object({
  description: z.string().min(1, "La descrizione è obbligatoria"),
  unit_of_measure_code: z.string().min(1, "Seleziona un'unità di misura"),
  type_code: z.string().optional().default(""),
  is_active: z.boolean().default(true),
  list_price: z.coerce.number().min(0).optional().nullable(),
  suppliers: z.array(supplierSchema).default([]),
});

type EditForm = z.infer<typeof editSchema>;

export function ArticleEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const back = useBack();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const { data: rates } = useCurrencyRates();
  const [saving, setSaving] = useState(false);

  const { data: unitOfMeasures = [] } = useUnitOfMeasures();
  const { data: articleTypes = [] } = useArticleTypes();

  // Load article
  const { data: articles, isLoading } = useQuery({
    queryKey: articleKeys.detail(id!),
    queryFn: async () => {
      const { data, error } = await articlesApi.list({ search: id, limit: 1 });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
  const article = articles?.items?.[0];

  // Load suppliers
  const { data: suppliersData } = useQuery({
    queryKey: articleKeys.suppliers(article?.guid ?? ""),
    queryFn: async () => {
      const { data, error } = await articlesApi.listSuppliers(article!.guid);
      if (error) throw error;
      return data;
    },
    enabled: !!article?.guid,
  });

  // Image mutations
  const uploadImage = useMutation({
    mutationFn: (file: File) => articlesApi.uploadImage(article!.guid, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(id!) });
    },
  });

  const deleteImage = useMutation({
    mutationFn: () =>
      articlesApi.deleteImage(article!.guid).then(({ error }) => {
        if (error) throw error;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(id!) });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage.mutate(file);
    e.target.value = "";
  };

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<EditForm>({
    values: article && suppliersData
      ? {
          description: article.description,
          unit_of_measure_code: article.unit_of_measure_code,
          type_code: article.type_code ?? "",
          is_active: article.is_active,
          list_price: article.list_price ? Number(article.list_price) : null,
          suppliers: suppliersData.map((s) => ({
            party_guid: s.party_guid,
            supplier_code: s.supplier_code ?? "",
            purchase_price: s.purchase_price ? Number(s.purchase_price) : undefined,
            is_preferred: s.is_preferred,
            _isNew: false,
          })),
        }
      : undefined,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "suppliers",
  });

  function handleCurrencyChange(newCurrency: Currency) {
    if (rates) {
      const current = getValues("list_price") ?? 0;
      const inEur = toEur(current, rates, currency);
      setValue("list_price", parseFloat((inEur * rates[newCurrency]).toFixed(2)));
    }
    setCurrency(newCurrency);
  }

  if (isLoading || !article) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
      </div>
    );
  }

  const isBusy = uploadImage.isPending || deleteImage.isPending;

  const onSubmit = async (values: EditForm) => {
    const parsed = editSchema.safeParse(values);
    if (!parsed.success) return;

    setSaving(true);
    try {
      const { suppliers, ...articleData } = parsed.data;
      const listPriceEur =
        articleData.list_price != null && rates
          ? parseFloat(toEur(articleData.list_price, rates, currency).toFixed(2))
          : (articleData.list_price ?? null);

      // 1. Update article
      await articlesApi.update(article.guid, {
        description: articleData.description,
        unit_of_measure_code: articleData.unit_of_measure_code,
        is_active: articleData.is_active,
        type_code: articleData.type_code || null,
        list_price: listPriceEur != null ? String(listPriceEur) : null,
      });

      // 2. Sync suppliers
      const originalGuids = new Set((suppliersData ?? []).map((s) => s.party_guid));
      const currentGuids = new Set(suppliers.map((s) => s.party_guid));

      // Remove deleted
      for (const guid of originalGuids) {
        if (!currentGuids.has(guid)) {
          await articlesApi.removeSupplier(article.guid, guid);
        }
      }

      // Add new / update existing
      for (const s of suppliers) {
        if (originalGuids.has(s.party_guid)) {
          await articlesApi.updateSupplier(article.guid, s.party_guid, {
            supplier_code: s.supplier_code || null,
            purchase_price: s.purchase_price ?? null,
            is_preferred: s.is_preferred,
          });
        } else {
          await articlesApi.addSupplier(article.guid, {
            party_guid: s.party_guid,
            supplier_code: s.supplier_code || null,
            purchase_price: s.purchase_price ?? null,
            is_preferred: s.is_preferred,
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: articleKeys.detail(id!) });
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      navigate(`/articles/${article.code}`);
    } finally {
      setSaving(false);
    }
  };

  const th = "px-3 h-8";
  const td = "px-3 py-1.5";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mx-auto max-w-2xl flex items-center gap-3">
        <BackButton fallback={`/articles/${id}`} />

        {/* Avatar */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <div className="group/avatar relative h-11 w-11 shrink-0">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
            className="relative h-full w-full overflow-hidden rounded-xl border border-border/60 bg-muted/50 transition-colors hover:border-primary/40"
          >
            <AuthImage
              src={article.image_path ? `/articles/${article.guid}/image` : null}
              alt={article.description}
              className="h-full w-full"
              fallbackClassName="h-full w-full"
            />
            {isBusy ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/avatar:bg-black/40">
                <ImagePlus className="h-3.5 w-3.5 text-white opacity-0 transition-opacity group-hover/avatar:opacity-100" />
              </div>
            )}
          </button>
          {article.image_path && !isBusy && (
            <button
              type="button"
              onClick={() => deleteImage.mutate()}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 shadow-sm transition-opacity group-hover/avatar:opacity-100"
              title="Rimuovi foto"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          )}
        </div>

        <div>
          <h1 className="text-xl font-semibold">Modifica Articolo</h1>
          <p className="text-[13px] text-muted-foreground">{article.code} — {article.description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6">
        {/* Article data card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold">Dati Articolo</h2>
                <p className="text-[13px] text-muted-foreground">Modifica le informazioni dell'articolo.</p>
              </div>
              <div className="flex items-center gap-2.5">
                <label className="text-[13px] font-medium text-muted-foreground">Attivo</label>
                <Controller
                  control={control}
                  name="is_active"
                  render={({ field }) => (
                    <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
                  )}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Codice (readonly) + Descrizione */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Codice</label>
                <Input value={article.code} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Descrizione</label>
                <Input {...register("description")} error={!!errors.description} />
                {errors.description && (
                  <p className="text-[11px] text-destructive">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* UdM + Tipo + Prezzo */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Unità di Misura</label>
                <Controller
                  control={control}
                  name="unit_of_measure_code"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="UdM…" />
                      </SelectTrigger>
                      <SelectContent>
                        {unitOfMeasures.map((uom) => (
                          <SelectItem key={uom.code} value={uom.code}>
                            {uom.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unit_of_measure_code && (
                  <p className="text-[11px] text-destructive">{errors.unit_of_measure_code.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">
                  Tipo
                  <span className="ml-1 font-normal text-muted-foreground">(opz.)</span>
                </label>
                <Controller
                  control={control}
                  name="type_code"
                  render={({ field }) => (
                    <SearchableSelect
                      items={articleTypes.map((t) => ({ value: t.code, label: t.description }))}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Cerca tipo…"
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">
                  Prezzo
                  <span className="ml-1 font-normal text-muted-foreground">(opz.)</span>
                </label>
                <div className="flex">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("list_price", { valueAsNumber: true })}
                    placeholder="0.00"
                    className="rounded-r-none"
                  />
                  <CurrencySelector
                    value={currency}
                    onChange={handleCurrencyChange}
                    className="rounded-l-none border-l-0"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold">Fornitori</h2>
                <p className="text-[13px] text-muted-foreground">Gestisci i fornitori dell'articolo.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    party_guid: "",
                    supplier_code: "",
                    purchase_price: undefined,
                    is_preferred: false,
                    _isNew: true,
                  })
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Aggiungi
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-6 text-center text-[13px] text-muted-foreground">
                Nessun fornitore associato.
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={th}>Fornitore</TableHead>
                      <TableHead className={th}>Codice Fornitore</TableHead>
                      <TableHead className={th}>Prezzo Acquisto</TableHead>
                      <TableHead className={th}>Preferito</TableHead>
                      <TableHead className={`${th} w-10`} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell className={td}>
                          <Controller
                            control={control}
                            name={`suppliers.${index}.party_guid`}
                            render={({ field: f }) => (
                              <PartySearchSelect value={f.value} onChange={f.onChange} />
                            )}
                          />
                          {errors.suppliers?.[index]?.party_guid && (
                            <p className="mt-0.5 text-[11px] text-destructive">
                              {errors.suppliers[index].party_guid.message}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className={td}>
                          <Input
                            {...register(`suppliers.${index}.supplier_code`)}
                            placeholder="—"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell className={td}>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register(`suppliers.${index}.purchase_price`, { valueAsNumber: true })}
                            placeholder="0.00"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell className={td}>
                          <div className="flex justify-center">
                            <Controller
                              control={control}
                              name={`suppliers.${index}.is_preferred`}
                              render={({ field: f }) => (
                                <Checkbox checked={f.value} onCheckedChange={(checked) => f.onChange(!!checked)} />
                              )}
                            />
                          </div>
                        </TableCell>
                        <TableCell className={td}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => back(`/articles/${id}`)}>
            Annulla
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Salvataggio…
              </>
            ) : (
              "Salva Modifiche"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
