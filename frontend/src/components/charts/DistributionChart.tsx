import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import { useDistribution } from "../../hooks/useStockData";
import { useDashboardStore } from "../../store/dashboardStore";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";

export function DistributionChart() {
  const symbol = useDashboardStore((s) => s.activeSymbol);
  const period = useDashboardStore((s) => s.period);
  const { data, isLoading } = useDistribution(symbol, period);

  if (isLoading) return <LoadingSkeleton height={160} />;
  if (!data?.data || data.data.length === 0) return null;

  const avgReturn = data.data.reduce((sum, d) => sum + d.daily_return, 0) / data.data.length;

  return (
    <div className="rounded-lg border"
         style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <div className="px-6 py-3 border-b flex items-center justify-between"
           style={{ borderColor: "var(--color-border)" }}>
        <span className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}>
          Daily Returns
        </span>
        <span className="font-mono text-xs font-semibold"
              style={{ color: avgReturn >= 0 ? "var(--color-bull)" : "var(--color-bear)" }}>
          Avg: {avgReturn >= 0 ? "+" : ""}{avgReturn.toFixed(3)}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data.data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A2438" />
          <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: "#8B99B0", fontSize: 10, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v: number) => `${v.toFixed(1)}%`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-panel)", border: "1px solid var(--color-border)",
              borderRadius: "8px", fontFamily: "JetBrains Mono", fontSize: "12px",
            }}
            labelStyle={{ color: "var(--color-amber)" }}
            formatter={(val: any) => [`${Number(val).toFixed(3)}%`, "Return"]}
          />
          <ReferenceLine y={0} stroke="#2E3D54" strokeWidth={1} />
          <Bar dataKey="daily_return" name="Return" radius={[1, 1, 0, 0]} isAnimationActive={false}>
            {data.data.map((entry, index) => (
              <Cell key={index} fill={entry.daily_return >= 0 ? "rgba(74,222,128,0.6)" : "rgba(255,107,107,0.6)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
