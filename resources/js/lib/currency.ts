export interface CurrencyDisplaySource {
  currency?: string | null;
  display_currency?: string | null;
  exchange_rate?: number | string | null;
}

const FALLBACK_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  GHS: "GH₵",
  KES: "KSh",
  ZAR: "R",
  GBP: "£",
  USD: "$",
  CAD: "CA$",
};

export function currencyCode(source?: CurrencyDisplaySource | null): string {
  const code = String(source?.display_currency || source?.currency || "NGN")
    .trim()
    .toUpperCase();

  return code || "NGN";
}

export function exchangeRateFromNgn(source?: CurrencyDisplaySource | null): number {
  const code = currencyCode(source);
  if (code === "NGN") {
    return 1;
  }

  const rate = Number(source?.exchange_rate ?? 1);

  return Number.isFinite(rate) && rate > 0 ? rate : 1;
}

export function convertFromNgn(
  amount: number,
  source?: CurrencyDisplaySource | null,
): number {
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return safeAmount * exchangeRateFromNgn(source);
}

export function formatMoney(amount: number, currency = "NGN"): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const safeCurrency = currency.trim().toUpperCase() || "NGN";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: Number.isInteger(safeAmount) ? 0 : 2,
      maximumFractionDigits: Number.isInteger(safeAmount) ? 0 : 2,
    }).format(safeAmount);
  } catch {
    const symbol = FALLBACK_SYMBOLS[safeCurrency] ?? `${safeCurrency} `;
    return `${symbol}${safeAmount.toLocaleString(undefined, {
      minimumFractionDigits: Number.isInteger(safeAmount) ? 0 : 2,
      maximumFractionDigits: Number.isInteger(safeAmount) ? 0 : 2,
    })}`;
  }
}

export function formatFromNgn(
  amount: number,
  source?: CurrencyDisplaySource | null,
): string {
  return formatMoney(convertFromNgn(amount, source), currencyCode(source));
}

export function formatNgn(amount: number): string {
  return formatMoney(amount, "NGN");
}
