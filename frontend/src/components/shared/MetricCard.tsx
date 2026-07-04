interface MetricCardProps {
  label: string;
  value: string;
  subvalue?: string;
  valueColor?: string;
}

export function MetricCard({ label, value, subvalue, valueColor }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "var(--color-text-muted)" }}>
        {label}
      </span>
      <span className="font-mono text-sm font-semibold"
            style={{ color: valueColor ?? "var(--color-text-primary)" }}>
        {value}
      </span>
      {subvalue && (
        <span className="font-mono text-[11px]"
              style={{ color: "var(--color-text-secondary)" }}>
          {subvalue}
        </span>
      )}
    </div>
  );
}
