import { useNavigate } from "react-router-dom";
import { Download, Pencil, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { BackButton } from "@/shared/ui/back-button";
import { StatusBadge } from "@/shared/ui/status-badge";
import { getStatusVariant } from "@/shared/ui/status-variants";
import { useParty } from "@/features/parties/hooks/use-party";
import { PartyAvatar } from "@/features/parties/components/party-avatar";
import {
  isQuoteEditable,
  isQuoteDeletable,
  canConvertQuoteToOrder,
  QUOTE_STATUS_LABELS,
} from "../types/quote-status";
import { quotesApi } from "../api/quotes.api";
import { useDeleteQuote } from "../hooks/use-delete-quote";
import { useConvertQuoteToOrder } from "../hooks/use-convert-quote";
import type { QuoteDetailOut } from "../types/quote.types";

interface QuoteHeaderProps {
  quote: QuoteDetailOut;
}

export function QuoteHeader({ quote }: QuoteHeaderProps) {
  const navigate = useNavigate();
  const { data: party } = useParty(quote.party_guid);
  const deleteQuote = useDeleteQuote();
  const convertToOrder = useConvertQuoteToOrder(quote.guid);

  const createdAt = new Date(quote.created_at).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  function handleDelete() {
    deleteQuote.mutate(quote.guid, {
      onSuccess: () => navigate("/quotes"),
    });
  }

  function handleConvert() {
    convertToOrder.mutate(undefined, {
      onSuccess: (order) => {
        if (order) navigate(`/orders/${order.guid}/edit`);
      },
    });
  }

  return (
    <div className="mx-auto max-w-4xl flex items-center justify-between pb-2">
      <div className="flex items-center gap-3">
        <BackButton fallback="/quotes" className="h-8 w-8 shrink-0" />

        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[length:var(--text-page-title)] font-bold tracking-tight leading-none">
              Preventivo #{quote.code?.replace(/^QUO-/i, "") ?? ""}
            </h1>
            <StatusBadge
              variant={getStatusVariant(quote.status_code)}
              label={
                QUOTE_STATUS_LABELS[
                  quote.status_code as keyof typeof QUOTE_STATUS_LABELS
                ] ?? quote.status_code
              }
            />
          </div>

          <div className="flex items-center gap-1.5">
            {party && (
              <>
                <PartyAvatar
                  partyGuid={quote.party_guid}
                  name={party.description ?? "?"}
                  imagePath={party.image_path}
                  className="h-4 w-4 text-[8px]"
                />
                <span className="text-[length:var(--text-caption)] text-muted-foreground font-medium">
                  {party.description}
                </span>
                <span className="text-muted-foreground/30 select-none">·</span>
              </>
            )}
            <span className="text-[length:var(--text-caption)] text-muted-foreground">{createdAt}</span>
            {quote.valid_until && (
              <>
                <span className="text-muted-foreground/30 select-none">·</span>
                <span className="text-[length:var(--text-caption)] text-muted-foreground">
                  Valido fino al{" "}
                  {new Date(quote.valid_until).toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => quotesApi.downloadPdf(quote.guid).catch(() => {})}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Scarica Preventivo
        </Button>
        {canConvertQuoteToOrder(quote.status_code) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleConvert}
            disabled={convertToOrder.isPending}
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            {convertToOrder.isPending ? "Conversione..." : "Converti in Ordine"}
          </Button>
        )}
        <Button
          size="sm"
          onClick={() => navigate(`/quotes/${quote.guid}/edit`)}
          disabled={!isQuoteEditable(quote.status_code)}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Modifica
        </Button>
        {isQuoteDeletable(quote.status_code) && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-1 h-8 w-8 text-muted-foreground hover:text-destructive"
            aria-label="Elimina preventivo"
            onClick={handleDelete}
            disabled={deleteQuote.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
