import { useState, useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { LOOKUP_CONFIGS } from "../api/admin.api";
import { LookupTable } from "../components/lookup-table";

export function AdminPage() {
  const [activeKey, setActiveKey] = useState(LOOKUP_CONFIGS[0].key);

  const groups = useMemo(() => {
    const map = new Map<string, typeof LOOKUP_CONFIGS>();
    for (const cfg of LOOKUP_CONFIGS) {
      const arr = map.get(cfg.group) ?? [];
      arr.push(cfg);
      map.set(cfg.group, arr);
    }
    return Array.from(map.entries());
  }, []);

  const activeCfg = LOOKUP_CONFIGS.find((c) => c.key === activeKey)!;

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
            {groups.map(([group, items]) => (
              <div key={group}>
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {group}
                </p>
                <div className="space-y-0.5">
                  {items.map((cfg) => (
                    <button
                      key={cfg.key}
                      type="button"
                      onClick={() => setActiveKey(cfg.key)}
                      className={cn(
                        "flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors",
                        activeKey === cfg.key
                          ? "bg-primary/[0.08] text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {cfg.label}
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
            <h2 className="text-[15px] font-semibold">{activeCfg.label}</h2>
            <p className="text-[12px] text-muted-foreground">
              Codice e descrizione per la tabella{" "}
              <span className="font-mono text-[11px]">{activeCfg.path}</span>
            </p>
          </CardHeader>
          <CardContent>
            <LookupTable key={activeKey} lookupKey={activeKey} path={activeCfg.path} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
