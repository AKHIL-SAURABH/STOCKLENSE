import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useDrawdown } from "../../hooks/useStockData";
import { useDashboardStore } from "../../store/dashboardStore";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";

export function DrawdownChart() {
  const symbol = useDashboardStore((s) => s.activeSymbol);
  const period = useDashboardStore((s) => s.period);
  const { data, isLoading } = useDrawdown(symbol, period);

  if (isLoading) return <LoadingSkeleton height={160} />;
  if (!data?.data || data.data.length === 0) return null;

  const maxDrawdown = Math.min(...data.data.map((d) => d.drawdown));

  return (
    <div className="rounded-lg border"
         style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <div className="px-6 py-3 border-b flex items-center justify-between"
           style={{ borderColor: "var(--color-border)" }}>
        <span className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}>
          Drawdown
        </span>
        <span className="font-mono text-xs font-semibold"
              style={{ color: "var(--color-bear)" }}>
          Max: {maxDrawdown.toFixed(2)}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={data.data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="drawdownFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A2438" />
          <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: "#8B99B0", fontSize: 10, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-panel)", border: "1px solid var(--color-border)",
              borderRadius: "8px", fontFamily: "JetBrains Mono", fontSize: "12px",
            }}
            labelStyle={{ color: "var(--color-amber)" }}
            formatter={(val: any) => [`${Number(val).toFixed(2)}%`, "Drawdown"]}
          />
          <ReferenceLine y={0} stroke="#2E3D54" strokeWidth={1} />
          <Area
            type="monotone"
            dataKey="drawdown"
            stroke="#FF6B6B"
            strokeWidth={1.5}
            fill="url(#drawdownFill)"
            dot={false}
            activeDot={{ r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
