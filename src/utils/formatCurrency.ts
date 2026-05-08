import { CurrencyCode } from "../types";

export const formatCurrency = (
  amount: number,
  currency: CurrencyCode = "NGN",
): string => {
  if (currency === "NGN") {
    return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatCompact = (
  amount: number,
  currency: CurrencyCode = "NGN",
): string => {
  const symbol = currency === "NGN" ? "₦" : "$";
  if (amount >= 1_000_000)
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  return formatCurrency(amount, currency);
};
