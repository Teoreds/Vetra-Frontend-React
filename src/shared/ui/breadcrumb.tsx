import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  orders: "Ordini",
  new: "Nuovo Ordine",
  parties: "Anagrafica",
  articles: "Articoli",
  warehouses: "Magazzino",
  settings: "Impostazioni",
  support: "Supporto",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function labelFor(segment: string): string {
  if (UUID_RE.test(segment)) return "Dettaglio";
  return SEGMENT_LABELS[segment] ?? segment;
}

export function Breadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px]">
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const path = "/" + segments.slice(0, index + 1).join("/");

        return (
          <span key={path} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            )}
            {isLast ? (
              <span className="font-medium text-foreground">
                {labelFor(segment)}
              </span>
            ) : (
              <Link
                to={path}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {labelFor(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
