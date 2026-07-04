import { useEffect, useRef } from "react";
import {
  createChart, ColorType, LineStyle,
  CandlestickSeries, HistogramSeries, LineSeries,
} from "lightweight-charts";
import type { IChartApi } from "lightweight-charts";
import { useStockPrice, useIndicators } from "../../hooks/useStockData";
import { useDashboardStore } from "../../store/dashboardStore";
import { toCandlestickData, toVolumeData } from "../../utils/chartHelpers";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";
import { ErrorBanner } from "../shared/ErrorBanner";

export function CandlestickChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const symbol   = useDashboardStore((s) => s.activeSymbol);
  const period   = useDashboardStore((s) => s.period);
  const overlays = useDashboardStore((s) => s.overlays);

  const { data, isLoading, isError, error, refetch } = useStockPrice(symbol, period);
  const { data: indicators } = useIndicators(symbol);

  useEffect(() => {
    if (!containerRef.current || !data?.data) return;

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0D1117" },
        textColor: "#8B99B0",
        fontFamily: "JetBrains Mono",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1A2438" },
        horzLines: { color: "#1A2438" },
      },
      crosshair: {
        vertLine: { color: "#2E3D54", width: 1, style: LineStyle.Dashed },
        horzLine: { color: "#2E3D54", width: 1, style: LineStyle.Dashed },
      },
      rightPriceScale: { borderColor: "#1E2A3A" },
      timeScale:       { borderColor: "#1E2A3A", fixLeftEdge: true, fixRightEdge: true },
      width:  containerRef.current.clientWidth,
      height: 420,
    });

    // Candlestick series (v5 API)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor:         "#4ADE80",
      downColor:       "#FF6B6B",
      borderUpColor:   "#4ADE80",
      borderDownColor: "#FF6B6B",
      wickUpColor:     "#4ADE80",
      wickDownColor:   "#FF6B6B",
    });

    // Volume histogram (v5 API)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: "volume",
      priceFormat:  { type: "volume" },
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    candleSeries.setData(toCandlestickData(data.data));
    volumeSeries.setData(toVolumeData(data.data));

    // ── EMA Overlay Lines ─────────────────────────────────────────
    if (indicators?.ema && indicators.ema.length > 0) {
      const emaDataSorted = [...indicators.ema].sort(
        (a, b) => a.date.localeCompare(b.date)
      );

      if (overlays.ema20) {
        const ema20Series = chart.addSeries(LineSeries, {
          color: "#F5A623",
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        ema20Series.setData(
          emaDataSorted.map((p) => ({ time: p.date, value: p.ema20 }))
        );
      }

      if (overlays.ema50) {
        const ema50Series = chart.addSeries(LineSeries, {
          color: "#64B5F6",
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        ema50Series.setData(
          emaDataSorted.map((p) => ({ time: p.date, value: p.ema50 }))
        );
      }

      if (overlays.ema200) {
        const ema200Series = chart.addSeries(LineSeries, {
          color: "#A78BFA",
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        ema200Series.setData(
          emaDataSorted.map((p) => ({ time: p.date, value: p.ema200 }))
        );
      }
    }

    // ── Bollinger Bands Overlay ──────────────────────────────────
    if (overlays.bollinger && indicators?.bollinger && indicators.bollinger.length > 0) {
      const bbDataSorted = [...indicators.bollinger].sort(
        (a, b) => a.date.localeCompare(b.date)
      );

      const bbUpperSeries = chart.addSeries(LineSeries, {
        color: "rgba(52,211,153,0.5)",
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      bbUpperSeries.setData(
        bbDataSorted.map((p) => ({ time: p.date, value: p.upper }))
      );

      const bbMiddleSeries = chart.addSeries(LineSeries, {
        color: "rgba(52,211,153,0.3)",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      bbMiddleSeries.setData(
        bbDataSorted.map((p) => ({ time: p.date, value: p.middle }))
      );

      const bbLowerSeries = chart.addSeries(LineSeries, {
        color: "rgba(52,211,153,0.5)",
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      bbLowerSeries.setData(
        bbDataSorted.map((p) => ({ time: p.date, value: p.lower }))
      );
    }

    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [data, indicators, overlays]);

  if (isLoading) return <LoadingSkeleton height={420} />;
  if (isError)   return <ErrorBanner message={(error as Error).message} onRetry={refetch} />;

  return (
    <div className="rounded-lg border overflow-hidden"
         style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <div className="px-6 py-4 border-b text-xs font-bold uppercase tracking-widest"
           style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
        Price Chart · {symbol} · Daily · {period}
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
