import {
  CheckCircle,
  ArrowRightCircle,
  PlusCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { formatDateTime } from "@/shared/lib/utils";
import { useOrderLog } from "../hooks/use-order-log";
import { getStatusLabel } from "../types/order-status";

interface OrderActivitySidebarProps {
  orderGuid: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  STATUS_CHANGE: <ArrowRightCircle className="h-3.5 w-3.5" />,
  CREATE: <PlusCircle className="h-3.5 w-3.5" />,
  CREATED: <PlusCircle className="h-3.5 w-3.5" />,
  CONFIRM: <CheckCircle className="h-3.5 w-3.5" />,
  CONFIRMED: <CheckCircle className="h-3.5 w-3.5" />,
};

function getIcon(actionCode: string): React.ReactNode {
  return (
    ACTION_ICONS[actionCode.toUpperCase()] ?? (
      <AlertCircle className="h-3.5 w-3.5" />
    )
  );
}

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Creazione Ordine",
  CREATED: "Creazione Ordine",
  CONFIRM: "Ordine confermato",
  CONFIRMED: "Ordine confermato",
  STATUS_CHANGE: "Cambio stato",
  ROW_ADDED: "Riga aggiunta",
  ROW_UPDATED: "Riga aggiornata",
  ROW_REMOVED: "Riga rimossa",
  ATTACHMENT_ADDED: "Allegato aggiunto",
};

function buildLogTitle(
  actionCode: string,
  oldStatus: string | null,
  newStatus: string | null,
): string {
  if (oldStatus && newStatus) {
    return `${getStatusLabel(oldStatus)} \u2192 ${getStatusLabel(newStatus)}`;
  }
  const key = actionCode.toUpperCase();
  return (
    ACTION_LABELS[key] ??
    actionCode
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase())
  );
}

export function OrderActivitySidebar({ orderGuid }: OrderActivitySidebarProps) {
  const { data: logs = [], isLoading } = useOrderLog(orderGuid);

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          Attivit&agrave; Ordine
        </h3>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-muted-foreground">
            Nessuna attivit&agrave; registrata.
          </p>
        ) : (
          <div className="max-h-[480px] space-y-0 overflow-y-auto pr-1">
            {logs.map((log, index) => (
              <div key={log.guid} className="flex gap-3">
                {/* Icona + connettore verticale */}
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary ring-2 ring-background">
                    {getIcon(log.action_code)}
                  </div>
                  {index < logs.length - 1 && (
                    <div className="w-px flex-1 bg-border" />
                  )}
                </div>

                {/* Contenuto voce */}
                <div className="flex-1 pb-4 pt-0.5">
                  <p className="text-[12px] font-semibold leading-snug">
                    {buildLogTitle(
                      log.action_code,
                      log.old_status_code,
                      log.new_status_code,
                    )}
                  </p>
                  {log.note && (
                    <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                      {log.note}
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                    {formatDateTime(log.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
