import * as Tabs from "@radix-ui/react-tabs";
import { QuoteOverviewTab } from "./quote-overview-tab";
import { QuoteRowsTab } from "./quote-rows-tab";
import type { QuoteDetailOut } from "../types/quote.types";

interface QuoteTabsProps {
  quote: QuoteDetailOut;
}

export function QuoteTabs({ quote }: QuoteTabsProps) {
  return (
    <>
      <Tabs.Content value="overview">
        <QuoteOverviewTab quote={quote} />
      </Tabs.Content>
      <Tabs.Content value="rows">
        <QuoteRowsTab
          quoteGuid={quote.guid}
          statusCode={quote.status_code}
          rows={quote.rows ?? []}
        />
      </Tabs.Content>
    </>
  );
}
