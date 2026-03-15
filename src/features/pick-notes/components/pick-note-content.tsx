import { Warehouse, MapPin, Package, User, StickyNote, FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Badge } from "@/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { useWarehouses } from "@/features/warehouses/hooks/use-warehouses";
import { useWarehouseWorkers } from "@/features/warehouses/hooks/use-warehouse-workers";
import { useArticles } from "@/features/articles/hooks/use-articles";
import { useLocationsMap } from "@/features/parties/hooks/use-locations-map";
import type { PickNoteDetailOut } from "../types/pick-note.types";

interface PickNoteContentProps {
  pickNote: PickNoteDetailOut;
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-right text-[13px] font-medium">
        {value || "\u2014"}
      </span>
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

  const warehouse = (warehousesData ?? []).find(
    (w) => w.guid === pickNote.warehouse_guid,
  );

  const picker = pickNote.picker_guid
    ? workers.find((w) => w.guid === pickNote.picker_guid)
    : null;
  const checker = pickNote.checker_guid
    ? workers.find((w) => w.guid === pickNote.checker_guid)
    : null;

  const articleMap = new Map(
    (articlesData?.items ?? []).map((a) => [a.guid, a]),
  );

  const shippingLoc = pickNote.shipping_location_guid
    ? locationsMap?.get(pickNote.shipping_location_guid)
    : null;
  const billingLoc = pickNote.billing_location_guid
    ? locationsMap?.get(pickNote.billing_location_guid)
    : null;

  function fmtLoc(loc: { address_line: string | null; city: string | null; province: string | null } | null | undefined) {
    if (!loc) return null;
    const parts = [loc.address_line, loc.city, loc.province].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  }

  return (
    <div className="flex gap-5">
      {/* Main column: rows table */}
      <div className="min-w-0 flex-1 space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Righe Prelievo
              </h3>
              <Badge variant="secondary" className="text-[10px]">
                {pickNote.rows.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {pickNote.rows.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-muted-foreground">
                Nessuna riga in questa nota di prelievo.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-7 px-2 text-left text-foreground/60">Articolo</TableHead>
                    <TableHead className="h-7 w-24 px-2 text-right text-foreground/60">Quantit&agrave;</TableHead>
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
                            <p className="text-[12px] font-medium leading-tight">
                              {article?.description ?? row.article_guid.slice(0, 8)}
                            </p>
                            {article && (
                              <p className="text-[11px] text-muted-foreground">
                                {article.code}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-2 py-2.5 text-right text-[12px] font-medium tabular-nums">
                          {parseFloat(row.quantity)}
                        </TableCell>
                        <TableCell className="px-2 py-2.5 text-right">
                          <Badge
                            variant={row.source_type_code === "COMMITMENT" ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {row.source_type_code === "COMMITMENT" ? "Impegno" : row.source_type_code === "STOCK" ? "Stock" : row.source_type_code}
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

        {/* Summary row */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Righe</p>
                <p className="text-[14px] font-semibold tabular-nums">{pickNote.rows.length}</p>
              </div>
              {pickNote.weight != null && (
                <>
                  <div className="h-8 w-px bg-border/60" />
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">Peso</p>
                    <p className="text-[14px] font-semibold tabular-nums">{pickNote.weight} kg</p>
                  </div>
                </>
              )}
              {pickNote.packages != null && (
                <>
                  <div className="h-8 w-px bg-border/60" />
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">Colli</p>
                    <p className="text-[14px] font-semibold tabular-nums">{pickNote.packages}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="w-72 shrink-0 space-y-4">
        <Card>
          <CardContent className="space-y-4 pt-5">
            {/* Magazzino */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Warehouse className="h-3.5 w-3.5 text-muted-foreground" />
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Magazzino
                </h4>
              </div>
              <p className="pl-[22px] text-[13px] font-medium">
                {warehouse?.description ?? "\u2014"}
              </p>
            </div>

            <Separator />

            {/* Operatore */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Operatore
                </h4>
              </div>
              <p className="pl-[22px] text-[13px]">
                {picker ? `${picker.name} ${picker.surname}` : "\u2014"}
              </p>
            </div>

            {checker && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Verificatore
                    </h4>
                  </div>
                  <p className="pl-[22px] text-[13px]">
                    {checker.name} {checker.surname}
                  </p>
                </div>
              </>
            )}

            {(shippingLoc || billingLoc) && (
              <>
                <Separator />
                {shippingLoc && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Spedizione
                      </h4>
                    </div>
                    <p className="pl-[22px] text-[13px]">
                      {fmtLoc(shippingLoc) ?? "Non specificato"}
                    </p>
                  </div>
                )}
                {shippingLoc && billingLoc && <Separator />}
                {billingLoc && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Fatturazione
                      </h4>
                    </div>
                    <p className="pl-[22px] text-[13px]">
                      {fmtLoc(billingLoc) ?? "Non specificato"}
                    </p>
                  </div>
                )}
              </>
            )}

            {pickNote.order_guid && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Ordine
                    </h4>
                  </div>
                  <a
                    href={`/orders/${pickNote.order_guid}`}
                    className="block pl-[22px] text-[13px] font-medium text-primary hover:underline"
                  >
                    #{pickNote.order_guid.slice(0, 8).toUpperCase()}
                  </a>
                </div>
              </>
            )}

            {pickNote.note && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Note
                    </h4>
                  </div>
                  <p className="pl-[22px] text-[13px] text-muted-foreground">
                    {pickNote.note}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
