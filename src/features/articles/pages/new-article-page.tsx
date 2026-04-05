import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { z } from "zod/v4";
import { Loader2, Plus, Trash2, ImagePlus, Package } from "lucide-react";
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
import { useCreateArticle } from "../hooks/use-create-article";
import { useUnitOfMeasures, useArticleTypes } from "../hooks/use-article-lookups";
import { PartySearchSelect } from "@/features/parties/components/party-search-select";
import { articlesApi } from "../api/articles.api";
import { useNewArticleStore } from "../stores/use-new-article-store";
import { CurrencySelector } from "@/shared/ui/currency-selector";
import { useCurrencyRates, toEur, type Currency } from "@/shared/hooks/use-currency-rates";

const supplierSchema = z.object({
  party_guid: z.string().min(1, "Seleziona un fornitore"),
  supplier_code: z.string().optional(),
  purchase_price: z.coerce.number().min(0).optional(),
  is_preferred: z.boolean().default(false),
});

const newArticleSchema = z.object({
  code: z.string().min(1, "Il codice è obbligatorio"),
  description: z.string().min(1, "La descrizione è obbligatoria"),
  unit_of_measure_code: z.string().min(1, "Seleziona un'unità di misura"),
  type_code: z.string().optional(),
  is_active: z.boolean().default(true),
  list_price: z.coerce.number().min(0).optional().nullable(),
  suppliers: z.array(supplierSchema).default([]),
});

type NewArticleForm = z.infer<typeof newArticleSchema>;

export function NewArticlePage() {
  const navigate = useNavigate();
  const back = useBack();
  const createArticle = useCreateArticle();
  const { data: unitOfMeasures = [] } = useUnitOfMeasures();
  const { data: articleTypes = [] } = useArticleTypes();
  const store = useNewArticleStore();
  const [currency, setCurrency] = useState<Currency>("EUR");
  const { data: rates } = useCurrencyRates();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<NewArticleForm>({
    resolver: zodResolver(newArticleSchema),
    defaultValues: store.draft ?? {
      code: "",
      description: "",
      unit_of_measure_code: "",
      type_code: "",
      is_active: true,
      list_price: null,
      suppliers: [],
    },
  });

  useEffect(() => {
    const { unsubscribe } = watch((values) => {
      useNewArticleStore.getState().setDraft(values);
    });
    return unsubscribe;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCurrencyChange(newCurrency: Currency) {
    if (rates) {
      const current = getValues("list_price") ?? 0;
      const inEur = toEur(current, rates, currency);
      setValue("list_price", parseFloat((inEur * rates[newCurrency]).toFixed(2)));
    }
    setCurrency(newCurrency);
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
    e.target.value = "";
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
  }

  const { fields, append, remove } = useFieldArray({
    control,
    name: "suppliers",
  });

  const onSubmit = async (values: NewArticleForm) => {
    const { suppliers, type_code, list_price, ...articleData } = values;
    const listPriceEur =
      list_price != null && rates
        ? parseFloat(toEur(list_price, rates, currency).toFixed(2))
        : (list_price ?? null);
    const body = {
      ...articleData,
      type_code: type_code || null,
      list_price: listPriceEur != null ? String(listPriceEur) : null,
    };

    const article = await createArticle.mutateAsync(body);
    if (!article?.guid) return;

    for (const supplier of suppliers) {
      await articlesApi.addSupplier(article.guid, {
        party_guid: supplier.party_guid,
        supplier_code: supplier.supplier_code || null,
        purchase_price: supplier.purchase_price ?? null,
        is_preferred: supplier.is_preferred,
      });
    }

    if (imageFile) {
      await articlesApi.uploadImage(article.guid, imageFile);
    }

    store.clear();
    navigate(`/articles/${article.code}`);
  };

  const th = "px-3 h-8";
  const td = "px-3 py-1.5";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mx-auto max-w-2xl flex items-center gap-3">
        <BackButton fallback="/articles" />
        <div>
          <h1 className="text-xl font-semibold">Nuovo Articolo</h1>
          <p className="text-[13px] text-muted-foreground">
            Compila i campi per creare un nuovo articolo.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6">
        {/* Article data card with avatar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold">Dati Articolo</h2>
                <p className="text-[13px] text-muted-foreground">
                  Informazioni principali dell'articolo.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <label className="text-[13px] font-medium text-muted-foreground">Attivo</label>
                <Controller
                  control={control}
                  name="is_active"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                    />
                  )}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex gap-5">
              {/* Avatar */}
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => imageInputRef.current?.click()}
                className="group/avatar relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/50 transition-colors hover:border-primary/40"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Anteprima" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-7 w-7 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/avatar:bg-black/40">
                  <ImagePlus className="h-5 w-5 text-white opacity-0 transition-opacity group-hover/avatar:opacity-100" />
                </div>
              </button>

              {/* Codice + Descrizione */}
              <div className="flex flex-1 flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium">Codice</label>
                    <Input
                      {...register("code")}
                      placeholder="es. ART001"
                      error={!!errors.code}
                    />
                    {errors.code && (
                      <p className="text-[11px] text-destructive">{errors.code.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium">Descrizione</label>
                    <Input
                      {...register("description")}
                      placeholder="Descrizione articolo"
                      error={!!errors.description}
                    />
                    {errors.description && (
                      <p className="text-[11px] text-destructive">{errors.description.message}</p>
                    )}
                  </div>
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={clearImage}
                    className="self-start text-[11px] text-muted-foreground hover:text-destructive"
                  >
                    Rimuovi immagine
                  </button>
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
                  <p className="text-[11px] text-destructive">
                    {errors.unit_of_measure_code.message}
                  </p>
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
                <p className="text-[13px] text-muted-foreground">
                  Associa uno o più fornitori all'articolo.
                </p>
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
                Nessun fornitore aggiunto. Puoi aggiungerli dopo la creazione.
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
                              <PartySearchSelect
                                value={f.value}
                                onChange={f.onChange}
                              />
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
                            {...register(`suppliers.${index}.purchase_price`, {
                              valueAsNumber: true,
                            })}
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
                                <Checkbox
                                  checked={f.value}
                                  onCheckedChange={(checked) => f.onChange(!!checked)}
                                />
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

        {/* Error banner */}
        {createArticle.isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
            <p className="text-[13px] text-destructive">
              Impossibile creare l'articolo. Riprova.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => { store.clear(); back("/articles"); }}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={createArticle.isPending}>
            {createArticle.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Creazione…
              </>
            ) : (
              "Crea Articolo"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
