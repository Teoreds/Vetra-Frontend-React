import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { Button } from "@/shared/ui/button";
import { StickyHeader } from "@/shared/ui/sticky-header";
import { TabBar, TabTrigger } from "@/shared/ui/tab-bar";
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
        <p className="text-[length:var(--text-body)] text-muted-foreground">
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
      <StickyHeader>
        <QuoteHeader quote={quote} />
        <TabBar className="mx-auto max-w-4xl mt-3">
          {TAB_LIST.map((tab) => (
            <TabTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabTrigger>
          ))}
        </TabBar>
      </StickyHeader>

      <div className="mx-auto w-full max-w-4xl pt-6 space-y-6">
        <QuoteTabs quote={quote} />
      </div>
    </Tabs.Root>
  );
}
