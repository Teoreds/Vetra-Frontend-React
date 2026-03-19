import { useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { z } from "zod/v4";
import { ArrowLeft, Loader2, Building2, Truck, FileText, Tag, ImagePlus, Trash2, CreditCard } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useParty } from "../hooks/use-party";
import { useUpdateParty } from "../hooks/use-update-party";
import { useParties } from "../hooks/use-parties";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";
import { PartyAvatar } from "../components/party-avatar";
import { AuthImage } from "@/shared/ui/auth-image";

const SHIPPING_MODES = [
  { value: "FRANCO", label: "Franco" },
  { value: "ASSEGNATO", label: "Assegnato" },
] as const;

const editSchema = z.object({
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

type EditForm = z.infer<typeof editSchema>;

export function PartyEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: party, isLoading } = useParty(id!);
  const updateParty = useUpdateParty();
  const { data: partyTypes } = usePartyTypes();
  const { data: fiscalAreas } = useFiscalAreas();
  const { data: partyCategories } = usePartyCategories();
  const { data: paymentMethods } = usePaymentMethods();
  const { data: paymentTerms } = usePaymentTerms();
  const { data: carriersData } = useParties({ type_code: "CARRIER", limit: 200 });
  const carriers = carriersData?.items ?? [];

  const uploadImage = useMutation({
    mutationFn: (file: File) => partiesApi.uploadImage(id!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partyKeys.detail(id!) });
      queryClient.invalidateQueries({ queryKey: partyKeys.lists() });
    },
  });

  const deleteImage = useMutation({
    mutationFn: () => partiesApi.deleteImage(id!).then(({ error }) => { if (error) throw error; }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partyKeys.detail(id!) });
      queryClient.invalidateQueries({ queryKey: partyKeys.lists() });
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
    formState: { errors },
  } = useForm<EditForm>({
    values: party
      ? {
          description: party.description ?? "",
          vat_number: party.vat_number ?? "",
          type_code: party.type_code ?? "",
          bank_name: party.bank_name ?? "",
          bank_iban: party.bank_iban ?? "",
          bank_bic: party.bank_bic ?? "",
          courier_guid: party.courier_guid ?? "",
          shipping_mode: party.shipping_mode ?? "FRANCO",
          fiscal_area_code: party.fiscal_area_code ?? "",
          sdi_code: party.sdi_code ?? "",
          category_code: party.category_code ?? "",
          default_payment_method_guid: party.default_payment_method_guid ?? "",
          default_payment_term_guid: party.default_payment_term_guid ?? "",
        }
      : undefined,
  });

  if (isLoading || !party) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const onSubmit = async (values: EditForm) => {
    const parsed = editSchema.safeParse(values);
    if (!parsed.success) return;

    await updateParty.mutateAsync({
      partyGuid: party.guid,
      body: {
        description: parsed.data.description,
        vat_number: parsed.data.vat_number || null,
        type_code: parsed.data.type_code,
        bank_name: parsed.data.bank_name || null,
        bank_iban: parsed.data.bank_iban || null,
        bank_bic: parsed.data.bank_bic || null,
        courier_guid: parsed.data.courier_guid || null,
        shipping_mode: parsed.data.shipping_mode || null,
        fiscal_area_code: parsed.data.fiscal_area_code || null,
        sdi_code: parsed.data.sdi_code || null,
        category_code: parsed.data.category_code || null,
        default_payment_method_guid: parsed.data.default_payment_method_guid || null,
        default_payment_term_guid: parsed.data.default_payment_term_guid || null,
      },
    });

    navigate(`/parties/${party.guid}`);
  };

  const isBusy = uploadImage.isPending || deleteImage.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {/* Avatar with upload */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <div className="group/avatar relative h-11 w-11 shrink-0">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
            className="relative h-full w-full overflow-hidden rounded-full border border-border/60 transition-colors hover:border-primary/40"
          >
            {party.image_path ? (
              <AuthImage
                src={`/parties/${party.guid}/image`}
                alt={party.description}
                className="h-full w-full rounded-full"
                fallbackClassName="h-full w-full rounded-full"
              />
            ) : (
              <PartyAvatar
                partyGuid={party.guid}
                name={party.description}
                className="h-full w-full text-[16px]"
              />
            )}
            {isBusy ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover/avatar:bg-black/40">
                <ImagePlus className="h-3.5 w-3.5 text-white opacity-0 transition-opacity group-hover/avatar:opacity-100" />
              </div>
            )}
          </button>
          {party.image_path && !isBusy && (
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
          <h1 className="text-xl font-semibold">Modifica Anagrafica</h1>
          <p className="text-[13px] text-muted-foreground">{party.description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-xl space-y-5">
        {/* Dati Anagrafica */}
        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold">Dati Anagrafica</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Descrizione *</label>
                <Input
                  {...register("description")}
                  error={!!errors.description}
                />
                {errors.description && (
                  <p className="text-[12px] text-destructive">{errors.description.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Partita IVA</label>
                <Input {...register("vat_number")} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Tipo *</label>
                <Controller
                  control={control}
                  name="type_code"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
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
                <Input {...register("bank_name")} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">IBAN</label>
                <Input {...register("bank_iban")} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">BIC/SWIFT</label>
                <Input {...register("bank_bic")} />
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

        {/* Dati Fiscali & Classificazione */}
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
                <Input {...register("sdi_code")} maxLength={7} />
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

        {updateParty.isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
            <p className="text-[13px] text-destructive">Impossibile aggiornare l'anagrafica. Riprova.</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Annulla
          </Button>
          <Button type="submit" disabled={updateParty.isPending}>
            {updateParty.isPending ? (
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
