import { CheckCircle } from "lucide-react";
import { Timeline, type TimelineItem } from "@/shared/ui/timeline";

// Placeholder items: in production, derive from a dedicated activity endpoint or aggregate
const PLACEHOLDER_ITEMS: TimelineItem[] = [
  {
    id: "1",
    icon: <CheckCircle className="h-4 w-4" />,
    title: "Activity events will appear here",
    description: "Connect to backend activity feed",
    timestamp: "Just now",
  },
];

export function RecentActivity() {
  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <div className="px-5 pt-5 pb-1">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Activity</h2>
      </div>
      <div className="p-5 pt-3">
        <Timeline items={PLACEHOLDER_ITEMS} />
      </div>
    </div>
  );
}
