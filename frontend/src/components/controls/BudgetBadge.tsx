import { useApiStatus } from "../../hooks/useStockData";

export function BudgetBadge() {
  const { data } = useApiStatus();
  if (!data) return null;

  const pct = (data.requests_used / data.requests_limit) * 100;
  const isWarning = data.budget_warning;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold"
         style={{
           background: isWarning ? "var(--color-warning-subtle)" : "var(--color-elevated)",
           border: `1px solid ${isWarning ? "rgba(251,191,36,0.3)" : "var(--color-border)"}`,
           color: isWarning ? "var(--color-warning)" : "var(--color-text-secondary)",
         }}>
      <div className="relative w-4 h-4">
        <svg viewBox="0 0 20 20" className="w-4 h-4 -rotate-90">
          <circle cx="10" cy="10" r="8" fill="none" stroke="var(--color-border)" strokeWidth="2" />
          <circle cx="10" cy="10" r="8" fill="none"
                  stroke={isWarning ? "var(--color-warning)" : "var(--color-amber)"}
                  strokeWidth="2"
                  strokeDasharray={`${pct * 0.503} 50.3`}
                  strokeLinecap="round" />
        </svg>
      </div>
      {data.requests_used}/{data.requests_limit}
    </div>
  );
}
