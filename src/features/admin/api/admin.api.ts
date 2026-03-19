import { apiClient } from "@/shared/api/client";
import type { paths } from "@/shared/api/schema";

type LookupPath =
  | "/party-types"
  | "/party-categories"
  | "/location-types"
  | "/contact-types"
  | "/fiscal-areas"
  | "/article-types"
  | "/unit-of-measures"
  | "/payment-method-types"
  | "/order-statuses"
  | "/order-row-availability-statuses"
  | "/pick-note-statuses"
  | "/commitment-statuses"
  | "/document-types"
  | "/log-action-types";

type LookupDetailPath =
  | "/party-types/{code}"
  | "/party-categories/{code}"
  | "/location-types/{code}"
  | "/contact-types/{code}"
  | "/fiscal-areas/{code}"
  | "/article-types/{code}"
  | "/unit-of-measures/{code}"
  | "/payment-method-types/{code}"
  | "/order-statuses/{code}"
  | "/order-row-availability-statuses/{code}"
  | "/pick-note-statuses/{code}"
  | "/commitment-statuses/{code}"
  | "/document-types/{code}"
  | "/log-action-types/{code}";

const detailPaths: Record<LookupPath, LookupDetailPath> = {
  "/party-types": "/party-types/{code}",
  "/party-categories": "/party-categories/{code}",
  "/location-types": "/location-types/{code}",
  "/contact-types": "/contact-types/{code}",
  "/fiscal-areas": "/fiscal-areas/{code}",
  "/article-types": "/article-types/{code}",
  "/unit-of-measures": "/unit-of-measures/{code}",
  "/payment-method-types": "/payment-method-types/{code}",
  "/order-statuses": "/order-statuses/{code}",
  "/order-row-availability-statuses": "/order-row-availability-statuses/{code}",
  "/pick-note-statuses": "/pick-note-statuses/{code}",
  "/commitment-statuses": "/commitment-statuses/{code}",
  "/document-types": "/document-types/{code}",
  "/log-action-types": "/log-action-types/{code}",
};

export interface LookupItem {
  code: string;
  description: string;
}

export function createLookupApi(basePath: LookupPath) {
  const detailPath = detailPaths[basePath];

  return {
    list: () =>
      apiClient.GET(basePath as "/party-types") as Promise<{
        data?: LookupItem[];
        error?: unknown;
      }>,

    create: (body: { code: string; description: string }) =>
      apiClient.POST(basePath as "/party-types", { body }) as Promise<{
        data?: LookupItem;
        error?: unknown;
      }>,

    update: (code: string, body: { description: string }) =>
      apiClient.PATCH(detailPath as "/party-types/{code}", {
        params: { path: { code } },
        body,
      } as never) as Promise<{
        data?: LookupItem;
        error?: unknown;
      }>,

    delete: (code: string) =>
      apiClient.DELETE(detailPath as "/party-types/{code}", {
        params: { path: { code } },
      } as never) as Promise<{
        data?: unknown;
        error?: unknown;
      }>,
  };
}

export type LookupApi = ReturnType<typeof createLookupApi>;

export const LOOKUP_CONFIGS: {
  key: string;
  label: string;
  path: LookupPath;
  group: string;
}[] = [
  { key: "party-types", label: "Tipi Anagrafica", path: "/party-types", group: "Anagrafica" },
  { key: "party-categories", label: "Categorie Anagrafica", path: "/party-categories", group: "Anagrafica" },
  { key: "location-types", label: "Tipi Sede", path: "/location-types", group: "Anagrafica" },
  { key: "contact-types", label: "Tipi Contatto", path: "/contact-types", group: "Anagrafica" },
  { key: "fiscal-areas", label: "Aree Fiscali", path: "/fiscal-areas", group: "Anagrafica" },
  { key: "article-types", label: "Tipi Articolo", path: "/article-types", group: "Articoli" },
  { key: "unit-of-measures", label: "Unità di Misura", path: "/unit-of-measures", group: "Articoli" },
  { key: "payment-method-types", label: "Tipi Metodo Pagamento", path: "/payment-method-types", group: "Pagamenti" },
  { key: "order-statuses", label: "Stati Ordine", path: "/order-statuses", group: "Ordini" },
  { key: "order-row-availability-statuses", label: "Stati Disponibilità Riga", path: "/order-row-availability-statuses", group: "Ordini" },
  { key: "pick-note-statuses", label: "Stati Nota Prelievo", path: "/pick-note-statuses", group: "Logistica" },
  { key: "commitment-statuses", label: "Stati Impegno", path: "/commitment-statuses", group: "Logistica" },
  { key: "document-types", label: "Tipi Documento", path: "/document-types", group: "Documenti" },
  { key: "log-action-types", label: "Tipi Azione Log", path: "/log-action-types", group: "Sistema" },
];
