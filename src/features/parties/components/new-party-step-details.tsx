import { useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Tag, ImagePlus, User } from "lucide-react";
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
import { usePartyTypes, useFiscalAreas, usePartyCategories } from "@/shared/hooks/use-lookups";
import type { PartyIdentityData } from "../stores/use-new-party-store";

const step1Schema = z.object({
  description: z.string().min(1, "La descrizione è obbligatoria"),
  vat_number: z.string().optional().default(""),
  type_code: z.string().min(1, "Seleziona un tipo"),
  category_code: z.string().optional().default(""),
  fiscal_area_code: z.string().optional().default(""),
  sdi_code: z.string().max(7, "Max 7 caratteri").optional().default(""),
});

export type Step1Data = PartyIdentityData;

interface Props {
  defaultValues?: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
  error?: string | null;
  imagePreview: string | null;
  onImageSelect: (file: File) => void;
  onImageClear: () => void;
}

export function NewPartyStepDetails({ defaultValues, onNext, error, imagePreview, onImageSelect, onImageClear }: Props) {
  const { data: partyTypes } = usePartyTypes();
  const { data: fiscalAreas } = useFiscalAreas();
  const { data: partyCategories } = usePartyCategories();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      description: "",
      vat_number: "",
      type_code: "",
      category_code: "",
      fiscal_area_code: "",
      sdi_code: "",
      ...defaultValues,
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onImageSelect(file);
    e.target.value = "";
  }

  const onSubmit = (values: Step1Data) => {
    const parsed = step1Schema.safeParse(values);
    if (!parsed.success) return;
    onNext(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <CardHeader>
          <h2 className="text-[15px] font-semibold">Identità</h2>
          <p className="text-[13px] text-muted-foreground">
            Chi è questa anagrafica? Definisci ragione sociale, tipo e classificazione.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar + description + vat */}
          <div className="flex gap-5">
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="group/avatar relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted/50 transition-colors hover:border-primary/40"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Anteprima" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-7 w-7 text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/avatar:bg-black/40">
                <ImagePlus className="h-5 w-5 text-white opacity-0 transition-opacity group-hover/avatar:opacity-100" />
              </div>
            </button>

            <div className="flex flex-1 flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium">Ragione Sociale *</label>
                  <Input
                    {...register("description")}
                    placeholder="Es. Rossi S.r.l."
                    error={!!errors.description}
                    autoFocus
                  />
                  {errors.description && (
                    <p className="text-[12px] text-destructive">{errors.description.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium">Partita IVA</label>
                  <Input {...register("vat_number")} placeholder="IT01234567890" />
                </div>
              </div>
              {imagePreview && (
                <button
                  type="button"
                  onClick={onImageClear}
                  className="self-start text-[11px] text-muted-foreground hover:text-destructive"
                >
                  Rimuovi immagine
                </button>
              )}
            </div>
          </div>

          {/* Row 2: type + fiscal area + SDI */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Tipo *</label>
              <Controller
                control={control}
                name="type_code"
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
          </div>

          {/* Row 3: category */}
          <div className="grid grid-cols-3 gap-4">
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
        <Button type="submit">
          Avanti
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
