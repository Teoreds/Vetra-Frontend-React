import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface SearchableSelectItem {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  items: SearchableSelectItem[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  items,
  value,
  onChange,
  placeholder = "Cerca…",
  disabled,
}: SearchableSelectProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(
      (item) =>
        item.value.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q),
    );
  }, [items, search]);

  const selectedItem = value ? items.find((i) => i.value === value) : null;

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Reset focused index when filtered results change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setFocusedIndex(0); }, [filtered.length]);

  const confirmSelection = useCallback(
    (val: string) => {
      onChange(val);
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
        setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[focusedIndex]) confirmSelection(filtered[focusedIndex].value);
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
        {selectedItem?.label ?? "—"}
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
          <span className="truncate">{selectedItem?.label ?? value}</span>
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
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      )}

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-border bg-popover shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-center text-[13px] text-muted-foreground">
              Nessun risultato.
            </p>
          )}
          {filtered.map((item, index) => (
            <button
              key={item.value}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                confirmSelection(item.value);
              }}
              onMouseEnter={() => setFocusedIndex(index)}
              className={cn(
                "flex w-full items-center px-3 py-2 text-left text-[13px] transition-colors",
                index === focusedIndex ? "bg-accent" : "hover:bg-accent/60",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
