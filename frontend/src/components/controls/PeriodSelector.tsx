import { useDashboardStore } from "../../store/dashboardStore";
import type { Period } from "../../types/stock";

const PERIODS: Period[] = ["1M", "3M", "6M", "1Y", "5Y"];

export function PeriodSelector() {
  const period    = useDashboardStore((s) => s.period);
  const setPeriod = useDashboardStore((s) => s.setPeriod);

  return (
    <div className="flex gap-1">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          className="px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer"
          style={{
            color:      p === period ? "var(--color-amber)" : "var(--color-text-secondary)",
            background: p === period ? "var(--color-amber-subtle)" : "transparent",
            border:     p === period ? "1px solid rgba(245,166,35,0.3)" : "1px solid transparent",
            fontWeight: p === period ? 600 : 500,
          }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
