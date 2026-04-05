import { Fragment } from "react";
import { Warehouse, MapPin, Package, StickyNote, FileText, Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { useWarehouses } from "@/features/warehouses/hooks/use-warehouses";
import { useWarehouseWorkers } from "@/features/warehouses/hooks/use-warehouse-workers";
import { useArticles } from "@/features/articles/hooks/use-articles";
import { useLocationsMap } from "@/features/parties/hooks/use-locations-map";
import { usePickNoteStatuses } from "@/shared/hooks/use-lookups";
import { AddressBox } from "@/shared/ui/address-box";
import type { PickNoteDetailOut } from "../types/pick-note.types";

interface PickNoteContentProps {
  pickNote: PickNoteDetailOut;
}

const PIPELINE = [
  { code: "PICKING" },
  { code: "CHECKED" },
  { code: "CLOSED" },
] as const;

const STEP_INDEX: Record<string, number> = Object.fromEntries(
  PIPELINE.map((s, i) => [s.code, i]),
);

function StatusPipelineCard({ statusCode }: { statusCode: string }) {
  const { map: statusLabels } = usePickNoteStatuses();
  const currentIndex = STEP_INDEX[statusCode.toUpperCase()] ?? -1;

  return (
    <Card>
      <CardContent className="py-4">
        <ol className="flex items-center">
          {PIPELINE.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            const isLast = index === PIPELINE.length - 1;
            return (
              <Fragment key={step.code}>
                <li className="flex shrink-0 flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-all",
                      isCompleted && "bg-primary/15 text-primary",
                      isActive && "bg-primary text-primary-foreground shadow-sm",
                      !isCompleted && !isActive && "bg-muted text-muted-foreground/50",
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium whitespace-nowrap",
                      isActive && "text-primary font-semibold",
                      isCompleted && "text-primary/70",
                      !isCompleted && !isActive && "text-muted-foreground/40",
                    )}
                  >
                    {statusLabels.get(step.code) ?? step.code}
                  </span>
                </li>
                {!isLast && (
                  <div
                    className={cn(
                      "mb-5 h-px flex-1 mx-2 transition-colors",
                      index < currentIndex ? "bg-primary/25" : "bg-border",
                    )}
                  />
                )}
              </Fragment>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-[13px]">{value || <span className="text-muted-foreground/50">—</span>}</p>
    </div>
  );
}

export function PickNoteContent({ pickNote }: PickNoteContentProps) {
  const { data: warehousesData } = useWarehouses();
  const { data: workersData } = useWarehouseWorkers();
  const { data: articlesData } = useArticles({ limit: 200 });
  const workers = workersData?.items ?? [];

  const locationGuids = [
    pickNote.shipping_location_guid,
    pickNote.billing_location_guid,
  ].filter(Boolean) as string[];
  const { data: locationsMap } = useLocationsMap(locationGuids);

  const warehouse = (warehousesData ?? []).find((w) => w.guid === pickNote.warehouse_guid);
  const picker = pickNote.picker_guid ? workers.find((w) => w.guid === pickNote.picker_guid) : null;
  const checker = pickNote.checker_guid ? workers.find((w) => w.guid === pickNote.checker_guid) : null;

  const articleMap = new Map((articlesData?.items ?? []).map((a) => [a.guid, a]));

  const shippingLoc = pickNote.shipping_location_guid
    ? locationsMap?.get(pickNote.shipping_location_guid)
    : null;
  const billingLoc = pickNote.billing_location_guid
    ? locationsMap?.get(pickNote.billing_location_guid)
    : null;

  return (
    <div className="space-y-5">
      {/* Pipeline stato */}
      <StatusPipelineCard statusCode={pickNote.status_code} />

      <div className="flex gap-5">
        {/* Colonna principale */}
        <div className="min-w-0 flex-1 space-y-5">
          {/* Righe prelievo */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-[15px] font-semibold">Righe Prelievo</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {pickNote.rows.length}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {pickNote.rows.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-muted-foreground">
                  Nessuna riga in questa nota di prelievo.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-7 px-2 text-left text-foreground/60">Articolo</TableHead>
                      <TableHead className="h-7 w-24 px-2 text-right text-foreground/60">Quantità</TableHead>
                      <TableHead className="h-7 w-28 px-2 text-right text-foreground/60">Origine</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pickNote.rows.map((row) => {
                      const article = articleMap.get(row.article_guid);
                      return (
                        <TableRow key={row.guid}>
                          <TableCell className="px-2 py-2.5">
                            <div>
                              <p className="text-[13px] font-medium leading-tight">
                                {article?.description ?? row.article_guid.slice(0, 8)}
                              </p>
                              {article && (
                                <p className="text-[11px] text-muted-foreground">{article.code}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-2 py-2.5 text-right text-[13px] font-medium tabular-nums">
                            {parseFloat(row.quantity)}
                          </TableCell>
                          <TableCell className="px-2 py-2.5 text-right">
                            <Badge
                              variant={row.source_type_code === "COMMITMENT" ? "default" : "secondary"}
                              className="text-[10px]"
                            >
                              {row.source_type_code === "COMMITMENT"
                                ? "Impegno"
                                : row.source_type_code === "STOCK"
                                ? "Stock"
                                : row.source_type_code}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Riepilogo */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">Righe</p>
                  <p className="text-sm font-semibold tabular-nums">{pickNote.rows.length}</p>
                </div>
                {pickNote.weight != null && (
                  <>
                    <div className="h-8 w-px bg-border/60" />
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground">Peso</p>
                      <p className="text-sm font-semibold tabular-nums">{pickNote.weight} kg</p>
                    </div>
                  </>
                )}
                {pickNote.packages != null && (
                  <>
                    <div className="h-8 w-px bg-border/60" />
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground">Colli</p>
                      <p className="text-sm font-semibold tabular-nums">{pickNote.packages}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-72 shrink-0 space-y-4">
          {/* Operatori e magazzino */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-[15px] font-semibold">Logistica</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field label="Magazzino" value={warehouse?.description} />
              <div className="border-t border-border/40 pt-3">
                <Field
                  label="Operatore"
                  value={picker ? `${picker.name} ${picker.surname}` : null}
                />
              </div>
              {checker && (
                <div className="border-t border-border/40 pt-3">
                  <Field
                    label="Verificatore"
                    value={`${checker.name} ${checker.surname}`}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Indirizzi */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-[15px] font-semibold">Indirizzi</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressBox
                label="Spedizione"
                typeCode="SHIPPING"
                addressLine={shippingLoc?.address_line}
                secondaryLine={[shippingLoc?.city, shippingLoc?.province].filter(Boolean).join(", ") || null}
              />
              <AddressBox
                label="Fatturazione"
                typeCode="BILLING"
                addressLine={billingLoc?.address_line}
                secondaryLine={[billingLoc?.city, billingLoc?.province].filter(Boolean).join(", ") || null}
              />
            </CardContent>
          </Card>

          {/* Ordine collegato */}
          {pickNote.order_guid && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-[15px] font-semibold">Ordine</h2>
                </div>
              </CardHeader>
              <CardContent>
                <a
                  href={`/orders/${pickNote.order_guid}`}
                  className="text-[13px] font-medium text-primary hover:underline"
                >
                  #{pickNote.order_guid.slice(0, 8).toUpperCase()}
                </a>
              </CardContent>
            </Card>
          )}

          {/* Note */}
          {pickNote.note && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-[15px] font-semibold">Note</h2>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[13px] text-muted-foreground">{pickNote.note}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
