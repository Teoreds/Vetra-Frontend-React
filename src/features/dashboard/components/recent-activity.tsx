import { CheckCircle } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { Timeline, type TimelineItem } from "@/shared/ui/timeline";

// Placeholder items: in production, derive from a dedicated activity endpoint or aggregate
const PLACEHOLDER_ITEMS: TimelineItem[] = [
  {
    id: "1",
    icon: <CheckCircle className="h-4 w-4" />,
    title: "Le attività compariranno qui",
    description: "qua devo implementare il feed nel backend, ma prima capire se è necessario",
    timestamp: "Ora",
  },
];

export function RecentActivity() {
  return (
    <Card>
      <div className="px-5 pt-5 pb-1">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Attività Recente</h2>
      </div>
      <div className="p-5 pt-3">
        <Timeline items={PLACEHOLDER_ITEMS} />
      </div>
    </Card>
  );
}
