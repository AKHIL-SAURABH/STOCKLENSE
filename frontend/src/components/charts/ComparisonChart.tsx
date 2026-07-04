import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import { useComparison } from "../../hooks/useStockData";
import { useDashboardStore } from "../../store/dashboardStore";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";
import { CompareInput } from "../controls/CompareInput";

const LINE_COLORS = ["#F5A623", "#64B5F6", "#A78BFA", "#34D399", "#F97316"];

export function ComparisonChart() {
  const activeSymbol   = useDashboardStore((s) => s.activeSymbol);
  const compareSymbols = useDashboardStore((s) => s.compareSymbols);
  const period         = useDashboardStore((s) => s.period);

  const allSymbols = [activeSymbol, ...compareSymbols];
  const { data, isLoading } = useComparison(allSymbols, period);

  // Only render when there are comparison symbols
  if (compareSymbols.length === 0 && !isLoading) {
    return (
      <div className="rounded-lg border"
           style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <div className="px-6 py-4 border-b flex items-center justify-between"
             style={{ borderColor: "var(--color-border)" }}>
          <span className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--color-text-muted)" }}>
            Stock Comparison
          </span>
        </div>
        <div className="px-6 py-4">
          <CompareInput />
          <p className="text-xs mt-3" style={{ color: "var(--color-text-muted)" }}>
            Add at least one more symbol to compare performance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border"
         style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <div className="px-6 py-4 border-b flex items-center justify-between"
           style={{ borderColor: "var(--color-border)" }}>
        <span className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}>
          Comparison · Normalised to 100 · {period}
        </span>
      </div>
      <div className="px-6 py-3">
        <CompareInput />
      </div>
      {isLoading ? (
        <LoadingSkeleton height={260} />
      ) : data?.data && data.data.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={data.data}
              margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2438" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#8B99B0", fontSize: 10, fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={60}
              />
              <YAxis
                tick={{ fill: "#8B99B0", fontSize: 10, fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-panel)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontFamily: "JetBrains Mono",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "var(--color-amber)" }}
              />
              <ReferenceLine y={100} stroke="#2E3D54" strokeDasharray="4 2" strokeWidth={1} />
              {allSymbols.map((sym, i) => (
                <Line
                  key={sym}
                  type="monotone"
                  dataKey={`values.${sym}`}
                  name={sym}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {/* Total returns legend */}
          {data.total_returns && (
            <div className="px-6 py-3 flex items-center gap-4 flex-wrap border-t"
                 style={{ borderColor: "var(--color-border)" }}>
              {allSymbols.map((sym, i) => {
                const ret  = data.total_returns[sym] ?? 0;
                const isUp = ret >= 0;
                return (
                  <div key={sym} className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ background: LINE_COLORS[i % LINE_COLORS.length] }} />
                    <span className="font-mono text-xs font-semibold"
                          style={{ color: "var(--color-text-primary)" }}>
                      {sym}
                    </span>
                    <span className="font-mono text-xs font-semibold"
                          style={{ color: isUp ? "var(--color-bull)" : "var(--color-bear)" }}>
                      {isUp ? "+" : ""}{ret.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="px-6 py-8 text-center">
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Fetch price data for each symbol first, then compare.
          </p>
        </div>
      )}
    </div>
  );
}
