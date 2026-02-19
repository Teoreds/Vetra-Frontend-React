import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/shared/lib/utils";
import { OverviewTab } from "./overview-tab";
import { RowsTab } from "./rows-tab";
import { CommitmentsTab } from "./commitments-tab";
import { PickNotesTab } from "./pick-notes-tab";
import { DeliveryNotesTab } from "./delivery-notes-tab";
import { AttachmentsTab } from "./attachments-tab";
import { LogsTab } from "./logs-tab";
import type { OrderOut } from "../types/order.types";

interface OrderTabsProps {
  order: OrderOut;
}

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "rows", label: "Rows" },
  { value: "commitments", label: "Commitments" },
  { value: "pick-notes", label: "Pick Notes" },
  { value: "delivery-notes", label: "Delivery Notes" },
  { value: "attachments", label: "Attachments" },
  { value: "logs", label: "Logs" },
] as const;

export function OrderTabs({ order }: OrderTabsProps) {
  return (
    <Tabs.Root defaultValue="overview" className="mt-6">
      <Tabs.List className="flex gap-0 border-b border-border/60">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "px-4 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors",
              "border-b-2 border-transparent -mb-px hover:text-foreground",
              "data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:font-semibold",
            )}
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <div className="pt-6">
        <Tabs.Content value="overview">
          <OverviewTab order={order} />
        </Tabs.Content>
        <Tabs.Content value="rows">
          <RowsTab orderGuid={order.guid} statusCode={order.status_code} />
        </Tabs.Content>
        <Tabs.Content value="commitments">
          <CommitmentsTab orderGuid={order.guid} />
        </Tabs.Content>
        <Tabs.Content value="pick-notes">
          <PickNotesTab orderGuid={order.guid} />
        </Tabs.Content>
        <Tabs.Content value="delivery-notes">
          <DeliveryNotesTab orderGuid={order.guid} />
        </Tabs.Content>
        <Tabs.Content value="attachments">
          <AttachmentsTab orderGuid={order.guid} />
        </Tabs.Content>
        <Tabs.Content value="logs">
          <LogsTab orderGuid={order.guid} />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
}
