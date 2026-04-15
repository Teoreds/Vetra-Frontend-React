import { useState } from "react";
import { Copy, Check, Pencil } from "lucide-react";

interface AddressBoxProps {
  label: string;
  typeCode: string;
  addressLine?: string | null;
  secondaryLine?: string | null;
  isPrimary?: boolean;
  isLoading?: boolean;
  onEdit?: () => void;
}

export function AddressBox({
  label,
  typeCode: _typeCode,
  addressLine,
  secondaryLine,
  isPrimary,
  isLoading,
  onEdit,
}: AddressBoxProps) {
  const [copied, setCopied] = useState(false);

  const addressText = addressLine
    ? [addressLine, secondaryLine].filter(Boolean).join(", ")
    : null;

  function handleCopy() {
    if (!addressText) return;
    navigator.clipboard.writeText(addressText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="group relative rounded-lg border border-border/40 px-3 pt-2.5 pb-2.5">
      <div className="absolute -top-[9px] left-3 flex items-center gap-1 bg-card px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {isPrimary && (
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
        )}
      </div>
      <div className="absolute -top-[9px] right-2 flex items-center gap-0.5 bg-card px-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!addressText || isLoading}
          className="flex h-4 w-4 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:text-muted-foreground disabled:pointer-events-none"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </button>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex h-4 w-4 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:text-muted-foreground"
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="text-[13px]">
        {isLoading ? (
          <div className="mt-0.5 h-3.5 w-40 animate-pulse rounded bg-muted" />
        ) : addressLine ? (
          <>
            <p className="truncate">{addressLine}</p>
            {secondaryLine && (
              <p className="truncate text-muted-foreground">{secondaryLine}</p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground/50">—</p>
        )}
      </div>
    </div>
  );
}
