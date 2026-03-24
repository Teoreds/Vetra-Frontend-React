import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  ImagePlus,
  Trash2,
  Loader2,
  Plus,
  ChevronDown,
  Mail,
  MapPin,
  Percent,
  FileText,
  Package,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/shared/ui/button";
import { useParty } from "../hooks/use-party";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";
import { PartyOverview } from "../components/party-overview";
import { ContactsSection } from "../components/contacts-section";
import { LocationsSection } from "../components/locations-section";
import { RelatedOrdersSection } from "../components/related-orders-section";
import { PartyAvatar } from "../components/party-avatar";
import { AuthImage } from "@/shared/ui/auth-image";
import { usePartyTypes } from "@/shared/hooks/use-lookups";
import { AddContactDialog } from "../components/add-contact-dialog";
import { AddAddressDialog } from "../components/add-address-dialog";
import { AddDiscountDialog } from "../components/add-discount-dialog";
import { AddIntentLetterDialog } from "../components/add-intent-letter-dialog";
import { AddSupplierArticleDialog } from "../components/add-supplier-article-dialog";

type DialogType = "contact" | "address" | "discount" | "intent-letter" | "supplier-article" | null;

export function PartyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: party, isLoading, error } = useParty(id!);
  const { map: typeLabels } = usePartyTypes();
  const [openDialog, setOpenDialog] = useState<DialogType>(null);

  const uploadImage = useMutation({
    mutationFn: (file: File) => partiesApi.uploadImage(party!.guid, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partyKeys.detail(id!) });
      queryClient.invalidateQueries({ queryKey: partyKeys.lists() });
    },
  });

  const deleteImage = useMutation({
    mutationFn: () => partiesApi.deleteImage(party!.guid).then(({ error }) => { if (error) throw error; }),
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !party) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Nessuna anagrafica trovata.</p>
      </div>
    );
  }

  const isBusy = uploadImage.isPending || deleteImage.isPending;
  const isCustomer = party.type_code === "CUSTOMER";
  const isSupplier = party.type_code === "SUPPLIER";

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky -top-6 z-30 -mx-8 -mt-6 bg-page/80 backdrop-blur-sm px-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/parties")}>
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
              <h1 className="text-xl font-bold tracking-tight leading-none">{party.description}</h1>
              <span className="text-[12px] text-muted-foreground capitalize">
                {typeLabels.get(party.type_code)?.toLowerCase() ?? party.type_code.toLowerCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Add dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Aggiungi
                  <ChevronDown className="ml-1 h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={4}
                  className="z-50 min-w-[200px] rounded-lg border border-border/60 bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
                >
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors hover:bg-accent"
                    onSelect={() => setOpenDialog("contact")}
                  >
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Contatto
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors hover:bg-accent"
                    onSelect={() => setOpenDialog("address")}
                  >
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    Indirizzo
                  </DropdownMenu.Item>
                  {isCustomer && (
                    <>
                      <DropdownMenu.Separator className="my-1 h-px bg-border/60" />
                      <DropdownMenu.Item
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors hover:bg-accent"
                        onSelect={() => setOpenDialog("discount")}
                      >
                        <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                        Sconto
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors hover:bg-accent"
                        onSelect={() => setOpenDialog("intent-letter")}
                      >
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        Lettera d'Intento
                      </DropdownMenu.Item>
                    </>
                  )}
                  {isSupplier && (
                    <>
                      <DropdownMenu.Separator className="my-1 h-px bg-border/60" />
                      <DropdownMenu.Item
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors hover:bg-accent"
                        onSelect={() => setOpenDialog("supplier-article")}
                      >
                        <Package className="h-3.5 w-3.5 text-muted-foreground" />
                        Articolo Fornito
                      </DropdownMenu.Item>
                    </>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <Button size="sm" onClick={() => navigate(`/parties/${party.guid}/edit`)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Modifica
            </Button>
          </div>
        </div>

        <div className="mt-3 h-px bg-border/60" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl pt-6">
        <div className="flex gap-5">
          <div className="min-w-0 flex-1">
            <PartyOverview party={party} />
          </div>
          <div className="w-72 shrink-0 space-y-4">
            <ContactsSection partyGuid={party.guid} />
            <LocationsSection partyGuid={party.guid} />
          </div>
        </div>
        <div className="mt-6">
          <RelatedOrdersSection partyGuid={party.guid} />
        </div>
      </div>

      {/* Dialogs */}
      <AddContactDialog
        open={openDialog === "contact"}
        onOpenChange={(v) => !v && setOpenDialog(null)}
        partyGuid={party.guid}
      />
      <AddAddressDialog
        open={openDialog === "address"}
        onOpenChange={(v) => !v && setOpenDialog(null)}
        partyGuid={party.guid}
      />
      {isCustomer && (
        <>
          <AddDiscountDialog
            open={openDialog === "discount"}
            onOpenChange={(v) => !v && setOpenDialog(null)}
            partyGuid={party.guid}
          />
          <AddIntentLetterDialog
            open={openDialog === "intent-letter"}
            onOpenChange={(v) => !v && setOpenDialog(null)}
            partyGuid={party.guid}
          />
        </>
      )}
      {isSupplier && (
        <AddSupplierArticleDialog
          open={openDialog === "supplier-article"}
          onOpenChange={(v) => !v && setOpenDialog(null)}
          partyGuid={party.guid}
        />
      )}
    </div>
  );
}
