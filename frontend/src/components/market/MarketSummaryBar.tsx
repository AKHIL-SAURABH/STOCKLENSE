import { useStockQuote } from "../../hooks/useStockData";
import { useDashboardStore } from "../../store/dashboardStore";
import { formatPrice, formatPercent, formatVolume } from "../../utils/formatters";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";

export function MarketSummaryBar() {
  const symbol = useDashboardStore((s) => s.activeSymbol);
  const { data: quote, isLoading } = useStockQuote(symbol);

  const isUp      = (quote?.change ?? 0) >= 0;
  const glowColor = isUp
    ? "0 0 32px rgba(74,222,128,0.25)"
    : "0 0 32px rgba(255,107,107,0.25)";
  const changeColor = isUp
    ? "var(--color-bull)"
    : "var(--color-bear)";

  return (
    <div className="flex items-center gap-12 px-6 border-b"
         style={{
           height: "88px",
           background: "var(--color-surface)",
           borderColor: "var(--color-border)",
         }}>
      {/* Symbol + Date */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold tracking-wider"
              style={{ color: "var(--color-amber)" }}>
          {symbol}
        </span>
        {isLoading
          ? <LoadingSkeleton height={12} width="120px" />
          : <span className="text-xs"
                  style={{ color: "var(--color-text-secondary)" }}>
              {quote?.latest_day ?? "—"}
            </span>
        }
      </div>

      {/* Live price — the hero number */}
      <div className="flex items-baseline gap-4">
        {isLoading
          ? <LoadingSkeleton height={40} width="160px" />
          : (
            <span className="font-mono font-semibold"
                  style={{
                    fontSize: "40px",
                    letterSpacing: "-0.03em",
                    color: "var(--color-text-primary)",
                    textShadow: glowColor,
                    animation: "glowPulse 1800ms ease-in-out infinite alternate",
                  }}>
              {formatPrice(quote?.price ?? 0)}
            </span>
          )
        }
        {!isLoading && quote && (
          <div className="flex flex-col">
            <span className="font-mono text-base"
                  style={{ color: changeColor }}>
              {formatPrice(quote.change)}
            </span>
            <span className="font-mono text-sm"
                  style={{ color: changeColor }}>
              {formatPercent(quote.change_percent)}
            </span>
          </div>
        )}
      </div>

      {/* Volume metric */}
      <div className="flex flex-col gap-1 ml-auto">
        <span className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}>Volume</span>
        {isLoading
          ? <LoadingSkeleton height={14} width="80px" />
          : (
            <span className="font-mono text-sm font-semibold"
                  style={{ color: "var(--color-text-primary)" }}>
              {formatVolume(quote?.volume ?? 0)}
            </span>
          )
        }
        {!isLoading && quote && (
          <span className="font-mono text-[11px]"
                style={{ color: "var(--color-text-secondary)" }}>
            {quote.volume_ratio.toFixed(2)}× avg
          </span>
        )}
      </div>
    </div>
  );
}
