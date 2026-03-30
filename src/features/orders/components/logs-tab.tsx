import {
  CheckCircle,
  ArrowRightCircle,
  PlusCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Timeline, type TimelineItem } from "@/shared/ui/timeline";
import { formatDate } from "@/shared/lib/utils";
import { useOrderLog } from "../hooks/use-order-log";
import { useOrderStatuses, useLogActionTypes } from "@/shared/hooks/use-lookups";

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
  const { map: statusLabels } = useOrderStatuses();
  const { map: actionLabels } = useLogActionTypes();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
      </div>
    );
  }

  const timelineItems: TimelineItem[] = logs.map((log) => ({
    id: log.guid,
    icon: ACTION_ICONS[log.action_code] ?? <AlertCircle className="h-4 w-4" />,
    title: buildLogTitle(log.action_code, log.old_status_code, log.new_status_code, statusLabels, actionLabels),
    description: log.note ?? undefined,
    timestamp: formatDate(log.created_at),
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-[15px] font-semibold">Registro Attività</h3>
      {timelineItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nessuna attività registrata.</p>
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
  statusLabels: Map<string, string>,
  actionLabels: Map<string, string>,
): string {
  if (oldStatus && newStatus) {
    const from = statusLabels.get(oldStatus.toUpperCase()) ?? oldStatus;
    const to = statusLabels.get(newStatus.toUpperCase()) ?? newStatus;
    return `${from} \u2192 ${to}`;
  }
  const key = actionCode.toUpperCase();
  return (
    actionLabels.get(key) ??
    actionCode
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase())
  );
}
