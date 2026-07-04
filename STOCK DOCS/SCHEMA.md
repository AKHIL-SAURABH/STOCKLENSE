# Schema Reference
## StockLens — Stock Market Analytics Dashboard

| Field | Details |
|---|---|
| **Document Type** | Schema Reference |
| **Project** | StockLens |
| **Version** | v1.0 |
| **Status** | Draft |
| **Author** | — |
| **Created** | June 2026 |
| **References** | PRD v1.0 · TECH_SPEC v1.0 · ARCHITECTURE v1.0 |

> **Purpose of this document**
> This is the single source of truth for every data shape in StockLens.
> Open this when you need to know: what fields does this object have, what type are they, what are the constraints, and how does data transform as it moves through the system.

---

## Table of Contents

1. [Schema Layers Overview](#1-schema-layers-overview)
2. [Enums & Literal Types](#2-enums--literal-types)
3. [SQLite Database Schema](#3-sqlite-database-schema)
4. [Alpha Vantage Raw API Schemas](#4-alpha-vantage-raw-api-schemas)
5. [Python Pydantic Models](#5-python-pydantic-models)
6. [FastAPI REST Response Schemas](#6-fastapi-rest-response-schemas)
7. [TypeScript Interfaces (Frontend)](#7-typescript-interfaces-frontend)
8. [Zustand Store Schema](#8-zustand-store-schema)
9. [React Query Cache Key Schema](#9-react-query-cache-key-schema)
10. [SQLite Cache Key Schema](#10-sqlite-cache-key-schema)
11. [Field Data Dictionary](#11-field-data-dictionary)
12. [Schema Transformation Maps](#12-schema-transformation-maps)
13. [Error Schema Reference](#13-error-schema-reference)
14. [Schema Validation Rules](#14-schema-validation-rules)

---

## 1. Schema Layers Overview

Data in StockLens passes through five distinct schema layers.
Each layer transforms the shape to suit its consumer.

```
Layer 0 ── Alpha Vantage Raw JSON
              ↓  (alpha_vantage.py normalises)
Layer 1 ── Internal Python Dict  (standardised field names, cast types)
              ↓  (stored in SQLite as JSON string)
Layer 2 ── SQLite Cache          (TEXT blob, deserialized on read)
              ↓  (Pydantic serializes to response)
Layer 3 ── FastAPI JSON Response (validated Pydantic output)
              ↓  (Axios delivers to frontend)
Layer 4 ── TypeScript Interface  (typed in-memory objects in React)
              ↓  (chart helpers transform for rendering)
Layer 5 ── Chart Library Format  (lightweight-charts / recharts shapes)
```

All field names follow `snake_case` in Python/JSON and `camelCase` convention
is **not used** — the frontend also uses `snake_case` to match the API 1:1.

---

## 2. Enums & Literal Types

All string-constrained types used across the project. Defined once here,
referenced in both Python (Pydantic `Literal`) and TypeScript (`type`).

### 2.1 Period

Time range for historical data requests.

| Value | Trading days | Calendar approx |
|---|---|---|
| `"1M"` | ~21 | 1 month |
| `"3M"` | ~63 | 3 months |
| `"6M"` | ~126 | 6 months |
| `"1Y"` | ~252 | 1 year (default) |
| `"5Y"` | ~1260 | 5 years |

```python
# Python
from typing import Literal
Period = Literal["1M", "3M", "6M", "1Y", "5Y"]
```
```typescript
// TypeScript
export type Period = "1M" | "3M" | "6M" | "1Y" | "5Y";
```

---

### 2.2 TrendSignal

Overall price trend direction derived from EMA 50 vs EMA 200.

| Value | Meaning | Condition |
|---|---|---|
| `"bullish"` | Uptrend | EMA 50 > EMA 200 |
| `"bearish"` | Downtrend | EMA 50 < EMA 200 |
| `"neutral"` | Indeterminate | Insufficient data |

```python
TrendSignal = Literal["bullish", "bearish", "neutral"]
```
```typescript
export type TrendSignal = "bullish" | "bearish" | "neutral";
```

---

### 2.3 CrossoverType

Describes whether a moving average crossover just occurred.

| Value | Meaning | Condition |
|---|---|---|
| `"golden"` | EMA 50 just crossed above EMA 200 | Bullish long-term signal |
| `"death"` | EMA 50 just crossed below EMA 200 | Bearish long-term signal |
| `"none"` | No crossover in the last candle | Normal state |

```python
CrossoverType = Literal["golden", "death", "none"]
```
```typescript
export type CrossoverType = "golden" | "death" | "none";
```

---

### 2.4 RSIState

Interpretation of the current RSI value.

| Value | RSI range | Meaning |
|---|---|---|
| `"overbought"` | RSI > 70 | Momentum may be exhausted, potential pullback |
| `"oversold"` | RSI < 30 | Selling may be overdone, potential bounce |
| `"neutral"` | 30 ≤ RSI ≤ 70 | No extreme momentum signal |

```python
RSIState = Literal["overbought", "oversold", "neutral"]
```
```typescript
export type RSIState = "overbought" | "oversold" | "neutral";
```

---

### 2.5 VolatilityLevel

Categorical bucketing of annualised rolling volatility.

| Value | Annualised vol range | Market context |
|---|---|---|
| `"low"` | < 20% | Stable, low-risk environment |
| `"medium"` | 20% – 40% | Normal market conditions |
| `"high"` | > 40% | Elevated risk, large swings likely |

```python
VolatilityLevel = Literal["low", "medium", "high"]
```
```typescript
export type VolatilityLevel = "low" | "medium" | "high";
```

---

### 2.6 ErrorCode

All application-level error codes returned by the FastAPI backend.

| Value | HTTP status | When |
|---|---|---|
| `"INVALID_SYMBOL"` | 400 | Symbol contains disallowed characters |
| `"INVALID_PERIOD"` | 400 | Period not in allowed set |
| `"TOO_MANY_SYMBOLS"` | 400 | More than 5 symbols in compare |
| `"SYMBOL_NOT_FOUND"` | 404 | Alpha Vantage returned no data for symbol |
| `"BUDGET_EXHAUSTED"` | 429 | 24/25 daily requests used |
| `"AV_RATE_LIMITED"` | 429 | Alpha Vantage per-minute limit hit |
| `"AV_UPSTREAM_ERROR"` | 502 | Alpha Vantage returned an error message |
| `"CACHE_UNAVAILABLE"` | 503 | SQLite read/write failure |
| `"ANALYTICS_ERROR"` | 500 | Pandas computation failed |

```python
ErrorCode = Literal[
    "INVALID_SYMBOL", "INVALID_PERIOD", "TOO_MANY_SYMBOLS",
    "SYMBOL_NOT_FOUND", "BUDGET_EXHAUSTED", "AV_RATE_LIMITED",
    "AV_UPSTREAM_ERROR", "CACHE_UNAVAILABLE", "ANALYTICS_ERROR"
]
```
```typescript
export type ErrorCode =
  | "INVALID_SYMBOL" | "INVALID_PERIOD" | "TOO_MANY_SYMBOLS"
  | "SYMBOL_NOT_FOUND" | "BUDGET_EXHAUSTED" | "AV_RATE_LIMITED"
  | "AV_UPSTREAM_ERROR" | "CACHE_UNAVAILABLE" | "ANALYTICS_ERROR";
```

---

## 3. SQLite Database Schema

Database file: `backend/db/stock_cache.db`
Engine: SQLite 3 via `aiosqlite`
Created by: `db/database.py → init_db()` on application startup

---

### 3.1 Table: `api_cache`

Stores serialised Alpha Vantage API responses. Primary persistence layer for
the caching strategy.

```sql
CREATE TABLE IF NOT EXISTS api_cache (
    cache_key     TEXT    NOT NULL,   -- unique identifier for this cached item
    response_data TEXT    NOT NULL,   -- JSON-serialised Python dict
    fetched_at    INTEGER NOT NULL,   -- Unix timestamp (seconds) when fetched
    ttl_seconds   INTEGER NOT NULL,   -- how long this entry is valid
    PRIMARY KEY (cache_key)
);

CREATE INDEX IF NOT EXISTS idx_cache_fetched ON api_cache (fetched_at);
```

#### Column definitions

| Column | Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| `cache_key` | TEXT | No | PRIMARY KEY | Composite key — see §10 for naming convention |
| `response_data` | TEXT | No | Valid JSON string | Serialised dict from Alpha Vantage, after normalisation |
| `fetched_at` | INTEGER | No | > 0 | Unix timestamp (UTC) of when the API was called |
| `ttl_seconds` | INTEGER | No | 3600 or 86400 | Determines when cache expires. Age = now − fetched_at |

#### Freshness check logic
```sql
-- A row is FRESH if:
(strftime('%s','now') - fetched_at) < ttl_seconds

-- A row is STALE if:
(strftime('%s','now') - fetched_at) >= ttl_seconds
```

---

### 3.2 Table: `api_budget`

Tracks daily Alpha Vantage API call counts. One row per calendar date.
Resets automatically each day (new date = new row, old row untouched).

```sql
CREATE TABLE IF NOT EXISTS api_budget (
    date          TEXT    NOT NULL,   -- YYYY-MM-DD (UTC date)
    request_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (date)
);
```

#### Column definitions

| Column | Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| `date` | TEXT | No | PRIMARY KEY, format `YYYY-MM-DD` | UTC calendar date |
| `request_count` | INTEGER | No | 0 – 25 | Number of real API calls made today |

#### Budget thresholds

| `request_count` value | System state |
|---|---|
| 0 – 19 | Normal operation |
| 20 – 23 | Warning state — `budget_warning: true` returned on `/api/status` |
| 24 | Hard stop — no more Alpha Vantage calls today, cache-only mode |
| 25 | Should never be reached (hard stop at 24) |

---

### 3.3 Table: `watchlist`

Stores the user's saved stock symbols. Implemented in v1.0 (table created),
UI surfaced in v1.1.

```sql
CREATE TABLE IF NOT EXISTS watchlist (
    symbol    TEXT    NOT NULL,   -- uppercase ticker, e.g. "AAPL"
    added_at  INTEGER NOT NULL,   -- Unix timestamp when symbol was added
    PRIMARY KEY (symbol)
);
```

#### Column definitions

| Column | Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| `symbol` | TEXT | No | PRIMARY KEY, 1–10 chars, uppercase alphanumeric + `.` `-` | Stock ticker symbol |
| `added_at` | INTEGER | No | > 0 | Unix timestamp of when the user added this symbol |

---

## 4. Alpha Vantage Raw API Schemas

These are the raw JSON shapes received from Alpha Vantage **before** any
normalisation. Documented here as reference — the backend never passes these
shapes forward. They are always normalised before storing in cache.

> ⚠️ All numeric values arrive as **strings** from Alpha Vantage.
> All field names use prefixed keys like `"1. open"`.
> Normalisation in `alpha_vantage.py` strips prefixes and casts types.

---

### 4.1 TIME_SERIES_DAILY

Request params: `function=TIME_SERIES_DAILY&symbol={SYM}&outputsize=full`

```json
{
  "Meta Data": {
    "1. Information":   "Daily Prices (open, high, low, close) and Volumes",
    "2. Symbol":        "AAPL",
    "3. Last Refreshed":"2026-06-13",
    "4. Output Size":   "Full size",
    "5. Time Zone":     "US/Eastern"
  },
  "Time Series (Daily)": {
    "2026-06-13": {
      "1. open":   "207.5000",
      "2. high":   "214.2000",
      "3. low":    "206.8000",
      "4. close":  "211.3000",
      "5. volume": "58200000"
    },
    "2026-06-12": { "...": "..." }
  }
}
```

#### Field notes
- Date keys are in `YYYY-MM-DD` format, ordered newest → oldest.
- `outputsize=full` returns up to 20 years of data.
- `outputsize=compact` returns only the last 100 data points.
- All values inside each date object are **strings**.
- Volume is a whole number but arrives as a string.

---

### 4.2 GLOBAL_QUOTE

Request params: `function=GLOBAL_QUOTE&symbol={SYM}`

```json
{
  "Global Quote": {
    "01. symbol":             "AAPL",
    "02. open":               "208.50",
    "03. high":               "214.20",
    "04. low":                "206.80",
    "05. price":              "213.07",
    "06. volume":             "54382901",
    "07. latest trading day": "2026-06-13",
    "08. previous close":     "214.50",
    "09. change":             "-1.43",
    "10. change percent":     "-0.6666%"
  }
}
```

#### Field notes
- `"10. change percent"` includes a `%` suffix — must be stripped before casting to float.
- `"09. change"` may be negative — preserve sign.
- This endpoint is the only one with a 1-hour TTL (all others 24 hours).

---

### 4.3 OVERVIEW

Request params: `function=OVERVIEW&symbol={SYM}`

```json
{
  "Symbol":                    "AAPL",
  "AssetType":                 "Common Stock",
  "Name":                      "Apple Inc",
  "Description":               "Apple Inc. designs, manufactures...",
  "CIK":                       "0000320193",
  "Exchange":                  "NASDAQ",
  "Currency":                  "USD",
  "Country":                   "USA",
  "Sector":                    "TECHNOLOGY",
  "Industry":                  "Electronic Computers",
  "Address":                   "One Apple Park Way, Cupertino...",
  "OfficialSite":              "https://www.apple.com",
  "FiscalYearEnd":             "September",
  "LatestQuarter":             "2026-03-31",
  "MarketCapitalization":      "3200000000000",
  "EBITDA":                    "130000000000",
  "PERatio":                   "32.50",
  "PEGRatio":                  "2.30",
  "BookValue":                 "4.44",
  "DividendPerShare":          "1.00",
  "DividendYield":             "0.005",
  "EPS":                       "6.56",
  "RevenuePerShareTTM":        "26.39",
  "ProfitMargin":              "0.2638",
  "OperatingMarginTTM":        "0.3148",
  "ReturnOnAssetsTTM":         "0.2286",
  "ReturnOnEquityTTM":         "1.4725",
  "RevenueTTM":                "385000000000",
  "GrossProfitTTM":            "180000000000",
  "DilutedEPSTTM":             "6.56",
  "QuarterlyEarningsGrowthYOY":"0.048",
  "QuarterlyRevenueGrowthYOY": "0.051",
  "AnalystTargetPrice":        "230.00",
  "AnalystRatingStrongBuy":    "12",
  "AnalystRatingBuy":          "20",
  "AnalystRatingHold":         "8",
  "AnalystRatingSell":         "1",
  "AnalystRatingStrongSell":   "0",
  "TrailingPE":                "32.50",
  "ForwardPE":                 "28.10",
  "PriceToSalesRatioTTM":      "8.31",
  "PriceToBookRatio":          "48.01",
  "EVToRevenue":               "8.12",
  "EVToEBITDA":                "24.62",
  "Beta":                      "1.24",
  "52WeekHigh":                "237.23",
  "52WeekLow":                 "164.08",
  "50DayMovingAverage":        "204.55",
  "200DayMovingAverage":       "191.30",
  "SharesOutstanding":         "15230000000",
  "DividendDate":              "2026-05-15",
  "ExDividendDate":            "2026-05-09"
}
```

#### Field notes
- All values are strings, including large integers and `"None"` for missing data.
- `"None"` string must be converted to Python `None` / TypeScript `null`.
- Many fields not surfaced in v1.0 UI are still stored in cache for future use.

---

### 4.4 RSI

Request params: `function=RSI&symbol={SYM}&interval=daily&time_period=14&series_type=close`

> **Note:** In v1.0, RSI is computed server-side with Pandas from the cached
> OHLCV data. This schema is documented for reference if switching to the AV endpoint.

```json
{
  "Meta Data": {
    "1: Symbol":        "AAPL",
    "2: Indicator":     "Relative Strength Index (RSI)",
    "3: Last Refreshed":"2026-06-13",
    "4: Interval":      "daily",
    "5: Time Period":   "14",
    "6: Series Type":   "close",
    "7: Time Zone":     "US/Eastern"
  },
  "Technical Analysis: RSI": {
    "2026-06-13": { "RSI": "58.3421" },
    "2026-06-12": { "RSI": "56.1234" }
  }
}
```

---

### 4.5 MACD

Request params: `function=MACD&symbol={SYM}&interval=daily&series_type=close`

> **Note:** In v1.0, MACD is computed server-side with Pandas. Documented for reference.

```json
{
  "Meta Data": { "...": "..." },
  "Technical Analysis: MACD": {
    "2026-06-13": {
      "MACD":            "1.2300",
      "MACD_Signal":     "0.9800",
      "MACD_Hist":       "0.2500"
    }
  }
}
```

---

### 4.6 BBANDS (Bollinger Bands)

Request params: `function=BBANDS&symbol={SYM}&interval=daily&time_period=20&series_type=close&nbdevup=2&nbdevdn=2`

> **Note:** In v1.0, Bollinger Bands are computed server-side with Pandas.

```json
{
  "Meta Data": { "...": "..." },
  "Technical Analysis: BBANDS": {
    "2026-06-13": {
      "Real Upper Band": "218.4000",
      "Real Middle Band":"209.1000",
      "Real Lower Band": "199.8000"
    }
  }
}
```

---

### 4.7 EMA

Request params: `function=EMA&symbol={SYM}&interval=daily&time_period={N}&series_type=close`
Called three times with `time_period=20`, `50`, and `200`.

> **Note:** In v1.0, EMA is computed server-side with Pandas.

```json
{
  "Meta Data": { "...": "..." },
  "Technical Analysis: EMA": {
    "2026-06-13": { "EMA": "209.1000" }
  }
}
```

---

## 5. Python Pydantic Models

File: `backend/models/schemas.py`
All models extend `pydantic.BaseModel`. Used for FastAPI response validation,
serialisation, and automatic OpenAPI documentation generation.

---

### 5.1 Base Response Mixin

All API responses include cache metadata. Applied via composition.

```python
from pydantic import BaseModel
from datetime import datetime

class CacheMetaMixin(BaseModel):
    is_cached:  bool
    cached_at:  datetime | None = None

    model_config = {"from_attributes": True}
```

---

### 5.2 OHLCVDataPoint

Single daily price candle. Used inside list fields.

```python
class OHLCVDataPoint(BaseModel):
    date:   str   # "YYYY-MM-DD"
    open:   float
    high:   float
    low:    float
    close:  float
    volume: int

    @field_validator("date")
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        datetime.strptime(v, "%Y-%m-%d")  # raises ValueError if wrong format
        return v

    @field_validator("open", "high", "low", "close")
    @classmethod
    def validate_positive_price(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Price must be positive")
        return round(v, 4)

    @field_validator("volume")
    @classmethod
    def validate_positive_volume(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Volume cannot be negative")
        return v
```

---

### 5.3 StockQuoteResponse

```python
class StockQuoteResponse(CacheMetaMixin):
    symbol:         str
    price:          float
    change:         float           # can be negative
    change_percent: float           # e.g. -0.67 (not -0.0067)
    volume:         int
    avg_volume_30d: int
    volume_ratio:   float           # today_vol / avg_vol_30d
    latest_day:     str             # "YYYY-MM-DD"
```

---

### 5.4 OHLCVResponse

```python
class OHLCVResponse(CacheMetaMixin):
    symbol:   str
    period:   Period
    currency: str = "USD"
    data:     list[OHLCVDataPoint]  # ordered newest → oldest from AV,
                                    # frontend reverses for chronological charts

    @field_validator("data")
    @classmethod
    def validate_min_data_points(cls, v: list) -> list:
        if len(v) < 2:
            raise ValueError("Insufficient data points for analysis")
        return v
```

---

### 5.5 Indicator Sub-Models

```python
class RSIPoint(BaseModel):
    date: str
    rsi:  float   # 0.0 – 100.0

    @field_validator("rsi")
    @classmethod
    def validate_rsi_range(cls, v: float) -> float:
        if not (0.0 <= v <= 100.0):
            raise ValueError(f"RSI out of range: {v}")
        return round(v, 4)


class MACDPoint(BaseModel):
    date:      str
    macd:      float   # MACD line
    signal:    float   # Signal line (EMA 9 of MACD)
    histogram: float   # macd - signal


class EMAPoint(BaseModel):
    date:   str
    ema20:  float   # 20-period EMA
    ema50:  float   # 50-period EMA
    ema200: float   # 200-period EMA


class BollingerPoint(BaseModel):
    date:   str
    upper:  float   # SMA(20) + 2×std(20)
    middle: float   # SMA(20)
    lower:  float   # SMA(20) - 2×std(20)
```

---

### 5.6 IndicatorsResponse

```python
class IndicatorsResponse(CacheMetaMixin):
    symbol:    str
    rsi:       list[RSIPoint]
    macd:      list[MACDPoint]
    ema:       list[EMAPoint]
    bollinger: list[BollingerPoint]
```

---

### 5.7 AnalyticsSignals

```python
class AnalyticsSignals(BaseModel):
    symbol:            str
    trend_signal:      TrendSignal
    crossover_type:    CrossoverType
    rsi_state:         RSIState
    rsi_value:         float         # e.g. 58.34
    volatility_level:  VolatilityLevel
    volatility_value:  float         # annualised vol as %, e.g. 24.7
    volume_anomaly:    float         # today / 30d avg, e.g. 1.42
    bollinger_squeeze: bool
    summary:           str           # plain-English, max 300 chars
```

---

### 5.8 CompanyOverview

```python
class CompanyOverview(CacheMetaMixin):
    symbol:         str
    name:           str
    description:    str
    sector:         str
    industry:       str
    market_cap:     int   | None
    pe_ratio:       float | None
    forward_pe:     float | None
    peg_ratio:      float | None
    eps:            float | None
    revenue_ttm:    int   | None
    profit_margin:  float | None   # 0.0 – 1.0 (not percentage)
    dividend_yield: float | None   # e.g. 0.005 (not 0.5%)
    beta:           float | None
    week_52_high:   float
    week_52_low:    float
    analyst_target: float | None
```

---

### 5.9 Comparison Models

```python
class NormalisedPoint(BaseModel):
    date:   str
    values: dict[str, float]   # { "AAPL": 103.2, "MSFT": 98.7 }


class ComparisonResponse(CacheMetaMixin):
    symbols:       list[str]
    period:        Period
    base_date:     str               # "YYYY-MM-DD" — date where all = 100.0
    data:          list[NormalisedPoint]
    total_returns: dict[str, float]  # { "AAPL": 12.4, "MSFT": -3.1 }
```

---

### 5.10 Analytics Series Models

```python
class DrawdownPoint(BaseModel):
    date:     str
    drawdown: float   # ≤ 0.0, e.g. -12.4 (percent)


class DrawdownResponse(BaseModel):
    symbol: str
    data:   list[DrawdownPoint]


class DistributionPoint(BaseModel):
    date:         str
    daily_return: float   # can be negative, e.g. -1.12 or 0.73 (percent)


class DistributionResponse(BaseModel):
    symbol: str
    data:   list[DistributionPoint]
```

---

### 5.11 API Status Model

```python
class ApiStatus(BaseModel):
    date:                 str    # "YYYY-MM-DD"
    requests_used:        int    # 0 – 25
    requests_limit:       int    # always 25
    requests_remaining:   int    # requests_limit - requests_used
    budget_warning:       bool   # True when requests_used >= 20
```

---

### 5.12 Error Response Model

```python
class ErrorResponse(BaseModel):
    detail:    str        # human-readable message
    error_code: ErrorCode
    is_cached: bool = False
```

---

## 6. FastAPI REST Response Schemas

The exact JSON shape sent over the wire. Derived directly from Pydantic models
in §5 via `model.model_dump()`. Documented here as plain JSON for quick reference.

---

### 6.1 GET `/api/stock/{symbol}/quote` → `StockQuoteResponse`

```json
{
  "symbol":         "AAPL",
  "price":          213.07,
  "change":         -1.43,
  "change_percent": -0.67,
  "volume":         54382901,
  "avg_volume_30d": 61200000,
  "volume_ratio":   0.89,
  "latest_day":     "2026-06-13",
  "is_cached":      true,
  "cached_at":      "2026-06-14T08:00:00Z"
}
```

---

### 6.2 GET `/api/stock/{symbol}/price` → `OHLCVResponse`

```json
{
  "symbol":   "AAPL",
  "period":   "1Y",
  "currency": "USD",
  "data": [
    {
      "date":   "2026-06-13",
      "open":   207.5000,
      "high":   214.2000,
      "low":    206.8000,
      "close":  211.3000,
      "volume": 58200000
    },
    {
      "date":   "2026-06-12",
      "open":   209.0000,
      "high":   212.0000,
      "low":    205.5000,
      "close":  207.8000,
      "volume": 61100000
    }
  ],
  "is_cached": true,
  "cached_at": "2026-06-14T08:00:00Z"
}
```

**Note:** `data[]` is ordered **newest → oldest** (as received from Alpha Vantage).
The frontend must reverse this array before passing to chart libraries.

---

### 6.3 GET `/api/stock/{symbol}/indicators` → `IndicatorsResponse`

```json
{
  "symbol": "AAPL",
  "rsi": [
    { "date": "2026-06-13", "rsi": 58.3421 },
    { "date": "2026-06-12", "rsi": 56.1234 }
  ],
  "macd": [
    { "date": "2026-06-13", "macd": 1.2300, "signal": 0.9800, "histogram": 0.2500 }
  ],
  "ema": [
    { "date": "2026-06-13", "ema20": 209.1000, "ema50": 204.5500, "ema200": 191.3000 }
  ],
  "bollinger": [
    { "date": "2026-06-13", "upper": 218.4000, "middle": 209.1000, "lower": 199.8000 }
  ],
  "is_cached": true,
  "cached_at": "2026-06-14T08:00:00Z"
}
```

---

### 6.4 GET `/api/stock/{symbol}/signals` → `AnalyticsSignals`

```json
{
  "symbol":            "AAPL",
  "trend_signal":      "bullish",
  "crossover_type":    "none",
  "rsi_state":         "neutral",
  "rsi_value":         58.34,
  "volatility_level":  "medium",
  "volatility_value":  24.70,
  "volume_anomaly":    0.89,
  "bollinger_squeeze": false,
  "summary": "Trend is bullish (EMA 50 above EMA 200). RSI at 58 — neutral range."
}
```

---

### 6.5 GET `/api/stock/{symbol}/overview` → `CompanyOverview`

```json
{
  "symbol":         "AAPL",
  "name":           "Apple Inc",
  "description":    "Apple Inc. designs, manufactures and markets smartphones...",
  "sector":         "Technology",
  "industry":       "Consumer Electronics",
  "market_cap":     3200000000000,
  "pe_ratio":       32.50,
  "forward_pe":     28.10,
  "peg_ratio":      2.30,
  "eps":            6.56,
  "revenue_ttm":    385000000000,
  "profit_margin":  0.2638,
  "dividend_yield": 0.0050,
  "beta":           1.24,
  "week_52_high":   237.23,
  "week_52_low":    164.08,
  "analyst_target": 230.00,
  "is_cached":      true,
  "cached_at":      "2026-06-14T08:00:00Z"
}
```

---

### 6.6 GET `/api/stock/{symbol}/drawdown` → `DrawdownResponse`

```json
{
  "symbol": "AAPL",
  "data": [
    { "date": "2025-06-14", "drawdown":   0.00 },
    { "date": "2025-09-15", "drawdown": -12.40 },
    { "date": "2026-01-10", "drawdown":  -3.10 },
    { "date": "2026-06-13", "drawdown":  -1.20 }
  ]
}
```

**Note:** `drawdown` is always ≤ 0.0 (expressed as negative percentage).

---

### 6.7 GET `/api/stock/{symbol}/distribution` → `DistributionResponse`

```json
{
  "symbol": "AAPL",
  "data": [
    { "date": "2025-06-15", "daily_return":  0.73 },
    { "date": "2025-06-16", "daily_return": -1.12 },
    { "date": "2025-06-17", "daily_return":  0.45 }
  ]
}
```

---

### 6.8 GET `/api/stocks/compare` → `ComparisonResponse`

```json
{
  "symbols":   ["AAPL", "MSFT", "GOOGL"],
  "period":    "1Y",
  "base_date": "2025-06-14",
  "data": [
    { "date": "2025-06-14", "values": { "AAPL": 100.0, "MSFT": 100.0, "GOOGL": 100.0 } },
    { "date": "2025-06-15", "values": { "AAPL": 101.2, "MSFT":  98.7, "GOOGL": 103.4 } },
    { "date": "2026-06-13", "values": { "AAPL": 112.4, "MSFT":  96.9, "GOOGL": 118.7 } }
  ],
  "total_returns": {
    "AAPL":  12.4,
    "MSFT":  -3.1,
    "GOOGL": 18.7
  },
  "is_cached": true,
  "cached_at": "2026-06-14T08:00:00Z"
}
```

---

### 6.9 GET `/api/status` → `ApiStatus`

```json
{
  "date":               "2026-06-14",
  "requests_used":      8,
  "requests_limit":     25,
  "requests_remaining": 17,
  "budget_warning":     false
}
```

---

## 7. TypeScript Interfaces (Frontend)

File: `frontend/src/types/stock.ts`
These mirror the FastAPI response schemas exactly. `snake_case` field names
are preserved (no conversion to `camelCase`) to match the JSON contract 1:1.

```typescript
// ─── Primitives ───────────────────────────────────────────────────────────────

export type Period         = "1M" | "3M" | "6M" | "1Y" | "5Y";
export type TrendSignal    = "bullish" | "bearish" | "neutral";
export type CrossoverType  = "golden" | "death" | "none";
export type RSIState       = "overbought" | "oversold" | "neutral";
export type VolatilityLevel = "low" | "medium" | "high";
export type ErrorCode      =
  | "INVALID_SYMBOL"   | "INVALID_PERIOD"    | "TOO_MANY_SYMBOLS"
  | "SYMBOL_NOT_FOUND" | "BUDGET_EXHAUSTED"  | "AV_RATE_LIMITED"
  | "AV_UPSTREAM_ERROR"| "CACHE_UNAVAILABLE" | "ANALYTICS_ERROR";


// ─── Cache meta ───────────────────────────────────────────────────────────────

export interface CacheMeta {
  is_cached:  boolean;
  cached_at:  string | null;   // ISO-8601 datetime string or null
}


// ─── OHLCV ────────────────────────────────────────────────────────────────────

export interface OHLCVDataPoint {
  date:   string;   // "YYYY-MM-DD"
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

export interface OHLCVResponse extends CacheMeta {
  symbol:   string;
  period:   Period;
  currency: string;
  data:     OHLCVDataPoint[];  // newest → oldest; reverse before charting
}


// ─── Quote ────────────────────────────────────────────────────────────────────

export interface StockQuote extends CacheMeta {
  symbol:         string;
  price:          number;
  change:         number;   // may be negative
  change_percent: number;   // e.g. -0.67 (percent, not decimal)
  volume:         number;
  avg_volume_30d: number;
  volume_ratio:   number;   // today / 30d avg
  latest_day:     string;   // "YYYY-MM-DD"
}


// ─── Indicators ───────────────────────────────────────────────────────────────

export interface RSIPoint {
  date: string;
  rsi:  number;   // 0–100
}

export interface MACDPoint {
  date:      string;
  macd:      number;
  signal:    number;
  histogram: number;
}

export interface EMAPoint {
  date:   string;
  ema20:  number;
  ema50:  number;
  ema200: number;
}

export interface BollingerPoint {
  date:   string;
  upper:  number;
  middle: number;
  lower:  number;
}

export interface IndicatorsResponse extends CacheMeta {
  symbol:    string;
  rsi:       RSIPoint[];
  macd:      MACDPoint[];
  ema:       EMAPoint[];
  bollinger: BollingerPoint[];
}


// ─── Analytics Signals ────────────────────────────────────────────────────────

export interface AnalyticsSignals {
  symbol:            string;
  trend_signal:      TrendSignal;
  crossover_type:    CrossoverType;
  rsi_state:         RSIState;
  rsi_value:         number;
  volatility_level:  VolatilityLevel;
  volatility_value:  number;   // annualised vol as %, e.g. 24.7
  volume_anomaly:    number;   // ratio vs 30d avg, e.g. 1.42
  bollinger_squeeze: boolean;
  summary:           string;
}


// ─── Company Overview ─────────────────────────────────────────────────────────

export interface CompanyOverview extends CacheMeta {
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
  profit_margin:  number | null;   // 0.0–1.0
  dividend_yield: number | null;   // 0.0–1.0
  beta:           number | null;
  week_52_high:   number;
  week_52_low:    number;
  analyst_target: number | null;
}


// ─── Comparison ───────────────────────────────────────────────────────────────

export interface NormalisedPoint {
  date:   string;
  values: Record<string, number>;   // { "AAPL": 103.2, "MSFT": 98.7 }
}

export interface ComparisonResponse extends CacheMeta {
  symbols:       string[];
  period:        Period;
  base_date:     string;
  data:          NormalisedPoint[];
  total_returns: Record<string, number>;
}


// ─── Analytics Series ─────────────────────────────────────────────────────────

export interface DrawdownPoint {
  date:     string;
  drawdown: number;   // ≤ 0
}

export interface DrawdownResponse {
  symbol: string;
  data:   DrawdownPoint[];
}

export interface DistributionPoint {
  date:         string;
  daily_return: number;   // signed percentage
}

export interface DistributionResponse {
  symbol: string;
  data:   DistributionPoint[];
}


// ─── API Status ───────────────────────────────────────────────────────────────

export interface ApiStatus {
  date:                string;
  requests_used:       number;
  requests_limit:      number;
  requests_remaining:  number;
  budget_warning:      boolean;
}


// ─── Error ────────────────────────────────────────────────────────────────────

export interface ApiError {
  detail:     string;
  error_code: ErrorCode;
  is_cached:  boolean;
}


// ─── Chart library input shapes (after transformation) ────────────────────────

// lightweight-charts CandlestickData shape
export interface CandlestickBarData {
  time:  string;   // "YYYY-MM-DD" — lightweight-charts parses this
  open:  number;
  high:  number;
  low:   number;
  close: number;
}

// lightweight-charts SingleValueData (for EMA, volume)
export interface SingleValueData {
  time:  string;
  value: number;
}
```

---

## 8. Zustand Store Schema

File: `frontend/src/store/dashboardStore.ts`

```typescript
interface DashboardState {
  // ── Data ──────────────────────────────────────────────────────────────────
  activeSymbol:   string;       // currently viewed ticker, e.g. "AAPL"
  period:         Period;       // selected time range, default "1Y"

  // ── Chart overlays ────────────────────────────────────────────────────────
  overlays: {
    ema20:      boolean;        // show EMA 20 on candlestick chart
    ema50:      boolean;        // show EMA 50
    ema200:     boolean;        // show EMA 200
    bollinger:  boolean;        // show Bollinger Bands
  };

  // ── Comparison panel ──────────────────────────────────────────────────────
  compareSymbols: string[];     // max 5 symbols; the active symbol auto-included

  // ── Actions ───────────────────────────────────────────────────────────────
  setSymbol:     (symbol: string)                              => void;
  setPeriod:     (period: Period)                              => void;
  toggleOverlay: (key: keyof DashboardState["overlays"])       => void;
  addCompare:    (symbol: string)                              => void;
  removeCompare: (symbol: string)                              => void;
  resetCompare:  ()                                            => void;
}
```

#### State constraints

| Field | Type | Default | Constraint |
|---|---|---|---|
| `activeSymbol` | string | `"AAPL"` | Uppercase, 1–10 chars |
| `period` | Period | `"1Y"` | Must be one of Period enum values |
| `overlays.ema20` | boolean | `true` | — |
| `overlays.ema50` | boolean | `true` | — |
| `overlays.ema200` | boolean | `false` | — |
| `overlays.bollinger` | boolean | `false` | — |
| `compareSymbols` | string[] | `[]` | Max 5 items, no duplicates |

---

## 9. React Query Cache Key Schema

File: `frontend/src/hooks/*.ts`
React Query keys are arrays. All keys include `symbol` and optionally `period`
to scope cache entries per stock and time range.

| Hook | Query Key | Stale Time |
|---|---|---|
| `useStockQuote(symbol)` | `["quote", symbol]` | 1 hour |
| `useStockPrice(symbol, period)` | `["price", symbol, period]` | 1 hour |
| `useIndicators(symbol)` | `["indicators", symbol]` | 1 hour |
| `useSignals(symbol)` | `["signals", symbol]` | 1 hour |
| `useOverview(symbol)` | `["overview", symbol]` | 1 hour |
| `useDrawdown(symbol, period)` | `["drawdown", symbol, period]` | 1 hour |
| `useDistribution(symbol, period)` | `["distribution", symbol, period]` | 1 hour |
| `useComparison(symbols, period)` | `["compare", symbols.sort().join(","), period]` | 1 hour |
| `useApiStatus()` | `["status"]` | 5 minutes |

**Key design rules:**
- `symbol` is always uppercase before being used as a key.
- `symbols` in comparison keys are sorted alphabetically and joined, so `["AAPL","MSFT"]` and `["MSFT","AAPL"]` map to the same cache entry.
- Changing `activeSymbol` in Zustand changes the `symbol` argument, which changes the query key, which triggers a new fetch.

---

## 10. SQLite Cache Key Schema

File: `backend/services/cache.py`

Cache keys follow a strict naming convention so they are human-readable,
debuggable, and conflict-free.

### Format: `{FUNCTION}:{SYMBOL}[:{PARAMS}]`

| Endpoint | Cache Key | Example |
|---|---|---|
| `/quote` | `GLOBAL_QUOTE:{SYM}` | `GLOBAL_QUOTE:AAPL` |
| `/price` | `TIME_SERIES_DAILY:{SYM}` | `TIME_SERIES_DAILY:MSFT` |
| `/indicators` | `INDICATORS:{SYM}` | `INDICATORS:TSLA` |
| `/overview` | `OVERVIEW:{SYM}` | `OVERVIEW:GOOGL` |
| `/compare` | `COMPARE:{SORTED_SYMS}:{PERIOD}` | `COMPARE:AAPL_MSFT_TSLA:1Y` |

**Rules:**
- All characters uppercase.
- Symbol part validated to contain only `[A-Z0-9.\-]`.
- Comparison key symbols are sorted alphabetically before joining with `_`.
- No whitespace or special characters in any cache key.
- Max key length: 100 characters.

```python
# Key builders (backend/services/cache.py)

def quote_key(symbol: str) -> str:
    return f"GLOBAL_QUOTE:{symbol.upper()}"

def price_key(symbol: str) -> str:
    return f"TIME_SERIES_DAILY:{symbol.upper()}"

def indicators_key(symbol: str) -> str:
    return f"INDICATORS:{symbol.upper()}"

def overview_key(symbol: str) -> str:
    return f"OVERVIEW:{symbol.upper()}"

def compare_key(symbols: list[str], period: str) -> str:
    sorted_syms = "_".join(sorted(s.upper() for s in symbols))
    return f"COMPARE:{sorted_syms}:{period}"
```

---

## 11. Field Data Dictionary

Complete reference for every significant field across all schemas.
Useful when a field name appears in multiple schemas — this is the definitive definition.

| Field | Type (Python) | Type (TS) | Unit | Nullable | Constraints | Description |
|---|---|---|---|---|---|---|
| `symbol` | `str` | `string` | — | No | 1–10 chars, `[A-Z0-9.\-]` | Stock ticker (uppercase) |
| `date` | `str` | `string` | — | No | `YYYY-MM-DD` format | Calendar date of a data point |
| `open` | `float` | `number` | USD | No | > 0 | Opening price for the trading day |
| `high` | `float` | `number` | USD | No | ≥ open | Intraday high price |
| `low` | `float` | `number` | USD | No | ≤ open, > 0 | Intraday low price |
| `close` | `float` | `number` | USD | No | > 0 | Closing price for the trading day |
| `volume` | `int` | `number` | shares | No | ≥ 0 | Number of shares traded |
| `price` | `float` | `number` | USD | No | > 0 | Current/latest price |
| `change` | `float` | `number` | USD | No | Any | Price change vs previous close (signed) |
| `change_percent` | `float` | `number` | % | No | Any | Percentage change vs previous close |
| `avg_volume_30d` | `int` | `number` | shares | No | > 0 | 30-day rolling average trading volume |
| `volume_ratio` | `float` | `number` | ratio | No | > 0 | `today_volume / avg_volume_30d` |
| `latest_day` | `str` | `string` | — | No | `YYYY-MM-DD` | Most recent trading date in the data |
| `rsi` | `float` | `number` | — | No | 0–100 | RSI oscillator value (Wilder, 14-period) |
| `macd` | `float` | `number` | USD | No | Any | MACD line = EMA(12) − EMA(26) |
| `signal` | `float` | `number` | USD | No | Any | MACD signal = EMA(9) of MACD |
| `histogram` | `float` | `number` | USD | No | Any | `macd − signal` |
| `ema20` | `float` | `number` | USD | No | > 0 | 20-period exponential moving average |
| `ema50` | `float` | `number` | USD | No | > 0 | 50-period exponential moving average |
| `ema200` | `float` | `number` | USD | No | > 0 | 200-period exponential moving average |
| `upper` | `float` | `number` | USD | No | > middle | Bollinger upper band (SMA20 + 2σ) |
| `middle` | `float` | `number` | USD | No | > 0 | Bollinger middle band (SMA20) |
| `lower` | `float` | `number` | USD | No | > 0, < middle | Bollinger lower band (SMA20 − 2σ) |
| `trend_signal` | `TrendSignal` | `TrendSignal` | — | No | Enum | EMA-crossover-derived trend direction |
| `crossover_type` | `CrossoverType` | `CrossoverType` | — | No | Enum | Whether a crossover occurred this candle |
| `rsi_state` | `RSIState` | `RSIState` | — | No | Enum | RSI-based market condition label |
| `rsi_value` | `float` | `number` | — | No | 0–100 | Most recent RSI value |
| `volatility_level` | `VolatilityLevel` | `VolatilityLevel` | — | No | Enum | Bucketed volatility category |
| `volatility_value` | `float` | `number` | % | No | > 0 | Annualised rolling 20-day volatility |
| `volume_anomaly` | `float` | `number` | ratio | No | > 0 | Today's volume / 30-day average volume |
| `bollinger_squeeze` | `bool` | `boolean` | — | No | — | True if BB width is below 20th percentile |
| `summary` | `str` | `string` | — | No | Max 300 chars | Plain-English analytics summary |
| `market_cap` | `int` | `number` | USD | Yes | > 0 | Total market capitalisation |
| `pe_ratio` | `float` | `number` | — | Yes | > 0 | Trailing price-to-earnings ratio |
| `forward_pe` | `float` | `number` | — | Yes | > 0 | Forward (next 12m) P/E estimate |
| `peg_ratio` | `float` | `number` | — | Yes | Any | Price/earnings-to-growth ratio |
| `eps` | `float` | `number` | USD | Yes | Any | Earnings per share (TTM) |
| `revenue_ttm` | `int` | `number` | USD | Yes | > 0 | Total revenue (trailing 12 months) |
| `profit_margin` | `float` | `number` | decimal | Yes | 0–1 | Net profit margin (0.26 = 26%) |
| `dividend_yield` | `float` | `number` | decimal | Yes | 0–1 | Annual dividend yield (0.005 = 0.5%) |
| `beta` | `float` | `number` | — | Yes | Any | Volatility vs market (1.0 = market) |
| `week_52_high` | `float` | `number` | USD | No | > 0 | 52-week price high |
| `week_52_low` | `float` | `number` | USD | No | > 0 | 52-week price low |
| `analyst_target` | `float` | `number` | USD | Yes | > 0 | Consensus analyst 12-month price target |
| `drawdown` | `float` | `number` | % | No | ≤ 0 | Peak-to-trough decline at this date |
| `daily_return` | `float` | `number` | % | No | Any | Percentage return for a single day |
| `base_date` | `str` | `string` | — | No | `YYYY-MM-DD` | Date where all comparison series = 100 |
| `total_returns` | `dict[str,float]` | `Record<string,number>` | % | No | Any | Total return per symbol over period |
| `requests_used` | `int` | `number` | — | No | 0–25 | Alpha Vantage calls made today |
| `requests_limit` | `int` | `number` | — | No | Always 25 | Free tier daily limit |
| `budget_warning` | `bool` | `boolean` | — | No | — | True when requests_used ≥ 20 |
| `is_cached` | `bool` | `boolean` | — | No | — | True if response came from SQLite cache |
| `cached_at` | `datetime \| None` | `string \| null` | ISO-8601 | Yes | — | When this data was originally fetched |

---

## 12. Schema Transformation Maps

How field names and types change at each layer boundary.

### 12.1 Alpha Vantage OHLCV → Internal Python Dict

| AV raw field | Transformation | Internal field | Type change |
|---|---|---|---|
| `"1. open"` | strip prefix, rename | `open` | `str → float` |
| `"2. high"` | strip prefix, rename | `high` | `str → float` |
| `"3. low"` | strip prefix, rename | `low` | `str → float` |
| `"4. close"` | strip prefix, rename | `close` | `str → float` |
| `"5. volume"` | strip prefix, rename | `volume` | `str → int` |
| date key (dict key) | extracted from dict | `date` | `str` (unchanged format) |

### 12.2 Alpha Vantage GLOBAL_QUOTE → Internal Python Dict

| AV raw field | Transformation | Internal field | Type change |
|---|---|---|---|
| `"01. symbol"` | strip prefix, rename | `symbol` | `str` |
| `"05. price"` | strip prefix, rename | `price` | `str → float` |
| `"09. change"` | strip prefix, rename | `change` | `str → float` |
| `"10. change percent"` | strip `%`, rename | `change_percent` | `str → float` |
| `"06. volume"` | strip prefix, rename | `volume` | `str → int` |
| `"07. latest trading day"` | strip prefix, rename | `latest_day` | `str` |

### 12.3 Alpha Vantage OVERVIEW → Internal Python Dict

| AV raw field | Transformation | Internal field | Type change |
|---|---|---|---|
| `"Symbol"` | rename (lowercase) | `symbol` | `str` |
| `"Name"` | rename | `name` | `str` |
| `"MarketCapitalization"` | rename | `market_cap` | `str → int \| None` |
| `"PERatio"` | rename | `pe_ratio` | `str → float \| None` |
| `"ForwardPE"` | rename | `forward_pe` | `str → float \| None` |
| `"EPS"` | rename | `eps` | `str → float \| None` |
| `"RevenueTTM"` | rename | `revenue_ttm` | `str → int \| None` |
| `"ProfitMargin"` | rename | `profit_margin` | `str → float \| None` |
| `"DividendYield"` | rename | `dividend_yield` | `str → float \| None` |
| `"Beta"` | rename | `beta` | `str → float \| None` |
| `"52WeekHigh"` | rename | `week_52_high` | `str → float` |
| `"52WeekLow"` | rename | `week_52_low` | `str → float` |
| `"AnalystTargetPrice"` | rename | `analyst_target` | `str → float \| None` |
| `"None"` string | convert | Python `None` | `str → None` |

### 12.4 Internal Python Dict → Frontend TypeScript

No field renames. All fields use `snake_case` at every layer.
Type mapping is automatic via JSON serialisation:

| Python type | JSON | TypeScript type |
|---|---|---|
| `str` | `string` | `string` |
| `float` | `number` | `number` |
| `int` | `number` | `number` |
| `bool` | `boolean` | `boolean` |
| `None` | `null` | `null` |
| `list[T]` | `array` | `T[]` |
| `dict[str, T]` | `object` | `Record<string, T>` |
| `datetime` | ISO-8601 string | `string` |

### 12.5 Frontend OHLCV → lightweight-charts Format

```
OHLCVDataPoint[]             →    CandlestickBarData[]
(newest → oldest)                 (oldest → newest)

{ date, open, high,          →    { time, open, high,
  low, close, volume }              low, close }

Transformations:
- Reverse array order (oldest first for charts)
- Rename `date` → `time`
- Drop `volume` (handled by separate VolumeChart series)
```

```typescript
// chartHelpers.ts
export function tocandlestickData(data: OHLCVDataPoint[]): CandlestickBarData[] {
  return [...data]
    .reverse()
    .map(({ date, open, high, low, close }) => ({
      time: date,
      open, high, low, close,
    }));
}

export function toVolumeData(data: OHLCVDataPoint[]): SingleValueData[] {
  return [...data]
    .reverse()
    .map(({ date, volume }) => ({
      time:  date,
      value: volume,
    }));
}
```

---

## 13. Error Schema Reference

### 13.1 Backend error response

All errors from FastAPI follow this shape, returned as JSON with the
appropriate HTTP status code.

```json
{
  "detail":    "Daily API request limit reached (24/25). Using cached data only.",
  "error_code": "BUDGET_EXHAUSTED",
  "is_cached":  false
}
```

### 13.2 Full error reference table

| `error_code` | HTTP | `is_cached` | `detail` (example) |
|---|---|---|---|
| `INVALID_SYMBOL` | 400 | false | `"Symbol 'AAPL$' contains invalid characters"` |
| `INVALID_PERIOD` | 400 | false | `"Period '2Y' is not valid. Use: 1M 3M 6M 1Y 5Y"` |
| `TOO_MANY_SYMBOLS` | 400 | false | `"Maximum 5 symbols for comparison. Got 7."` |
| `SYMBOL_NOT_FOUND` | 404 | false | `"No data found for symbol 'XYZQ'"` |
| `BUDGET_EXHAUSTED` | 429 | true/false | `"Daily request limit reached (24/25)"` |
| `AV_RATE_LIMITED` | 429 | false | `"Alpha Vantage rate limit hit. Retry in 60 seconds."` |
| `AV_UPSTREAM_ERROR` | 502 | false | `"Alpha Vantage returned an error: Invalid API call"` |
| `CACHE_UNAVAILABLE` | 503 | false | `"Cache database unavailable. Try again shortly."` |
| `ANALYTICS_ERROR` | 500 | false | `"Insufficient data to compute signals for NEWSTOCK"` |

### 13.3 Frontend `ApiError` handling

```typescript
// All caught by Axios interceptor → React Query → component
interface ApiError {
  detail:     string;      // show directly in ErrorBanner
  error_code: ErrorCode;   // used for conditional UI logic
  is_cached:  boolean;     // if true, stale data may still be available
}

// Component-level handling pattern:
if (error.error_code === "BUDGET_EXHAUSTED" && data) {
  // Show stale data with warning banner — don't block the UI
}
if (error.error_code === "SYMBOL_NOT_FOUND") {
  // Clear the symbol input, show "Symbol not found" inline
}
```

---

## 14. Schema Validation Rules

### Backend (Pydantic)

| Rule | Where enforced | What triggers it |
|---|---|---|
| Symbol: `[A-Z0-9.\-]{1,10}` | `sanitise_symbol()` in all routers | Any request with invalid symbol |
| Period: one of enum values | Pydantic `Period` literal | Query param validation |
| RSI: 0.0 – 100.0 | `RSIPoint.validate_rsi_range` | Computed value out of range |
| Price: > 0 | `OHLCVDataPoint.validate_positive_price` | Negative/zero price in data |
| Volume: ≥ 0 | `OHLCVDataPoint.validate_positive_volume` | Negative volume |
| Data list: ≥ 2 items | `OHLCVResponse.validate_min_data_points` | Not enough data for analysis |
| Symbols in compare: ≤ 5 | Router-level check before Pydantic | Too many compare symbols |
| `"None"` string → `None` | OVERVIEW normaliser function | All nullable fields from AV |

### Frontend (TypeScript + runtime)

| Rule | Where enforced | Purpose |
|---|---|---|
| Symbol input: uppercase only | `setSymbol()` in Zustand | Normalise before API call |
| Max 5 compare symbols | `addCompare()` in Zustand | Match backend constraint |
| No duplicate compare symbols | `addCompare()` uses `Set` | Clean state |
| Array reversal before charting | `chartHelpers.ts` | lightweight-charts requires ascending dates |
| Null checks on overview fields | Component-level guards | `pe_ratio` etc. may be null |
| `change_percent` display | `formatters.formatPercent()` | Show `−0.67%` not `−0.0067` |

---

*End of SCHEMA.md v1.0*
