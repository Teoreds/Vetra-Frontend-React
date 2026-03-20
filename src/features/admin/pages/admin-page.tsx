import { useState, useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { LOOKUP_CONFIGS } from "../api/admin.api";
import { LookupTable } from "../components/lookup-table";
import { PaymentMethodsTable } from "../components/payment-methods-table";
import { PaymentTermsTable } from "../components/payment-terms-table";

const PAYMENT_METHODS_KEY = "payment-methods-crud";
const PAYMENT_TERMS_KEY = "payment-terms-crud";

interface SidebarItem {
  key: string;
  label: string;
}

interface SidebarGroup {
  group: string;
  items: SidebarItem[];
}

const CUSTOM_DESCRIPTIONS: Record<string, { title: string; subtitle: string }> = {
  [PAYMENT_METHODS_KEY]: {
    title: "Metodi di Pagamento",
    subtitle: "Gestisci i metodi di pagamento disponibili (es. Ri.Ba., Bonifico, Contrassegno).",
  },
  [PAYMENT_TERMS_KEY]: {
    title: "Condizioni di Pagamento",
    subtitle: "Codice, descrizione e rate per le condizioni di pagamento.",
  },
};

export function AdminPage() {
  const [activeKey, setActiveKey] = useState(LOOKUP_CONFIGS[0].key);

  const groups = useMemo<SidebarGroup[]>(() => {
    const map = new Map<string, SidebarItem[]>();
    for (const cfg of LOOKUP_CONFIGS) {
      const arr = map.get(cfg.group) ?? [];
      arr.push({ key: cfg.key, label: cfg.label });
      map.set(cfg.group, arr);
    }
    // Add custom entries to Pagamenti group
    const pagamenti = map.get("Pagamenti") ?? [];
    pagamenti.push({ key: PAYMENT_METHODS_KEY, label: "Metodi di Pagamento" });
    pagamenti.push({ key: PAYMENT_TERMS_KEY, label: "Condizioni di Pagamento" });
    map.set("Pagamenti", pagamenti);

    return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
  }, []);

  const activeLookup = LOOKUP_CONFIGS.find((c) => c.key === activeKey);
  const customDesc = CUSTOM_DESCRIPTIONS[activeKey];

  const title = customDesc?.title ?? activeLookup?.label ?? "";
  const subtitle = customDesc?.subtitle ?? `Codice e descrizione per la tabella ${activeLookup?.path ?? ""}`;

  function renderContent() {
    if (activeKey === PAYMENT_METHODS_KEY) return <PaymentMethodsTable />;
    if (activeKey === PAYMENT_TERMS_KEY) return <PaymentTermsTable />;
    if (activeLookup) return <LookupTable key={activeKey} lookupKey={activeKey} path={activeLookup.path} />;
    return null;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Centro di Controllo</h1>
          <p className="text-[13px] text-muted-foreground">
            Gestisci le tabelle di configurazione del sistema.
          </p>
        </div>
      </div>

      {/* Layout: sidebar + content */}
      <div className="flex gap-5">
        {/* Sidebar navigation */}
        <Card className="w-56 shrink-0 self-start">
          <CardContent className="p-3 space-y-3">
            {groups.map(({ group, items }) => (
              <div key={group}>
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {group}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveKey(item.key)}
                      className={cn(
                        "flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors",
                        activeKey === item.key
                          ? "bg-primary/[0.08] text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="min-w-0 flex-1">
          <CardHeader>
            <h2 className="text-[15px] font-semibold">{title}</h2>
            <p className="text-[12px] text-muted-foreground">{subtitle}</p>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
