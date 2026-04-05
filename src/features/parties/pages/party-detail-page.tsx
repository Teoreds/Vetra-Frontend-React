import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Pencil,
  ImagePlus,
  Trash2,
  Loader2,
} from "lucide-react";
import { BackButton } from "@/shared/ui/back-button";
import { useBack } from "@/shared/hooks/use-back";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Tabs from "@radix-ui/react-tabs";
import { Button } from "@/shared/ui/button";
import { useParty } from "../hooks/use-party";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";
import { PartyOverview } from "../components/party-overview";
import { ContactsSection } from "../components/contacts-section";
import { LocationsSection } from "../components/locations-section";
import { DiscountsTab } from "../components/discounts-tab";
import { OrdersTab } from "../components/orders-tab";
import { SupplierArticlesTab } from "../components/supplier-articles-tab";
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
  const back = useBack();
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
        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
      </div>
    );
  }

  if (error || !party) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-[13px] text-muted-foreground">Nessuna anagrafica trovata.</p>
        <Button variant="ghost" size="sm" onClick={() => back("/parties")}>
          Torna alle anagrafiche
        </Button>
      </div>
    );
  }

  const isBusy = uploadImage.isPending || deleteImage.isPending;
  const isCustomer = party.type_code === "CUSTOMER";
  const isSupplier = party.type_code === "SUPPLIER";

  return (
    <Tabs.Root defaultValue="anagrafica" className="flex flex-col">
      {/* Sticky header + tab list */}
      <div className="sticky -top-6 z-30 -mx-8 -mt-6 bg-page/80 backdrop-blur-sm px-8 pt-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton fallback="/parties" />

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
              <span className="text-[11px] text-muted-foreground capitalize">
                {typeLabels.get(party.type_code)?.toLowerCase() ?? party.type_code.toLowerCase()}
              </span>
            </div>
          </div>

          <Button size="sm" onClick={() => navigate(`/parties/${party.guid}/edit`)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Modifica
          </Button>
        </div>

        {/* Tab list */}
        <Tabs.List className="mx-auto max-w-5xl mt-3 flex gap-0 border-b border-border/60">
          <TabTrigger value="anagrafica">Anagrafica</TabTrigger>
          {isCustomer && <TabTrigger value="sconti">Sconti</TabTrigger>}
          {isCustomer && <TabTrigger value="ordini">Ordini</TabTrigger>}
          {isSupplier && <TabTrigger value="articoli">Articoli</TabTrigger>}
        </Tabs.List>
      </div>

      {/* Tab content — scrolls normally */}
      <div className="mx-auto w-full max-w-5xl pt-6">
        <Tabs.Content value="anagrafica">
          <div className="flex gap-5">
            <div className="min-w-0 flex-1">
              <PartyOverview party={party} />
            </div>
            <div className="w-80 shrink-0 space-y-4">
              <ContactsSection partyGuid={party.guid} onAdd={() => setOpenDialog("contact")} />
              <LocationsSection partyGuid={party.guid} onAdd={() => setOpenDialog("address")} />
            </div>
          </div>
        </Tabs.Content>

        {isCustomer && (
          <Tabs.Content value="sconti">
            <DiscountsTab
              partyGuid={party.guid}
              onAddDiscount={() => setOpenDialog("discount")}
              onAddIntentLetter={() => setOpenDialog("intent-letter")}
            />
          </Tabs.Content>
        )}

        {isCustomer && (
          <Tabs.Content value="ordini">
            <OrdersTab partyGuid={party.guid} />
          </Tabs.Content>
        )}

        {isSupplier && (
          <Tabs.Content value="articoli">
            <SupplierArticlesTab onAddArticle={() => setOpenDialog("supplier-article")} />
          </Tabs.Content>
        )}
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
    </Tabs.Root>
  );
}

function TabTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <Tabs.Trigger
      value={value}
      className="relative px-4 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity data-[state=active]:after:opacity-100"
    >
      {children}
    </Tabs.Trigger>
  );
}
