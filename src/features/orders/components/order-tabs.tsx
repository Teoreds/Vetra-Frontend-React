import * as Tabs from "@radix-ui/react-tabs";
import { OverviewTab } from "./overview-tab";
import { RowsTab } from "./rows-tab";
import { CommitmentsTab } from "./commitments-tab";
import { PickNotesTab } from "./pick-notes-tab";
import { DeliveryNotesTab } from "./delivery-notes-tab";
import { AttachmentsTab } from "./attachments-tab";
import type { OrderDetailOut } from "../types/order.types";

interface OrderTabsProps {
  order: OrderDetailOut;
}

export function OrderTabs({ order }: OrderTabsProps) {
  return (
    <>
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
    </>
  );
}
