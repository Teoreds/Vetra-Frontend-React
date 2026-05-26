import { useRef, useEffect, useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
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
import { SearchableSelect } from "@/shared/ui/searchable-select";
import { usePartyTypes, useFiscalAreas, usePartyCategories } from "@/shared/hooks/use-lookups";
import type { PartyIdentityData } from "../stores/use-new-party-store";

const step1Schema = z.object({
  description: z.string().min(1, "La descrizione è obbligatoria"),
  vat_number: z.string().optional().default(""),
  type_code: z.string().min(1, "Seleziona un tipo"),
  category_code: z.string().optional().default(""),
  fiscal_area_code: z.string().optional().default(""),
  sdi_code: z.string().max(320, "Max 320 caratteri").optional().default(""),
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
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  useEffect(() => {
    function onDragEnter(e: DragEvent) {
      const hasImage = Array.from(e.dataTransfer?.items ?? []).some(
        (item) => item.kind === "file" && item.type.startsWith("image/"),
      );
      if (!hasImage) return;
      dragCounterRef.current++;
      setIsDragging(true);
    }
    function onDragLeave() {
      dragCounterRef.current--;
      if (dragCounterRef.current <= 0) { dragCounterRef.current = 0; setIsDragging(false); }
    }
    function onDragOver(e: DragEvent) { e.preventDefault(); }
    function onDrop(e: DragEvent) {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragging(false);
      const file = Array.from(e.dataTransfer?.files ?? []).find((f) => f.type.startsWith("image/"));
      if (file) onImageSelect(file);
    }
    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
    };
  }, [onImageSelect]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema) as unknown as Resolver<Step1Data>,
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

  const SDI_DEFAULTS: Record<string, string> = {
    INTRA_CEE: "XXXXXXX",
    EXTRA_CEE: "XXXXXXX",
    NAZIONALE: "",
  };

  const fiscalArea = watch("fiscal_area_code");
  useEffect(() => {
    if (fiscalArea && fiscalArea in SDI_DEFAULTS) {
      setValue("sdi_code", SDI_DEFAULTS[fiscalArea], { shouldValidate: false });
    }
  }, [fiscalArea]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onImageSelect(file);
    e.target.value = "";
  }

  const onSubmit = (values: Step1Data) => {
    onNext(values);
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
              tabIndex={-1}
              onClick={() => imageInputRef.current?.click()}
              className={`group/avatar relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full border bg-muted/50 transition-all hover:border-primary/40 ${isDragging ? "border-primary/60 ring-2 ring-primary/20" : "border-border/60"}`}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Anteprima" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-7 w-7 text-muted-foreground/40" />
                </div>
              )}
              <div className={`absolute inset-0 flex items-center justify-center transition-colors ${isDragging ? "bg-black/40" : "bg-black/0 group-hover/avatar:bg-black/40"}`}>
                <ImagePlus className={`h-5 w-5 text-white transition-opacity ${isDragging ? "opacity-100" : "opacity-0 group-hover/avatar:opacity-100"}`} />
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
                    <p className="text-[11px] text-danger-foreground">{errors.description.message}</p>
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
                  tabIndex={-1}
                  onClick={onImageClear}
                  className="self-start text-[11px] text-muted-foreground hover:text-danger"
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
                <p className="text-[11px] text-danger-foreground">{errors.type_code.message}</p>
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
                placeholder="0000000 o indirizzo PEC"
                maxLength={320}
              />
              {errors.sdi_code && (
                <p className="text-[11px] text-danger-foreground">{errors.sdi_code.message}</p>
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
                  <SearchableSelect
                    items={partyCategories.map((c) => ({ value: c.code, label: c.description }))}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Cerca categoria…"
                  />
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-3">
          <p className="text-[13px] text-danger-foreground">{error}</p>
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
