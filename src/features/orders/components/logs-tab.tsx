import {
  CheckCircle,
  ArrowRightCircle,
  PlusCircle,
  AlertCircle,
} from "lucide-react";
import { Timeline, type TimelineItem } from "@/shared/ui/timeline";
import { formatDate } from "@/shared/lib/utils";
import { useOrderLog } from "../hooks/use-order-log";

interface LogsTabProps {
  orderGuid: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  STATUS_CHANGE: <ArrowRightCircle className="h-4 w-4" />,
  CREATED: <PlusCircle className="h-4 w-4" />,
  CONFIRMED: <CheckCircle className="h-4 w-4" />,
};

export function LogsTab({ orderGuid }: LogsTabProps) {
  const { data: logs = [], isLoading } = useOrderLog(orderGuid);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const timelineItems: TimelineItem[] = logs.map((log) => ({
    id: log.guid,
    icon: ACTION_ICONS[log.action_code] ?? <AlertCircle className="h-4 w-4" />,
    title: buildLogTitle(log.action_code, log.old_status_code, log.new_status_code),
    description: log.note ?? undefined,
    timestamp: formatDate(log.created_at),
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-[15px] font-semibold">Activity Log</h3>
      {timelineItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity logged yet.</p>
      ) : (
        <Timeline items={timelineItems} />
      )}
    </div>
  );
}

function buildLogTitle(
  actionCode: string,
  oldStatus: string | null,
  newStatus: string | null,
): string {
  if (oldStatus && newStatus) {
    return `Status changed from ${oldStatus} to ${newStatus}`;
  }
  return actionCode.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}
