import { useState } from "react";
import { useDashboardStore } from "../../store/dashboardStore";

const CHIP_COLORS = ["#F5A623", "#64B5F6", "#A78BFA", "#34D399", "#F97316"];

export function CompareInput() {
  const [input, setInput]  = useState("");
  const compareSymbols     = useDashboardStore((s) => s.compareSymbols);
  const activeSymbol       = useDashboardStore((s) => s.activeSymbol);
  const addCompare         = useDashboardStore((s) => s.addCompare);
  const removeCompare      = useDashboardStore((s) => s.removeCompare);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = input.toUpperCase().trim();
    if (clean && clean.length <= 10 && clean !== activeSymbol && !compareSymbols.includes(clean)) {
      addCompare(clean);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Active symbol chip (non-removable) */}
        <span className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-full"
              style={{
                color: CHIP_COLORS[0],
                background: `${CHIP_COLORS[0]}15`,
                border: `1px solid ${CHIP_COLORS[0]}40`,
              }}>
          {activeSymbol}
        </span>

        {/* Comparison symbol chips */}
        {compareSymbols.map((sym, i) => {
          const color = CHIP_COLORS[(i + 1) % CHIP_COLORS.length];
          return (
            <span key={sym}
                  className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-full flex items-center gap-1.5"
                  style={{
                    color,
                    background: `${color}15`,
                    border: `1px solid ${color}40`,
                  }}>
              {sym}
              <button onClick={() => removeCompare(sym)}
                      className="cursor-pointer hover:opacity-70 transition-opacity"
                      style={{ color, background: "none", border: "none", padding: 0, fontSize: "14px", lineHeight: 1 }}>
                ×
              </button>
            </span>
          );
        })}

        {/* Add symbol input */}
        {compareSymbols.length < 4 && (
          <form onSubmit={handleSubmit} className="inline-flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="+ Add"
              className="px-2.5 py-1 text-[11px] font-mono rounded-full outline-none transition-all"
              style={{
                width: "72px",
                background: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--color-amber)";
                e.target.style.boxShadow  = "0 0 0 2px var(--color-amber-glow)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--color-border)";
                e.target.style.boxShadow  = "none";
              }}
            />
          </form>
        )}
      </div>
    </div>
  );
}
