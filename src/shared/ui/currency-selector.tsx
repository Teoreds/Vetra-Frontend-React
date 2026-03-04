import { cn } from "@/shared/lib/utils";
import { CURRENCIES, type Currency } from "@/shared/hooks/use-currency-rates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  className?: string;
}

export function CurrencySelector({ value, onChange, className }: CurrencySelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Currency)}>
      <SelectTrigger className={cn("w-[4.5rem] shrink-0", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
