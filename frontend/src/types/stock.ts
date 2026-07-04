// ── Enums ──────────────────────────────────────────────────────────────────
export type Period = "1M" | "3M" | "6M" | "1Y" | "5Y";
export type TrendSignal = "bullish" | "bearish" | "neutral";
export type CrossoverType = "golden" | "death" | "none";
export type RSIState = "overbought" | "oversold" | "neutral";
export type VolatilityLevel = "low" | "medium" | "high";
export type ErrorCode =
  | "INVALID_SYMBOL" | "INVALID_PERIOD" | "TOO_MANY_SYMBOLS"
  | "SYMBOL_NOT_FOUND" | "BUDGET_EXHAUSTED" | "AV_RATE_LIMITED"
  | "AV_UPSTREAM_ERROR" | "CACHE_UNAVAILABLE" | "ANALYTICS_ERROR";

// ── OHLCV ──────────────────────────────────────────────────────────────────
export interface OHLCVDataPoint {
  date:   string;
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

export interface OHLCVResponse {
  symbol:    string;
  period:    Period;
  currency:  string;
  data:      OHLCVDataPoint[];
  is_cached: boolean;
  cached_at: string | null;
}

// ── Quote ──────────────────────────────────────────────────────────────────
export interface StockQuote {
  symbol:         string;
  price:          number;
  change:         number;
  change_percent: number;
  volume:         number;
  avg_volume_30d: number;
  volume_ratio:   number;
  latest_day:     string;
  is_cached:      boolean;
  cached_at:      string | null;
}

// ── Indicators ─────────────────────────────────────────────────────────────
export interface RSIPoint       { date: string; rsi: number; }
export interface MACDPoint      { date: string; macd: number; signal: number; histogram: number; }
export interface EMAPoint       { date: string; ema20: number; ema50: number; ema200: number; }
export interface BollingerPoint { date: string; upper: number; middle: number; lower: number; }

export interface IndicatorsResponse {
  symbol:    string;
  rsi:       RSIPoint[];
  macd:      MACDPoint[];
  ema:       EMAPoint[];
  bollinger: BollingerPoint[];
  is_cached: boolean;
  cached_at: string | null;
}

// ── Analytics Signals ──────────────────────────────────────────────────────
export interface AnalyticsSignals {
  symbol:            string;
  trend_signal:      TrendSignal;
  crossover_type:    CrossoverType;
  rsi_state:         RSIState;
  rsi_value:         number;
  volatility_level:  VolatilityLevel;
  volatility_value:  number;
  volume_anomaly:    number;
  bollinger_squeeze: boolean;
  summary:           string;
}

// ── Company Overview ───────────────────────────────────────────────────────
export interface CompanyOverview {
  symbol:         string;
  name:           string;
  description:    string;
  sector:         string;
  industry:       string;
  market_cap:     number | null;
  pe_ratio:       number | null;
  forward_pe:     number | null;
  peg_ratio:      number | null;
  eps:            number | null;
  revenue_ttm:    number | null;
  profit_margin:  number | null;
  dividend_yield: number | null;
  beta:           number | null;
  week_52_high:   number;
  week_52_low:    number;
  analyst_target: number | null;
  is_cached:      boolean;
  cached_at:      string | null;
}

// ── Comparison ─────────────────────────────────────────────────────────────
export interface NormalisedPoint {
  date:   string;
  values: Record<string, number>;
}

export interface ComparisonResponse {
  symbols:       string[];
  period:        Period;
  base_date:     string;
  data:          NormalisedPoint[];
  total_returns: Record<string, number>;
  is_cached:     boolean;
  cached_at:     string | null;
}

// ── Analytics Series ───────────────────────────────────────────────────────
export interface DrawdownPoint      { date: string; drawdown: number; }
export interface DistributionPoint  { date: string; daily_return: number; }

export interface DrawdownResponse {
  symbol: string;
  data:   DrawdownPoint[];
}

export interface DistributionResponse {
  symbol: string;
  data:   DistributionPoint[];
}

// ── API Status ─────────────────────────────────────────────────────────────
export interface ApiStatus {
  date:                string;
  requests_used:       number;
  requests_limit:      number;
  requests_remaining:  number;
  budget_warning:      boolean;
}
