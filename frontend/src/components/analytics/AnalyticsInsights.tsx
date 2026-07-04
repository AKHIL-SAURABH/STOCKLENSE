import { useSignals } from "../../hooks/useStockData";
import { useDashboardStore } from "../../store/dashboardStore";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";

function SignalBadge({ label, value, state }: { label: string; value: string; state: "bullish" | "bearish" | "neutral" | string }) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    bullish:    { bg: "var(--color-bull-subtle)",    text: "var(--color-bull)",    border: "rgba(74,222,128,0.3)" },
    bearish:    { bg: "var(--color-bear-subtle)",    text: "var(--color-bear)",    border: "rgba(255,107,107,0.3)" },
    overbought: { bg: "var(--color-bear-subtle)",    text: "var(--color-bear)",    border: "rgba(255,107,107,0.3)" },
    oversold:   { bg: "var(--color-bull-subtle)",    text: "var(--color-bull)",    border: "rgba(74,222,128,0.3)" },
    golden:     { bg: "var(--color-bull-subtle)",    text: "var(--color-bull)",    border: "rgba(74,222,128,0.3)" },
    death:      { bg: "var(--color-bear-subtle)",    text: "var(--color-bear)",    border: "rgba(255,107,107,0.3)" },
    high:       { bg: "var(--color-bear-subtle)",    text: "var(--color-bear)",    border: "rgba(255,107,107,0.3)" },
    low:        { bg: "var(--color-bull-subtle)",    text: "var(--color-bull)",    border: "rgba(74,222,128,0.3)" },
    neutral:    { bg: "var(--color-neutral-subtle)", text: "var(--color-neutral)", border: "rgba(100,181,246,0.3)" },
    medium:     { bg: "var(--color-amber-subtle)",   text: "var(--color-amber)",   border: "rgba(245,166,35,0.3)" },
    none:       { bg: "var(--color-neutral-subtle)", text: "var(--color-text-secondary)", border: "var(--color-border)" },
  };
  const colors = colorMap[state] ?? colorMap.neutral;
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md"
         style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
      <span className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <span className="font-mono text-xs font-semibold"
            style={{ color: colors.text }}>{value}</span>
    </div>
  );
}

export function AnalyticsInsights() {
  const symbol = useDashboardStore((s) => s.activeSymbol);
  const { data, isLoading } = useSignals(symbol);

  if (isLoading) return (
    <div className="flex flex-col gap-2">
      {[1,2,3,4,5].map(i => <LoadingSkeleton key={i} height={36} />)}
    </div>
  );

  if (!data) return null;

  return (
    <div className="rounded-lg border"
         style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <div className="px-5 py-3 border-b"
           style={{ borderColor: "var(--color-border)" }}>
        <span className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}>Analytics Insights</span>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <SignalBadge label="Trend" value={data.trend_signal} state={data.trend_signal} />
        <SignalBadge label="Crossover" value={data.crossover_type} state={data.crossover_type} />
        <SignalBadge label="RSI" value={`${data.rsi_state} (${data.rsi_value.toFixed(1)})`} state={data.rsi_state} />
        <SignalBadge label="Volatility" value={`${data.volatility_level} (${data.volatility_value.toFixed(1)}%)`} state={data.volatility_level} />
        <SignalBadge label="Volume" value={`${data.volume_anomaly.toFixed(2)}× avg`} state={data.volume_anomaly >= 2 ? "bullish" : "neutral"} />
        <SignalBadge label="BB Squeeze" value={data.bollinger_squeeze ? "Yes ⚡" : "No"} state={data.bollinger_squeeze ? "bearish" : "none"} />
      </div>
      {data.summary && (
        <div className="px-5 pb-4">
          <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            {data.summary}
          </p>
        </div>
      )}
    </div>
  );
}
