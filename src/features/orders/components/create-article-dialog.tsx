import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/shared/ui/checkbox";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { CurrencySelector } from "@/shared/ui/currency-selector";
import { useCurrencyRates, toEur, type Currency } from "@/shared/hooks/use-currency-rates";
import { useCreateArticle } from "@/features/articles/hooks/use-create-article";
import {
  useUnitOfMeasures,
  useArticleTypes,
} from "@/features/articles/hooks/use-article-lookups";
import type { ArticleOut } from "@/features/articles/types/article.types";

const schema = z.object({
  code: z.string().min(1, "Il codice è obbligatorio"),
  description: z.string().min(1, "La descrizione è obbligatoria"),
  unit_of_measure_code: z.string().min(1, "Seleziona un'unità di misura"),
  type_code: z.string().optional(),
  is_active: z.boolean().default(true),
  list_price: z.coerce.number().min(0).optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (article: ArticleOut) => void;
}

export function CreateArticleDialog({ open, onOpenChange, onCreated }: Props) {
  const createArticle = useCreateArticle();
  const { data: unitOfMeasures = [] } = useUnitOfMeasures();
  const { data: articleTypes = [] } = useArticleTypes();
  const [currency, setCurrency] = useState<Currency>("EUR");
  const { data: rates } = useCurrencyRates();

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      description: "",
      unit_of_measure_code: "",
      type_code: "",
      is_active: true,
      list_price: null,
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) { reset(); setCurrency("EUR"); }
    onOpenChange(next);
  };

  function handleCurrencyChange(newCurrency: Currency) {
    if (rates) {
      const current = getValues("list_price") ?? 0;
      const inEur = toEur(current, rates, currency);
      setValue("list_price", parseFloat((inEur * rates[newCurrency]).toFixed(2)));
    }
    setCurrency(newCurrency);
  }

  const onSubmit = async (values: FormValues) => {
    const listPriceEur =
      values.list_price != null && rates
        ? parseFloat(toEur(values.list_price, rates, currency).toFixed(2))
        : (values.list_price ?? null);
    const article = await createArticle.mutateAsync({
      code: values.code,
      description: values.description,
      unit_of_measure_code: values.unit_of_measure_code,
      type_code: values.type_code || null,
      is_active: values.is_active,
      list_price: listPriceEur,
    });
    if (!article) return;
    reset();
    onOpenChange(false);
    onCreated(article);
  };

  return (
    <ModalDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Nuovo Articolo"
      description="Crea un nuovo articolo e aggiungilo subito all'ordine."
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Codice + Descrizione */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Codice *</label>
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
            <label className="text-[13px] font-medium">Descrizione *</label>
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
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium">Unità di Misura *</label>
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
              Tipo
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
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(!!checked)}
              />
            )}
          />
          <label className="text-[13px] font-medium">Attivo</label>
        </div>

        {/* Error banner */}
        {createArticle.isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
            <p className="text-[13px] text-destructive">
              Impossibile creare l'articolo. Riprova.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-border/60 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={createArticle.isPending}
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
              "Crea e Aggiungi"
            )}
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
}
