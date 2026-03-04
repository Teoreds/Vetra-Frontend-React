import { useQuery } from "@tanstack/react-query";

export const CURRENCIES = ["EUR", "USD", "CNY"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  CNY: "¥",
};

async function fetchRates(): Promise<Record<Currency, number>> {
  const nonEur = CURRENCIES.filter((c) => c !== "EUR").join(",");
  const res = await fetch(`https://api.frankfurter.app/latest?from=EUR&to=${nonEur}`);
  if (!res.ok) throw new Error("Failed to fetch currency rates");
  const json = await res.json();
  return { EUR: 1, ...json.rates } as Record<Currency, number>;
}

export function useCurrencyRates() {
  return useQuery({
    queryKey: ["currency-rates"],
    queryFn: fetchRates,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
}

/** Convert an EUR amount to the target currency */
export function fromEur(amount: number, rates: Record<Currency, number>, to: Currency): number {
  return amount * (rates[to] ?? 1);
}

/** Convert an amount in a given currency back to EUR */
export function toEur(amount: number, rates: Record<Currency, number>, from: Currency): number {
  return amount / (rates[from] ?? 1);
}
