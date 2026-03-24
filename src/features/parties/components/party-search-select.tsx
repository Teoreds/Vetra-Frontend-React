import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2, X } from "lucide-react";
import { useParties } from "../hooks/use-parties";
import { cn } from "@/shared/lib/utils";

interface PartySearchSelectProps {
  value?: string;
  onChange: (partyGuid: string) => void;
  disabled?: boolean;
  typeCode?: string;
}

export function PartySearchSelect({ value, onChange, disabled, typeCode }: PartySearchSelectProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch parties matching the search term
  const { data, isLoading } = useParties(
    search.trim().length >= 1
      ? { search: search.trim(), limit: 20, ...(typeCode ? { type_code: typeCode } : {}) }
      : { limit: 20, ...(typeCode ? { type_code: typeCode } : {}) },
  );
  const parties = data?.items ?? [];

  // Resolve selected party name for display
  const { data: selectedData } = useParties(value ? { limit: 200, ...(typeCode ? { type_code: typeCode } : {}) } : undefined);
  const selectedParty = value
    ? (selectedData?.items ?? []).find((p) => p.guid === value)
    : null;

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setFocusedIndex(0); }, [parties.length]);

  const confirmSelection = useCallback(
    (partyGuid: string) => {
      onChange(partyGuid);
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
        setFocusedIndex((i) => Math.min(i + 1, parties.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (parties[focusedIndex]) confirmSelection(parties[focusedIndex].guid);
        break;
      case "Escape":
        setOpen(false);
        setSearch("");
        break;
    }
  }

  // When disabled, show a simple read-only display
  if (disabled) {
    return (
      <div className="flex h-9 w-full items-center rounded-lg border border-border/60 bg-muted/40 px-3 text-[13px] text-muted-foreground cursor-not-allowed opacity-50">
        {selectedParty?.description ?? (value ? `#${value.slice(0, 8)}` : "Nessun cliente")}
      </div>
    );
  }

  // If a party is selected and the input is not focused/open, show the selected value
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
          <span className="truncate">{selectedParty?.description ?? `#${value.slice(0, 8)}`}</span>
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
            placeholder="Cerca cliente…"
            className="article-search-input flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      )}

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-border bg-popover shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          {parties.length === 0 && !isLoading && (
            <p className="px-3 py-4 text-center text-[13px] text-muted-foreground">
              {search.trim().length >= 1
                ? "Nessun cliente trovato."
                : "Digita per cercare clienti."}
            </p>
          )}
          {parties.map((party, index) => (
            <button
              key={party.guid}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                confirmSelection(party.guid);
              }}
              onMouseEnter={() => setFocusedIndex(index)}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                index === focusedIndex ? "bg-accent" : "hover:bg-accent/60",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{party.description}</p>
                {party.vat_number && (
                  <p className="text-[11px] text-muted-foreground">P.IVA {party.vat_number}</p>
                )}
              </div>
              {party.guid === value && (
                <span className="text-[11px] text-primary font-medium">Selezionato</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
