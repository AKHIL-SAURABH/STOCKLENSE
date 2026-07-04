import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { useIndicators } from "../../hooks/useStockData";
import { useDashboardStore } from "../../store/dashboardStore";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";

export function MACDChart() {
  const symbol = useDashboardStore((s) => s.activeSymbol);
  const { data, isLoading } = useIndicators(symbol);

  if (isLoading) return <LoadingSkeleton height={160} />;

  const macdData = (data?.macd ?? []).slice(-252);

  return (
    <div className="rounded-lg border"
         style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <div className="px-6 py-3 border-b"
           style={{ borderColor: "var(--color-border)" }}>
        <span className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}>
          MACD (12, 26, 9)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <ComposedChart data={macdData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A2438" />
          <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#8B99B0", fontSize: 10, fontFamily: "JetBrains Mono" }}
                 axisLine={false} tickLine={false} width={48} />
          <Tooltip
            contentStyle={{
              background: "var(--color-panel)", border: "1px solid var(--color-border)",
              borderRadius: "8px", fontFamily: "JetBrains Mono", fontSize: "12px",
            }}
            labelStyle={{ color: "var(--color-amber)" }}
          />
          <ReferenceLine y={0} stroke="#2E3D54" strokeWidth={1} />
          <Bar dataKey="histogram" name="Histogram"
               fill="#64B5F6"
               radius={[1, 1, 0, 0]}
               isAnimationActive={false}
          />
          <Line type="monotone" dataKey="macd" name="MACD"
                stroke="#F5A623" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="signal" name="Signal"
                stroke="#64B5F6" strokeWidth={1} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
