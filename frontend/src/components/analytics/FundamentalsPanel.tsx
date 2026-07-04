import { useOverview } from "../../hooks/useStockData";
import { useDashboardStore } from "../../store/dashboardStore";
import { formatMarketCap, formatRatio } from "../../utils/formatters";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";

export function FundamentalsPanel() {
  const symbol = useDashboardStore((s) => s.activeSymbol);
  const { data, isLoading } = useOverview(symbol);

  if (isLoading) return (
    <div className="flex flex-col gap-2">
      {[1,2,3,4,5,6,7,8].map(i => <LoadingSkeleton key={i} height={20} />)}
    </div>
  );

  if (!data) return null;

  const rows = [
    { label: "Market Cap", value: formatMarketCap(data.market_cap) },
    { label: "P/E Ratio",  value: formatRatio(data.pe_ratio) },
    { label: "Forward P/E", value: formatRatio(data.forward_pe) },
    { label: "EPS",         value: data.eps ? `$${data.eps.toFixed(2)}` : "—" },
    { label: "Div Yield",   value: data.dividend_yield ? `${(data.dividend_yield * 100).toFixed(2)}%` : "—" },
    { label: "Beta",        value: formatRatio(data.beta) },
    { label: "52W High",    value: `$${data.week_52_high.toFixed(2)}` },
    { label: "52W Low",     value: `$${data.week_52_low.toFixed(2)}` },
    { label: "Target",      value: data.analyst_target ? `$${data.analyst_target.toFixed(2)}` : "—" },
  ];

  return (
    <div className="rounded-lg border"
         style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <div className="px-5 py-3 border-b"
           style={{ borderColor: "var(--color-border)" }}>
        <span className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}>Fundamentals</span>
      </div>
      <div className="p-4">
        {data.name && (
          <p className="text-xs font-medium mb-3" style={{ color: "var(--color-text-primary)" }}>
            {data.name} · {data.sector}
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          {rows.map(r => (
            <div key={r.label} className="flex items-center justify-between py-1">
              <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{r.label}</span>
              <span className="font-mono text-xs font-semibold" style={{ color: "var(--color-text-primary)" }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
