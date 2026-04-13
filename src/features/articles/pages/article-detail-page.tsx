import { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Trash2, Loader2, Package, Users, Pencil, ShoppingCart } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { BackButton } from "@/shared/ui/back-button";
import { StickyHeader } from "@/shared/ui/sticky-header";
import { TabBar, TabTrigger } from "@/shared/ui/tab-bar";
import { useBack } from "@/shared/hooks/use-back";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { articlesApi } from "../api/articles.api";
import { articleKeys } from "../api/articles.queries";
import { useArticleTypes, useUnitOfMeasures } from "../hooks/use-article-lookups";
import { useParties } from "@/features/parties/hooks/use-parties";
import { AuthImage } from "@/shared/ui/auth-image";
import { ArticleOrdersTab } from "../components/article-orders-tab";

function fmtPrice(v: string | number | null) {
  if (v == null) return "\u2014";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(v));
}

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const back = useBack();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: articles, isLoading } = useQuery({
    queryKey: articleKeys.detail(id!),
    queryFn: async () => {
      const { data, error } = await articlesApi.list({ search: id, limit: 1 });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const article = articles?.items?.[0];

  const { data: articleTypes = [] } = useArticleTypes();
  const typeMap = new Map(articleTypes.map((t) => [t.code, t.description]));
  const { data: unitOfMeasures = [] } = useUnitOfMeasures();
  const uomMap = new Map(unitOfMeasures.map((u) => [u.code, u.description]));

  const { data: suppliersData } = useQuery({
    queryKey: articleKeys.suppliers(article?.guid ?? ""),
    queryFn: async () => {
      const { data, error } = await articlesApi.listSuppliers(article!.guid);
      if (error) throw error;
      return data;
    },
    enabled: !!article?.guid,
  });
  const suppliers = suppliersData ?? [];

  const { data: partiesData } = useParties({ limit: 200 });
  const partyMap = new Map(
    (partiesData?.items ?? []).map((p) => [p.guid, p.description]),
  );

  const { data: ordersData } = useQuery({
    queryKey: articleKeys.orders(article?.guid ?? "", { limit: 3 }),
    queryFn: () => articlesApi.listOrders(article!.guid, { limit: 3 }),
    enabled: !!article?.guid,
  });

  const uploadImage = useMutation({
    mutationFn: (file: File) => articlesApi.uploadImage(article!.guid, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(id!) });
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
    },
  });

  const deleteImage = useMutation({
    mutationFn: () =>
      articlesApi.deleteImage(article!.guid).then(({ error }) => {
        if (error) throw error;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(id!) });
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage.mutate(file);
    e.target.value = "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-[length:var(--text-body)] text-muted-foreground">Articolo non trovato.</p>
        <Button variant="ghost" size="sm" onClick={() => back("/articles")}>
          Torna agli articoli
        </Button>
      </div>
    );
  }

  const isBusy = uploadImage.isPending || deleteImage.isPending;

  return (
    <Tabs.Root defaultValue="articolo" className="flex flex-col">
      <StickyHeader>
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton fallback="/articles" />

            {/* Avatar */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <div className="group/avatar relative h-11 w-11 shrink-0">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => fileInputRef.current?.click()}
                className="relative h-full w-full overflow-hidden rounded-xl border border-border/60 bg-muted/50 transition-colors hover:border-primary/40"
              >
                {article.image_path ? (
                  <AuthImage
                    src={`/articles/${article.guid}/image`}
                    alt={article.description}
                    className="h-full w-full"
                    fallbackClassName="h-full w-full"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                )}
                {isBusy ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/avatar:bg-black/40">
                    <ImagePlus className="h-3.5 w-3.5 text-white opacity-0 transition-opacity group-hover/avatar:opacity-100" />
                  </div>
                )}
              </button>
              {article.image_path && !isBusy && (
                <button
                  type="button"
                  onClick={() => deleteImage.mutate()}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 shadow-sm transition-opacity group-hover/avatar:opacity-100"
                  title="Rimuovi foto"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              )}
            </div>

            <div>
              <h1 className="text-[length:var(--text-page-title)] font-bold tracking-tight leading-none">{article.code}</h1>
              <span className="text-[length:var(--text-caption)] text-muted-foreground">{article.description}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button size="sm" onClick={() => navigate(`/articles/${article.code}/edit`)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Modifica
            </Button>
          </div>
        </div>

        <TabBar className="mx-auto max-w-4xl mt-3">
          <TabTrigger value="articolo">Articolo</TabTrigger>
          <TabTrigger value="ordini">Ordini</TabTrigger>
        </TabBar>
      </StickyHeader>

      {/* Tab content */}
      <div className="mx-auto w-full max-w-4xl pt-6">
        <Tabs.Content value="articolo">
          <div className="flex gap-5">
            {/* Main column */}
            <div className="min-w-0 flex-1 space-y-5">
              {/* Dettagli */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-[15px] font-semibold">Dettagli Articolo</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2.5">
                    <div className="flex justify-between py-1.5">
                      <dt className="text-[length:var(--text-body)] text-muted-foreground">Codice</dt>
                      <dd className="font-mono text-[length:var(--text-body)] font-medium">{article.code}</dd>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <dt className="text-[length:var(--text-body)] text-muted-foreground">Descrizione</dt>
                      <dd className="text-right text-[length:var(--text-body)] font-medium">{article.description}</dd>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <dt className="text-[length:var(--text-body)] text-muted-foreground">Tipo</dt>
                      <dd className="text-[length:var(--text-body)] font-medium">
                        {article.type_code ? typeMap.get(article.type_code) ?? article.type_code : "\u2014"}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <dt className="text-[length:var(--text-body)] text-muted-foreground">Unità di Misura</dt>
                      <dd className="text-[length:var(--text-body)] font-medium">{uomMap.get(article.unit_of_measure_code) ?? article.unit_of_measure_code}</dd>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <dt className="text-[length:var(--text-body)] text-muted-foreground">Prezzo di Listino</dt>
                      <dd className="text-[length:var(--text-body)] font-medium tabular-nums">{fmtPrice(article.list_price)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Fornitori */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-[15px] font-semibold">Fornitori</h2>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[length:var(--text-caption)] font-semibold text-muted-foreground">
                      {suppliers.length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {suppliers.length === 0 ? (
                    <p className="py-6 text-center text-[length:var(--text-body)] text-muted-foreground">
                      Nessun fornitore associato.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-7 px-2 text-left text-foreground/60">Fornitore</TableHead>
                          <TableHead className="h-7 w-32 px-2 text-left text-foreground/60">Codice</TableHead>
                          <TableHead className="h-7 w-28 px-2 text-right text-foreground/60">Prezzo</TableHead>
                          <TableHead className="h-7 w-20 px-2 text-center text-foreground/60">Pref.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {suppliers.map((s) => (
                          <TableRow key={s.party_guid}>
                            <TableCell className="px-2 py-2.5 text-[length:var(--text-body)] font-medium">
                              {partyMap.get(s.party_guid) ?? s.party_guid.slice(0, 8)}
                            </TableCell>
                            <TableCell className="px-2 py-2.5 font-mono text-[length:var(--text-caption)] text-muted-foreground">
                              {s.supplier_code || "\u2014"}
                            </TableCell>
                            <TableCell className="px-2 py-2.5 text-right text-[length:var(--text-body)] tabular-nums">
                              {fmtPrice(s.purchase_price)}
                            </TableCell>
                            <TableCell className="px-2 py-2.5 text-center text-[length:var(--text-body)]">
                              {s.is_preferred ? (
                                <span className="inline-flex items-center rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                  Sì
                                </span>
                              ) : (
                                <span className="text-muted-foreground">\u2014</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="w-72 shrink-0 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-[15px] font-semibold">Informazioni</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-0.5">
                    <p className="text-[length:var(--text-caption)] font-medium text-muted-foreground uppercase tracking-wide">Stato</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[length:var(--text-caption)] font-semibold leading-none tracking-wide ${
                        article.is_active
                          ? "bg-emerald-500/8 text-emerald-600"
                          : "bg-muted-foreground/8 text-muted-foreground"
                      }`}
                    >
                      {article.is_active ? "Attivo" : "Inattivo"}
                    </span>
                  </div>
                  <div className="border-t border-border/40 pt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="space-y-0.5">
                      <p className="text-[length:var(--text-caption)] font-medium text-muted-foreground uppercase tracking-wide">Tipo</p>
                      <p className="text-[length:var(--text-body)]">
                        {article.type_code ? typeMap.get(article.type_code) ?? article.type_code : <span className="text-muted-foreground/50">—</span>}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[length:var(--text-caption)] font-medium text-muted-foreground uppercase tracking-wide">U.M.</p>
                      <p className="text-[length:var(--text-body)]">{uomMap.get(article.unit_of_measure_code) ?? article.unit_of_measure_code}</p>
                    </div>
                    <div className="space-y-0.5 col-span-2">
                      <p className="text-[length:var(--text-caption)] font-medium text-muted-foreground uppercase tracking-wide">Prezzo di Listino</p>
                      <p className="text-[length:var(--text-body)] font-semibold tabular-nums">{fmtPrice(article.list_price)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-[15px] font-semibold">Ultimi Ordini</h2>
                    {ordersData && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[length:var(--text-caption)] font-semibold text-muted-foreground">
                        {ordersData.total}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!ordersData ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/40" />
                    </div>
                  ) : ordersData.items.length === 0 ? (
                    <p className="py-4 text-center text-[length:var(--text-body)] text-muted-foreground">
                      Nessun ordine trovato.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {ordersData.items.map((order) => (
                        <button
                          key={order.guid}
                          type="button"
                          onClick={() => navigate(`/orders/${order.guid}`)}
                          className="w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                        >
                          <p className="text-[length:var(--text-body)] font-medium leading-tight truncate">
                            {partyMap.get(order.party_guid) ?? order.party_guid.slice(0, 8)}
                          </p>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <span className="text-[length:var(--text-caption)] text-muted-foreground">
                              {new Date(order.order_date).toLocaleDateString("it-IT")}
                            </span>
                            <span className="text-[12px] font-semibold tabular-nums">
                              {order.total_gross != null
                                ? new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(Number(order.total_gross))
                                : "—"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="ordini">
          <ArticleOrdersTab articleGuid={article.guid} />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
}
