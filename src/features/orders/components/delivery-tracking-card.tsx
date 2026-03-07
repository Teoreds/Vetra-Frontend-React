import { Truck, FileText, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { formatDate } from "@/shared/lib/utils";
import type { DeliveryNoteOut } from "../types/order.types";

interface DeliveryTrackingCardProps {
  deliveryNotes?: DeliveryNoteOut[];
}

export function DeliveryTrackingCard({
  deliveryNotes = [],
}: DeliveryTrackingCardProps) {
  const hasNotes = deliveryNotes.length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
              Note di Consegna
            </h3>
            {hasNotes && (
              <Badge variant="secondary" className="ml-1">
                {deliveryNotes.length}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasNotes ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-[13px] font-medium text-muted-foreground">
              Nessuna nota di consegna
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground/70">
              Le note di consegna verranno create dalle note di prelievo completate.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {deliveryNotes.map((dn) => (
              <div
                key={dn.guid}
                className="flex items-center gap-4 rounded-lg border border-border/60 bg-card px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold">
                    DDT #{dn.guid.slice(0, 8).toUpperCase()}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(dn.delivery_date)}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
