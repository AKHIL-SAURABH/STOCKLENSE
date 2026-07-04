from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Literal

# ── Enums ──────────────────────────────────────────────────────────────────

Period          = Literal["1M", "3M", "6M", "1Y", "5Y"]
TrendSignal     = Literal["bullish", "bearish", "neutral"]
CrossoverType   = Literal["golden", "death", "none"]
RSIState        = Literal["overbought", "oversold", "neutral"]
VolatilityLevel = Literal["low", "medium", "high"]

PERIOD_DAYS: dict[str, int] = {
    "1M": 21, "3M": 63, "6M": 126, "1Y": 252, "5Y": 1260
}

# ── Shared mixin ────────────────────────────────────────────────────────────

class CacheMetaMixin(BaseModel):
    is_cached: bool = False
    cached_at: datetime | None = None

# ── OHLCV ──────────────────────────────────────────────────────────────────

class OHLCVDataPoint(BaseModel):
    date:   str
    open:   float
    high:   float
    low:    float
    close:  float
    volume: int

class OHLCVResponse(CacheMetaMixin):
    symbol:   str
    period:   str
    currency: str = "USD"
    data:     list[OHLCVDataPoint]

# ── Quote ───────────────────────────────────────────────────────────────────

class StockQuoteResponse(CacheMetaMixin):
    symbol:         str
    price:          float
    change:         float
    change_percent: float
    volume:         int
    avg_volume_30d: int
    volume_ratio:   float
    latest_day:     str

# ── Indicators ──────────────────────────────────────────────────────────────

class RSIPoint(BaseModel):
    date: str
    rsi:  float

class MACDPoint(BaseModel):
    date:      str
    macd:      float
    signal:    float
    histogram: float

class EMAPoint(BaseModel):
    date:   str
    ema20:  float
    ema50:  float
    ema200: float

class BollingerPoint(BaseModel):
    date:   str
    upper:  float
    middle: float
    lower:  float

class IndicatorsResponse(CacheMetaMixin):
    symbol:    str
    rsi:       list[RSIPoint]
    macd:      list[MACDPoint]
    ema:       list[EMAPoint]
    bollinger: list[BollingerPoint]

# ── Analytics ───────────────────────────────────────────────────────────────

class AnalyticsSignals(BaseModel):
    symbol:            str
    trend_signal:      TrendSignal
    crossover_type:    CrossoverType
    rsi_state:         RSIState
    rsi_value:         float
    volatility_level:  VolatilityLevel
    volatility_value:  float
    volume_anomaly:    float
    bollinger_squeeze: bool
    summary:           str

# ── Overview ────────────────────────────────────────────────────────────────

class CompanyOverview(CacheMetaMixin):
    symbol:         str
    name:           str
    description:    str
    sector:         str
    industry:       str
    market_cap:     int   | None = None
    pe_ratio:       float | None = None
    forward_pe:     float | None = None
    peg_ratio:      float | None = None
    eps:            float | None = None
    revenue_ttm:    int   | None = None
    profit_margin:  float | None = None
    dividend_yield: float | None = None
    beta:           float | None = None
    week_52_high:   float = 0
    week_52_low:    float = 0
    analyst_target: float | None = None

# ── Comparison ──────────────────────────────────────────────────────────────

class NormalisedPoint(BaseModel):
    date:   str
    values: dict[str, float]

class ComparisonResponse(CacheMetaMixin):
    symbols:       list[str]
    period:        str
    base_date:     str
    data:          list[NormalisedPoint]
    total_returns: dict[str, float]

# ── Analytics Series ────────────────────────────────────────────────────────

class DrawdownPoint(BaseModel):
    date:     str
    drawdown: float

class DrawdownResponse(BaseModel):
    symbol: str
    data:   list[DrawdownPoint]

class DistributionPoint(BaseModel):
    date:         str
    daily_return: float

class DistributionResponse(BaseModel):
    symbol: str
    data:   list[DistributionPoint]

# ── API Status ──────────────────────────────────────────────────────────────

class ApiStatus(BaseModel):
    date:                str
    requests_used:       int
    requests_limit:      int
    requests_remaining:  int
    budget_warning:      bool

# ── Errors ──────────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    detail:     str
    error_code: str
    is_cached:  bool = False
