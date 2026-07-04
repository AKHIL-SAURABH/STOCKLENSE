export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style:    "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, includeSign = true): string {
  const formatted = Math.abs(value).toFixed(2) + "%";
  if (!includeSign) return formatted;
  return value >= 0 ? `+${formatted}` : `−${formatted}`;
}

export function formatVolume(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
  if (value >= 1_000_000)     return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000)         return (value / 1_000).toFixed(1) + "K";
  return value.toString();
}

export function formatMarketCap(value: number | null): string {
  if (!value) return "—";
  if (value >= 1_000_000_000_000) return "$" + (value / 1_000_000_000_000).toFixed(2) + "T";
  if (value >= 1_000_000_000)     return "$" + (value / 1_000_000_000).toFixed(2) + "B";
  if (value >= 1_000_000)         return "$" + (value / 1_000_000).toFixed(2) + "M";
  return "$" + value.toLocaleString();
}

export function formatRatio(value: number | null, decimals = 2): string {
  if (value === null || value === undefined) return "—";
  return value.toFixed(decimals);
}
