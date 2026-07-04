import { MarketSummaryBar } from "./components/market/MarketSummaryBar";
import { CandlestickChart } from "./components/charts/CandlestickChart";
import { IndicatorsPanel } from "./components/charts/IndicatorsPanel";
import { ComparisonChart } from "./components/charts/ComparisonChart";
import { AnalyticsInsights } from "./components/analytics/AnalyticsInsights";
import { FundamentalsPanel } from "./components/analytics/FundamentalsPanel";
import { SymbolSearch } from "./components/controls/SymbolSearch";
import { PeriodSelector } from "./components/controls/PeriodSelector";
import { OverlayToggles } from "./components/controls/OverlayToggles";
import { BudgetBadge } from "./components/controls/BudgetBadge";

export default function App() {
  return (
    <div style={{ background: "var(--color-void)", minHeight: "100vh" }}>
      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 border-b"
              style={{
                height: "56px",
                background: "var(--color-panel)",
                borderColor: "var(--color-border)",
              }}>
        <span className="text-lg font-semibold flex items-center gap-2">
          <span style={{ color: "var(--color-amber)", fontSize: "20px" }}>◈</span>
          <span style={{ color: "var(--color-text-primary)" }}>StockLens</span>
        </span>
        <div className="flex items-center gap-4">
          <SymbolSearch />
          <BudgetBadge />
        </div>
      </header>

      {/* ── Market Summary Bar ────────────────────────────────────── */}
      <MarketSummaryBar />

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 px-6 py-3 border-b"
           style={{
             background: "var(--color-surface)",
             borderColor: "var(--color-border)",
           }}>
        <PeriodSelector />
        <div className="w-px h-5" style={{ background: "var(--color-border)" }} />
        <OverlayToggles />
      </div>

      {/* ── Main Content + Sidebar ────────────────────────────────── */}
      <div className="flex" style={{ minHeight: "calc(100vh - 192px)" }}>
        {/* Main content area */}
        <main className="flex-1 p-6 flex flex-col gap-4 overflow-auto">
          <CandlestickChart />
          <IndicatorsPanel />
          <ComparisonChart />
        </main>

        {/* Right sidebar — 320px fixed */}
        <aside className="flex-shrink-0 p-4 flex flex-col gap-4 border-l overflow-auto"
               style={{
                 width: "320px",
                 background: "var(--color-panel)",
                 borderColor: "var(--color-border)",
               }}>
          <AnalyticsInsights />
          <FundamentalsPanel />
        </aside>
      </div>
    </div>
  );
}
