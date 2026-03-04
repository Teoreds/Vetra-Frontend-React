import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { z } from "zod/v4";
import { ArrowLeft, Loader2, Plus, Trash2, Check } from "lucide-react";
import * as Checkbox from "@radix-ui/react-checkbox";
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
import { useCreateArticle } from "../hooks/use-create-article";
import { useUnitOfMeasures, useArticleTypes } from "../hooks/use-article-lookups";
import { useParties } from "@/features/parties/hooks/use-parties";
import { articlesApi } from "../api/articles.api";
import { useNewArticleStore } from "../stores/use-new-article-store";
import { CurrencySelector } from "@/shared/ui/currency-selector";
import { useCurrencyRates, toEur, type Currency } from "@/shared/hooks/use-currency-rates";

const supplierSchema = z.object({
  party_guid: z.string().min(1, "Seleziona un fornitore"),
  supplier_code: z.string().optional(),
  list_price: z.coerce.number().min(0).optional(),
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
  const createArticle = useCreateArticle();
  const { data: unitOfMeasures = [] } = useUnitOfMeasures();
  const { data: articleTypes = [] } = useArticleTypes();
  const { data: partiesData } = useParties({ limit: 200 });
  const parties = partiesData?.items ?? [];
  const store = useNewArticleStore();
  const [currency, setCurrency] = useState<Currency>("EUR");
  const { data: rates } = useCurrencyRates();

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

  // Sync form values to store on every change so they survive navigation
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
      list_price: listPriceEur,
    };

    const article = await createArticle.mutateAsync(body);
    if (!article?.guid) return;

    // Add suppliers sequentially
    for (const supplier of suppliers) {
      await articlesApi.addSupplier(article.guid, {
        party_guid: supplier.party_guid,
        supplier_code: supplier.supplier_code || null,
        list_price: supplier.list_price ?? null,
        is_preferred: supplier.is_preferred,
      });
    }

    store.clear();
    navigate(`/articles/${article.code}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate("/articles")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Nuovo Articolo</h1>
          <p className="text-[13px] text-muted-foreground">
            Compila i campi per creare un nuovo articolo.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-xl space-y-6">
        {/* Article data card */}
        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold">Dati Articolo</h2>
            <p className="text-[13px] text-muted-foreground">
              Inserisci le informazioni principali dell'articolo.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Codice + Descrizione */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Codice</label>
                <Input
                  {...register("code")}
                  placeholder="es. ART001"
                  error={!!errors.code}
                />
                {errors.code && (
                  <p className="text-[12px] text-destructive">{errors.code.message}</p>
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
                  <p className="text-[12px] text-destructive">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* UdM + Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Unità di Misura</label>
                <Controller
                  control={control}
                  name="unit_of_measure_code"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona UdM…" />
                      </SelectTrigger>
                      <SelectContent>
                        {unitOfMeasures.map((uom) => (
                          <SelectItem key={uom.code} value={uom.code}>
                            {uom.code} — {uom.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unit_of_measure_code && (
                  <p className="text-[12px] text-destructive">
                    {errors.unit_of_measure_code.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">
                  Tipo Articolo
                  <span className="ml-1 font-normal text-muted-foreground">(opzionale)</span>
                </label>
                <Controller
                  control={control}
                  name="type_code"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona tipo…" />
                      </SelectTrigger>
                      <SelectContent>
                        {articleTypes.map((t) => (
                          <SelectItem key={t.code} value={t.code}>
                            {t.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Prezzo */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">
                Prezzo
                <span className="ml-1 font-normal text-muted-foreground">(opzionale)</span>
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

            {/* Attivo */}
            <div className="flex items-center gap-2.5">
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Checkbox.Root
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                    className="flex h-5 w-5 items-center justify-center rounded-md border border-border/60 bg-background transition-colors data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  >
                    <Checkbox.Indicator>
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                )}
              />
              <label className="text-[13px] font-medium">Attivo</label>
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
                    list_price: undefined,
                    is_preferred: false,
                  })
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Aggiungi fornitore
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-4 text-center text-[13px] text-muted-foreground">
                Nessun fornitore aggiunto. Puoi aggiungerli dopo la creazione.
              </p>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-muted-foreground">
                        Fornitore {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-medium">Fornitore</label>
                        <Controller
                          control={control}
                          name={`suppliers.${index}.party_guid`}
                          render={({ field: f }) => (
                            <Select value={f.value} onValueChange={f.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona…" />
                              </SelectTrigger>
                              <SelectContent>
                                {parties.map((p) => (
                                  <SelectItem key={p.guid} value={p.guid}>
                                    {p.description}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.suppliers?.[index]?.party_guid && (
                          <p className="text-[12px] text-destructive">
                            {errors.suppliers[index].party_guid.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[12px] font-medium">Codice Fornitore</label>
                        <Input
                          {...register(`suppliers.${index}.supplier_code`)}
                          placeholder="Codice opzionale"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-medium">Prezzo Listino</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register(`suppliers.${index}.list_price`, {
                            valueAsNumber: true,
                          })}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="flex items-end pb-0.5">
                        <div className="flex items-center gap-2">
                          <Controller
                            control={control}
                            name={`suppliers.${index}.is_preferred`}
                            render={({ field: f }) => (
                              <Checkbox.Root
                                checked={f.value}
                                onCheckedChange={(checked) => f.onChange(!!checked)}
                                className="flex h-5 w-5 items-center justify-center rounded-md border border-border/60 bg-background transition-colors data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              >
                                <Checkbox.Indicator>
                                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                                </Checkbox.Indicator>
                              </Checkbox.Root>
                            )}
                          />
                          <label className="text-[12px] font-medium">Preferito</label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
            onClick={() => { store.clear(); navigate("/articles"); }}
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
