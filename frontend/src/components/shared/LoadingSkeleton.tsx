interface SkeletonProps {
  height?: number | string;
  width?: string;
  className?: string;
}

export function LoadingSkeleton({ height = 16, width = "100%", className = "" }: SkeletonProps) {
  return (
    <div
      className={`rounded ${className}`}
      style={{
        height,
        width,
        background: "linear-gradient(90deg, var(--color-elevated) 25%, var(--color-panel) 50%, var(--color-elevated) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeletonWave 1500ms ease-in-out infinite",
      }}
    />
  );
}
