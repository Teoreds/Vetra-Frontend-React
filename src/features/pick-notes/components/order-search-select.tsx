import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2, X } from "lucide-react";
import { useOrders } from "@/features/orders/hooks/use-orders";
import { useParties } from "@/features/parties/hooks/use-parties";
import { StatusBadge, getStatusVariant } from "@/shared/ui/status-badge";
import { getStatusLabel } from "@/features/orders/types/order-status";
import { formatDate } from "@/shared/lib/utils";
import { cn } from "@/shared/lib/utils";

interface OrderSearchSelectProps {
  value?: string;
  onChange: (orderGuid: string) => void;
  disabled?: boolean;
}

export function OrderSearchSelect({ value, onChange, disabled }: OrderSearchSelectProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useOrders(
    search.trim().length >= 1 ? { search: search.trim(), limit: 20 } : { limit: 20 },
  );
  const orders = data?.items ?? [];

  const { data: partiesData } = useParties({ limit: 200 });
  const partyMap = new Map<string, string>();
  if (partiesData?.items) {
    for (const p of partiesData.items) {
      partyMap.set(p.guid, p.description ?? p.guid.slice(0, 8));
    }
  }

  // Resolve selected order for display
  const selectedOrder = value ? orders.find((o) => o.guid === value) : null;
  const { data: allOrders } = useOrders(value && !selectedOrder ? { limit: 200 } : undefined);
  const resolvedOrder = selectedOrder ?? (value ? (allOrders?.items ?? []).find((o) => o.guid === value) : null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  useEffect(() => {
    setFocusedIndex(0);
  }, [orders.length]);

  const confirmSelection = useCallback(
    (orderGuid: string) => {
      onChange(orderGuid);
      setSearch("");
      setOpen(false);
    },
    [onChange],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, orders.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (orders[focusedIndex]) confirmSelection(orders[focusedIndex].guid);
        break;
      case "Escape":
        setOpen(false);
        setSearch("");
        break;
    }
  }

  if (disabled) {
    return (
      <div className="flex h-9 w-full items-center rounded-lg border border-border/60 bg-muted/40 px-3 text-[13px] text-muted-foreground cursor-not-allowed opacity-50">
        {resolvedOrder
          ? `#${resolvedOrder.guid.slice(0, 8).toUpperCase()} · ${formatDate(resolvedOrder.order_date)}`
          : value
            ? `#${value.slice(0, 8).toUpperCase()}`
            : "Nessun ordine"}
      </div>
    );
  }

  const showSelected = !!value && !open;

  return (
    <div ref={containerRef} className="relative w-full">
      {showSelected ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setSearch("");
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-lg border border-border/60 bg-background px-3 text-[13px] text-left outline-none transition-all",
            "hover:border-border focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20",
          )}
        >
          <span className="truncate">
            {resolvedOrder ? (
              <span className="flex items-center gap-2">
                <span className="font-semibold text-primary">
                  #{resolvedOrder.guid.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-muted-foreground">·</span>
                <span>{partyMap.get(resolvedOrder.party_guid) ?? ""}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{formatDate(resolvedOrder.order_date)}</span>
              </span>
            ) : (
              `#${value!.slice(0, 8).toUpperCase()}`
            )}
          </span>
          <X
            className="h-3.5 w-3.5 shrink-0 text-muted-foreground hover:text-foreground"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange("");
              setSearch("");
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
          />
        </button>
      ) : (
        <div
          className={cn(
            "flex h-9 items-center gap-2 rounded-lg border bg-background px-3 transition-all",
            open
              ? "border-primary ring-2 ring-ring/20"
              : "border-border/60 hover:border-border",
          )}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Cerca ordine…"
            className="article-search-input flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      )}

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-border bg-popover shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          {orders.length === 0 && !isLoading && (
            <p className="px-3 py-4 text-center text-[13px] text-muted-foreground">
              {search.trim().length >= 1
                ? "Nessun ordine trovato."
                : "Digita per cercare ordini."}
            </p>
          )}
          {orders.map((order, index) => (
            <button
              key={order.guid}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                confirmSelection(order.guid);
              }}
              onMouseEnter={() => setFocusedIndex(index)}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                index === focusedIndex ? "bg-accent" : "hover:bg-accent/60",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-primary">
                    #{order.guid.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    {formatDate(order.order_date)}
                  </span>
                  <StatusBadge
                    variant={getStatusVariant(order.status_code)}
                    label={getStatusLabel(order.status_code)}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {partyMap.get(order.party_guid) ?? order.party_guid.slice(0, 8)}
                </p>
              </div>
              {order.guid === value && (
                <span className="text-[11px] text-primary font-medium">Selezionato</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
