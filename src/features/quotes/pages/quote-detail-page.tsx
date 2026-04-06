import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { Button } from "@/shared/ui/button";
import { useBack } from "@/shared/hooks/use-back";
import { useQuote } from "../hooks/use-quote";
import { QuoteHeader } from "../components/quote-header";
import { QuoteTabs } from "../components/quote-tabs";

const TAB_LIST = [
  { value: "overview", label: "Panoramica" },
  { value: "rows", label: "Articoli" },
] as const;

export function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const back = useBack();
  const { data: quote, isLoading, error } = useQuote(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-[13px] text-muted-foreground">
          Preventivo non trovato.
        </p>
        <Button variant="ghost" size="sm" onClick={() => back("/quotes")}>
          Torna ai preventivi
        </Button>
      </div>
    );
  }

  return (
    <Tabs.Root defaultValue="overview" className="flex flex-col">
      {/* Sticky header + tab list */}
      <div className="sticky -top-6 z-30 -mx-8 -mt-6 bg-page/80 backdrop-blur-sm px-8 pt-6">
        <QuoteHeader quote={quote} />
        <Tabs.List className="mx-auto max-w-4xl mt-1 flex gap-0 border-b border-border/60">
          {TAB_LIST.map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="relative px-4 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity data-[state=active]:after:opacity-100"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </div>

      {/* Tab content */}
      <div className="mx-auto w-full max-w-4xl pt-6 space-y-6">
        <QuoteTabs quote={quote} />
      </div>
    </Tabs.Root>
  );
}
