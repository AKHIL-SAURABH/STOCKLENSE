import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ReferenceLine, Tooltip, ResponsiveContainer
} from "recharts";
import { useIndicators } from "../../hooks/useStockData";
import { useDashboardStore } from "../../store/dashboardStore";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";

export function RSIChart() {
  const symbol = useDashboardStore((s) => s.activeSymbol);
  const { data, isLoading } = useIndicators(symbol);

  if (isLoading) return <LoadingSkeleton height={160} />;

  const rsiData = (data?.rsi ?? []).slice(-252);
  const currentRsi = data?.rsi?.at(-1)?.rsi ?? 50;
  const rsiColor = currentRsi > 70 ? "var(--color-bear)"
                 : currentRsi < 30 ? "var(--color-bull)"
                 : "var(--color-text-secondary)";

  return (
    <div className="rounded-lg border"
         style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <div className="px-6 py-3 border-b flex items-center justify-between"
           style={{ borderColor: "var(--color-border)" }}>
        <span className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}>
          RSI (14)
        </span>
        <span className="font-mono text-sm font-semibold"
              style={{ color: rsiColor }}>
          {currentRsi.toFixed(2)}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={rsiData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A2438" />
          <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "#8B99B0", fontSize: 10, fontFamily: "JetBrains Mono" }}
                 axisLine={false} tickLine={false} width={32}
                 ticks={[0, 30, 50, 70, 100]} />
          <Tooltip
            contentStyle={{
              background: "var(--color-panel)", border: "1px solid var(--color-border)",
              borderRadius: "8px", fontFamily: "JetBrains Mono", fontSize: "12px",
            }}
            labelStyle={{ color: "var(--color-amber)" }}
            itemStyle={{ color: "var(--color-text-primary)" }}
          />
          <ReferenceLine y={70} stroke="#FF6B6B" strokeDasharray="4 2" strokeWidth={1} />
          <ReferenceLine y={30} stroke="#4ADE80" strokeDasharray="4 2" strokeWidth={1} />
          <ReferenceLine y={50} stroke="#2E3D54" strokeWidth={1} />
          <Line type="monotone" dataKey="rsi" stroke="#F5A623"
                strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
