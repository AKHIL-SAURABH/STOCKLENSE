import { useDashboardStore } from "../../store/dashboardStore";

const OVERLAY_CONFIG = [
  { key: "ema20"     as const, label: "EMA 20",  color: "#F5A623" },
  { key: "ema50"     as const, label: "EMA 50",  color: "#64B5F6" },
  { key: "ema200"    as const, label: "EMA 200", color: "#A78BFA" },
  { key: "bollinger" as const, label: "Bands",   color: "#34D399" },
];

export function OverlayToggles() {
  const overlays      = useDashboardStore((s) => s.overlays);
  const toggleOverlay = useDashboardStore((s) => s.toggleOverlay);

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-widest mr-1"
            style={{ color: "var(--color-text-muted)" }}>
        Overlays
      </span>
      {OVERLAY_CONFIG.map(({ key, label, color }) => {
        const active = overlays[key];
        return (
          <button
            key={key}
            onClick={() => toggleOverlay(key)}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer"
            style={{
              color:      active ? color : "var(--color-text-muted)",
              background: active ? `${color}15` : "transparent",
              border:     active ? `1px solid ${color}40` : "1px solid transparent",
            }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                  style={{ background: active ? color : "var(--color-text-muted)" }} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
