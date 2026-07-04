interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-md mb-4"
         style={{
           background: "var(--color-error-subtle)",
           border: "1px solid rgba(239,68,68,0.3)",
           borderLeft: "3px solid var(--color-error)",
         }}>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
          ⚠ {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-4 px-3 py-1 text-xs font-semibold rounded-full transition-all"
          style={{
            color: "var(--color-error)",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
          }}>
          Retry ↻
        </button>
      )}
    </div>
  );
}
