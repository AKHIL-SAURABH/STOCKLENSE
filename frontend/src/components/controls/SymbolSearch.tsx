import { useState } from "react";
import { useDashboardStore } from "../../store/dashboardStore";

export function SymbolSearch() {
  const [input, setInput] = useState("");
  const setSymbol = useDashboardStore((s) => s.setSymbol);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = input.toUpperCase().trim();
    if (clean && clean.length <= 10) {
      setSymbol(clean);
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: "var(--color-text-muted)" }}>🔍</span>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search symbol, e.g. AAPL"
        className="pl-9 pr-4 py-2 text-sm rounded-full outline-none transition-all"
        style={{
          width: "280px",
          background: "var(--color-elevated)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-ui)",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--color-amber)";
          e.target.style.boxShadow = "0 0 0 2px var(--color-amber-glow)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--color-border)";
          e.target.style.boxShadow = "none";
        }}
      />
    </form>
  );
}
