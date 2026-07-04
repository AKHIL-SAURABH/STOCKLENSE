# Technical Specification
## StockLens — Stock Market Analytics Dashboard

| Field | Details |
|---|---|
| **Document Type** | Technical Specification |
| **Project** | StockLens |
| **Version** | v1.0 |
| **Status** | Draft |
| **Author** | — |
| **Created** | June 2026 |
| **References** | PRD v1.0 |

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Environment & Configuration](#2-environment--configuration)
3. [Backend — FastAPI](#3-backend--fastapi)
   - 3.1 Dependencies
   - 3.2 Application Bootstrap
   - 3.3 CORS & Middleware
   - 3.4 Database Schema (SQLite)
   - 3.5 Alpha Vantage Client
   - 3.6 Cache Manager
   - 3.7 Analytics Engine
   - 3.8 API Endpoints (full contract)
   - 3.9 Error Handling
   - 3.10 Request Budget Monitor
4. [Frontend — React](#4-frontend--react)
   - 4.1 Dependencies
   - 4.2 Project Bootstrap
   - 4.3 Environment Config
   - 4.4 API Client (Axios)
   - 4.5 TypeScript Interfaces
   - 4.6 Component Architecture
   - 4.7 State Management
   - 4.8 Charting Library Decision
5. [API Contract — Full Endpoint Reference](#5-api-contract--full-endpoint-reference)
6. [Caching Strategy](#6-caching-strategy)
7. [Analytics Engine — Computation Logic](#7-analytics-engine--computation-logic)
8. [Error Codes & Handling](#8-error-codes--handling)
9. [Deployment](#9-deployment)
10. [Security Checklist](#10-security-checklist)
11. [Testing Strategy](#11-testing-strategy)

---

## 1. System Overview

StockLens is a two-process application:

- **FastAPI backend** (Python 3.11+): Owns all communication with Alpha Vantage, manages the SQLite cache, computes analytics signals, and exposes a REST API consumed by the frontend.
- **React frontend** (TypeScript, Vite): Renders the dashboard UI. Never calls Alpha Vantage directly. All data comes exclusively through the FastAPI backend.

```
Browser
  └── React App (Vite, port 5173 in dev)
        └── Axios HTTP calls → FastAPI (Uvicorn, port 8000)
                                  ├── SQLite (stock_cache.db)
                                  └── Alpha Vantage API (external, HTTPS)
```

Communication between frontend and backend is JSON over HTTP/1.1. No WebSockets in v1.0.

---

## 2. Environment & Configuration

### Backend `.env`
```env
# Alpha Vantage
ALPHA_VANTAGE_API_KEY=your_key_here

# Cache TTLs (seconds)
CACHE_TTL_DAILY=86400        # 24 hours — for OHLCV, indicators, overview
CACHE_TTL_QUOTE=3600         # 1 hour  — for real-time GLOBAL_QUOTE
CACHE_TTL_COMPARISON=86400   # 24 hours — for normalised comparison series

# API budget
DAILY_REQUEST_LIMIT=25
DAILY_REQUEST_HARD_STOP=24   # block new calls after this many

# App
ENVIRONMENT=development      # development | production
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:8000
```

Both `.env` files must be listed in `.gitignore`. Commit `.env.example` files with placeholder values instead.

---

## 3. Backend — FastAPI

### 3.1 Dependencies

```txt
# requirements.txt
fastapi==0.111.0
uvicorn[standard]==0.29.0
httpx==0.27.0          # async HTTP client for Alpha Vantage calls
pandas==2.2.2          # data manipulation for analytics engine
numpy==1.26.4          # numerical computation
python-dotenv==1.0.1
pydantic==2.7.1
pydantic-settings==2.2.1
aiosqlite==0.20.0      # async SQLite driver
```

Install with:
```bash
pip install -r requirements.txt
```

---

### 3.2 Application Bootstrap

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import stock, indicators, compare, status
from db.database import init_db
from config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()          # create tables on startup
    yield

app = FastAPI(
    title="StockLens API",
    version="1.0.0",
    description="Stock Market Analytics Dashboard API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

app.include_router(stock.router,       prefix="/api/stock",  tags=["Stock Data"])
app.include_router(indicators.router,  prefix="/api/stock",  tags=["Indicators"])
app.include_router(compare.router,     prefix="/api/stocks", tags=["Comparison"])
app.include_router(status.router,      prefix="/api",        tags=["Status"])
```

---

### 3.3 CORS & Middleware

In development, `ALLOWED_ORIGINS=http://localhost:5173` (Vite default port).
In production, replace with your deployed frontend URL (e.g., `https://stocklens.vercel.app`).

No authentication middleware in v1.0. If deployed publicly, add a simple API key header check.

---

### 3.4 Database Schema (SQLite)

Three tables. All created automatically at startup via `init_db()`.

```sql
-- Table 1: API response cache
CREATE TABLE IF NOT EXISTS api_cache (
    cache_key     TEXT PRIMARY KEY,
    response_data TEXT NOT NULL,       -- JSON string
    fetched_at    INTEGER NOT NULL,    -- Unix timestamp
    ttl_seconds   INTEGER NOT NULL
);

-- Table 2: Daily API request counter
CREATE TABLE IF NOT EXISTS api_budget (
    date          TEXT PRIMARY KEY,    -- YYYY-MM-DD
    request_count INTEGER DEFAULT 0
);

-- Table 3: Watchlist (v1.1 feature, table created in v1.0)
CREATE TABLE IF NOT EXISTS watchlist (
    symbol        TEXT PRIMARY KEY,
    added_at      INTEGER NOT NULL
);
```

**Cache key convention:** `{function}:{symbol}:{params_hash}`

Examples:
- `TIME_SERIES_DAILY:AAPL:compact`
- `RSI:AAPL:daily:14:close`
- `OVERVIEW:MSFT`
- `GLOBAL_QUOTE:TSLA`

---

### 3.5 Alpha Vantage Client

```python
# services/alpha_vantage.py
import httpx
from config import settings
from services.budget import increment_budget, can_make_request

BASE_URL = "https://www.alphavantage.co/query"

async def fetch_alpha_vantage(params: dict) -> dict:
    """
    Core HTTP client for Alpha Vantage. 
    Checks budget before every call. Raises BudgetExhaustedError if at limit.
    """
    if not await can_make_request():
        raise BudgetExhaustedError("Daily API request limit reached (24/25). Using cached data only.")

    params["apikey"] = settings.ALPHA_VANTAGE_API_KEY

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(BASE_URL, params=params)
        response.raise_for_status()

    data = response.json()

    # Alpha Vantage returns 200 even for errors — check for error keys
    if "Error Message" in data:
        raise AlphaVantageError(data["Error Message"])
    if "Note" in data:
        raise RateLimitError("Alpha Vantage rate limit hit. Try again in 1 minute.")
    if "Information" in data:
        raise RateLimitError("Alpha Vantage daily limit reached.")

    await increment_budget()
    return data
```

**Alpha Vantage endpoints used in v1.0:**

| Function String | Purpose | Key Response Field |
|---|---|---|
| `TIME_SERIES_DAILY` | OHLCV daily prices | `Time Series (Daily)` |
| `GLOBAL_QUOTE` | Real-time snapshot | `Global Quote` |
| `RSI` | RSI values | `Technical Analysis: RSI` |
| `MACD` | MACD line + signal + hist | `Technical Analysis: MACD` |
| `EMA` | Exponential moving average | `Technical Analysis: EMA` |
| `BBANDS` | Bollinger Bands | `Technical Analysis: BBANDS` |
| `OVERVIEW` | Company fundamentals | (flat JSON object) |

---

### 3.6 Cache Manager

```python
# services/cache.py
import json
import time
import aiosqlite
from config import settings

DB_PATH = "db/stock_cache.db"

async def get_cached(cache_key: str) -> dict | None:
    """Returns parsed JSON if cache is fresh, else None."""
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT response_data, fetched_at, ttl_seconds FROM api_cache WHERE cache_key = ?",
            (cache_key,)
        ) as cursor:
            row = await cursor.fetchone()

    if row is None:
        return None

    response_data, fetched_at, ttl_seconds = row
    age = time.time() - fetched_at

    if age > ttl_seconds:
        return None  # cache expired

    return json.loads(response_data)


async def set_cached(cache_key: str, data: dict, ttl_seconds: int) -> None:
    """Writes or replaces a cache entry."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT OR REPLACE INTO api_cache (cache_key, response_data, fetched_at, ttl_seconds) VALUES (?,?,?,?)",
            (cache_key, json.dumps(data), int(time.time()), ttl_seconds)
        )
        await db.commit()


async def fetch_with_cache(cache_key: str, fetch_fn, ttl_seconds: int) -> dict:
    """
    Cache-aside pattern. Check cache → if miss, fetch from API → store → return.
    This is the primary pattern used in all service functions.
    """
    cached = await get_cached(cache_key)
    if cached is not None:
        return cached

    fresh_data = await fetch_fn()
    await set_cached(cache_key, fresh_data, ttl_seconds)
    return fresh_data
```

---

### 3.7 Analytics Engine

All analytics are computed server-side from the cached OHLCV data using Pandas. This avoids extra API calls — the analytics engine is pure computation over data already in cache.

```python
# services/analytics.py
import pandas as pd
import numpy as np
from models.schemas import AnalyticsSignals

def compute_signals(ohlcv_records: list[dict]) -> AnalyticsSignals:
    """
    Input: list of OHLCV dicts sorted oldest → newest
    Output: AnalyticsSignals object
    """
    df = pd.DataFrame(ohlcv_records)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").set_index("date")
    df["close"] = df["close"].astype(float)
    df["volume"] = df["volume"].astype(float)

    # --- Daily returns ---
    df["daily_return"] = df["close"].pct_change()

    # --- Rolling volatility (20-day annualised) ---
    df["rolling_vol"] = df["daily_return"].rolling(20).std() * np.sqrt(252)
    latest_vol = float(df["rolling_vol"].iloc[-1])
    vol_level = "low" if latest_vol < 0.2 else ("high" if latest_vol > 0.4 else "medium")

    # --- EMA crossover (golden / death cross) ---
    df["ema50"]  = df["close"].ewm(span=50,  adjust=False).mean()
    df["ema200"] = df["close"].ewm(span=200, adjust=False).mean()
    prev_diff = df["ema50"].iloc[-2] - df["ema200"].iloc[-2]
    curr_diff = df["ema50"].iloc[-1] - df["ema200"].iloc[-1]

    if prev_diff < 0 and curr_diff >= 0:
        crossover_type = "golden"
        trend_signal   = "bullish"
    elif prev_diff > 0 and curr_diff <= 0:
        crossover_type = "death"
        trend_signal   = "bearish"
    else:
        crossover_type = "none"
        trend_signal   = "bullish" if curr_diff > 0 else "bearish"

    # --- RSI (14-period, Wilder smoothing) ---
    delta = df["close"].diff()
    gain  = delta.clip(lower=0).rolling(14).mean()
    loss  = (-delta.clip(upper=0)).rolling(14).mean()
    rs    = gain / loss.replace(0, np.nan)
    rsi   = float(100 - (100 / (1 + rs.iloc[-1])))
    rsi_state = "overbought" if rsi > 70 else ("oversold" if rsi < 30 else "neutral")

    # --- Volume anomaly ---
    avg_vol_30d   = float(df["volume"].rolling(30).mean().iloc[-1])
    today_vol     = float(df["volume"].iloc[-1])
    volume_ratio  = round(today_vol / avg_vol_30d, 2) if avg_vol_30d > 0 else 1.0

    # --- Bollinger squeeze (band width < 20th percentile) ---
    df["sma20"]   = df["close"].rolling(20).mean()
    df["std20"]   = df["close"].rolling(20).std()
    df["bb_width"] = (df["std20"] * 4) / df["sma20"]
    bb_width_pct   = df["bb_width"].rank(pct=True).iloc[-1]
    bollinger_squeeze = bool(bb_width_pct < 0.20)

    # --- Plain-English summary ---
    summary = _build_summary(trend_signal, crossover_type, rsi_state, rsi, vol_level, volume_ratio, bollinger_squeeze)

    return AnalyticsSignals(
        trend_signal=trend_signal,
        crossover_type=crossover_type,
        rsi_state=rsi_state,
        rsi_value=round(rsi, 2),
        volatility_level=vol_level,
        volatility_value=round(latest_vol * 100, 2),
        volume_anomaly=volume_ratio,
        bollinger_squeeze=bollinger_squeeze,
        summary=summary
    )


def compute_normalised_series(ohlcv_map: dict[str, list[dict]]) -> dict:
    """
    Normalise multiple OHLCV series to base 100 at the earliest common date.
    Used for the multi-stock comparison chart.
    """
    dfs = {}
    for symbol, records in ohlcv_map.items():
        df = pd.DataFrame(records)[["date", "close"]].copy()
        df["close"] = df["close"].astype(float)
        df = df.sort_values("date").set_index("date")
        dfs[symbol] = df

    combined = pd.DataFrame({sym: df["close"] for sym, df in dfs.items()}).dropna()
    normalised = (combined / combined.iloc[0]) * 100
    return normalised.reset_index().to_dict(orient="records")


def compute_drawdown(ohlcv_records: list[dict]) -> list[dict]:
    """Computes peak-to-trough drawdown percentage for each date."""
    df = pd.DataFrame(ohlcv_records)[["date", "close"]].copy()
    df["close"] = df["close"].astype(float)
    df = df.sort_values("date")
    df["peak"]     = df["close"].cummax()
    df["drawdown"] = ((df["close"] - df["peak"]) / df["peak"]) * 100
    return df[["date", "drawdown"]].to_dict(orient="records")


def compute_return_distribution(ohlcv_records: list[dict]) -> list[dict]:
    """Returns daily return values for histogram plotting on the frontend."""
    df = pd.DataFrame(ohlcv_records)[["date", "close"]].copy()
    df["close"]        = df["close"].astype(float)
    df                 = df.sort_values("date")
    df["daily_return"] = df["close"].pct_change() * 100
    df                 = df.dropna()
    return df[["date", "daily_return"]].to_dict(orient="records")


def _build_summary(trend, crossover, rsi_state, rsi, vol_level, vol_ratio, squeeze) -> str:
    parts = []
    if crossover == "golden":
        parts.append("A golden cross just formed — a bullish trend signal.")
    elif crossover == "death":
        parts.append("A death cross just formed — a bearish trend signal.")
    else:
        parts.append(f"Trend is {'bullish' if trend == 'bullish' else 'bearish'} (EMA 50 {'above' if trend == 'bullish' else 'below'} EMA 200).")

    if rsi_state == "overbought":
        parts.append(f"RSI at {rsi:.0f} — stock may be overbought.")
    elif rsi_state == "oversold":
        parts.append(f"RSI at {rsi:.0f} — stock may be oversold.")

    if vol_ratio >= 2.0:
        parts.append(f"Volume is {vol_ratio}× the 30-day average — unusual activity detected.")

    if squeeze:
        parts.append("Bollinger Bands are in a squeeze — a large price move may be approaching.")

    return " ".join(parts)
```

---

## 4. Frontend — React

### 4.1 Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "axios": "^1.7.2",
    "lightweight-charts": "^4.1.3",
    "recharts": "^2.12.7",
    "react-query": "^3.39.3",
    "zustand": "^4.5.2",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.4.5",
    "vite": "^5.3.1",
    "tailwindcss": "^3.4.4"
  }
}
```

**Charting library decision:**
- **Candlestick chart** → `lightweight-charts` (TradingView). Superior performance, purpose-built for financial data, handles 10k+ candles without lag.
- **All other charts** (RSI, MACD, comparison, drawdown, histogram) → `recharts`. Good enough for line/bar charts, React-native API, easier to customise.

---

### 4.2 Project Bootstrap

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npx tailwindcss init -p
```

Tailwind config — extend with dashboard-specific colors:
```js
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bull":  "#22c55e",   // green — price up
        "bear":  "#ef4444",   // red   — price down
        "chart": "#1e293b",   // dark chart background
      }
    }
  }
}
```

---

### 4.3 Environment Config

```ts
// src/config.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
```

---

### 4.4 API Client (Axios)

```ts
// src/api/client.ts
import axios from "axios";
import { API_BASE_URL } from "../config";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Response interceptor — normalise errors
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail ?? "API error. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
```

```ts
// src/api/stockApi.ts
import apiClient from "./client";
import type {
  StockQuote, OHLCVResponse, IndicatorsResponse,
  AnalyticsSignals, CompanyOverview, ComparisonResponse,
  DrawdownResponse, DistributionResponse, ApiStatus
} from "../types/stock";

export const stockApi = {
  getQuote:        (symbol: string) =>
    apiClient.get<StockQuote>(`/api/stock/${symbol}/quote`).then(r => r.data),

  getPrice:        (symbol: string, period = "1Y") =>
    apiClient.get<OHLCVResponse>(`/api/stock/${symbol}/price`, { params: { period } }).then(r => r.data),

  getIndicators:   (symbol: string) =>
    apiClient.get<IndicatorsResponse>(`/api/stock/${symbol}/indicators`).then(r => r.data),

  getSignals:      (symbol: string) =>
    apiClient.get<AnalyticsSignals>(`/api/stock/${symbol}/signals`).then(r => r.data),

  getOverview:     (symbol: string) =>
    apiClient.get<CompanyOverview>(`/api/stock/${symbol}/overview`).then(r => r.data),

  getDrawdown:     (symbol: string, period = "1Y") =>
    apiClient.get<DrawdownResponse>(`/api/stock/${symbol}/drawdown`, { params: { period } }).then(r => r.data),

  getDistribution: (symbol: string, period = "1Y") =>
    apiClient.get<DistributionResponse>(`/api/stock/${symbol}/distribution`, { params: { period } }).then(r => r.data),

  compareStocks:   (symbols: string[], period = "1Y") =>
    apiClient.get<ComparisonResponse>(`/api/stocks/compare`, { params: { symbols: symbols.join(","), period } }).then(r => r.data),

  getStatus:       () =>
    apiClient.get<ApiStatus>(`/api/status`).then(r => r.data),
};
```

---

### 4.5 TypeScript Interfaces

```ts
// src/types/stock.ts

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

export interface OHLCVDataPoint {
  date:   string;
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

export interface OHLCVResponse {
  symbol:   string;
  period:   string;
  currency: string;
  data:     OHLCVDataPoint[];
}

export interface RSIPoint       { date: string; rsi:    number; }
export interface MACDPoint      { date: string; macd:   number; signal: number; histogram: number; }
export interface EMAPoint       { date: string; ema20:  number; ema50:  number; ema200:   number; }
export interface BollingerPoint { date: string; upper:  number; middle: number; lower:    number; }

export interface IndicatorsResponse {
  symbol:     string;
  rsi:        RSIPoint[];
  macd:       MACDPoint[];
  ema:        EMAPoint[];
  bollinger:  BollingerPoint[];
}

export type TrendSignal    = "bullish" | "bearish" | "neutral";
export type CrossoverType  = "golden"  | "death"   | "none";
export type RSIState       = "overbought" | "oversold" | "neutral";
export type VolatilityLevel = "low" | "medium" | "high";

export interface AnalyticsSignals {
  trend_signal:      TrendSignal;
  crossover_type:    CrossoverType;
  rsi_state:         RSIState;
  rsi_value:         number;
  volatility_level:  VolatilityLevel;
  volatility_value:  number;       // annualised vol as a percentage
  volume_anomaly:    number;       // ratio vs 30-day average
  bollinger_squeeze: boolean;
  summary:           string;
}

export interface CompanyOverview {
  symbol:           string;
  name:             string;
  description:      string;
  sector:           string;
  industry:         string;
  market_cap:       number;
  pe_ratio:         number | null;
  forward_pe:       number | null;
  peg_ratio:        number | null;
  eps:              number | null;
  revenue_ttm:      number | null;
  profit_margin:    number | null;
  dividend_yield:   number | null;
  beta:             number | null;
  week_52_high:     number;
  week_52_low:      number;
  analyst_target:   number | null;
}

export interface NormalisedPoint {
  date:             string;
  [symbol: string]: number | string;  // dynamic keys per ticker
}

export interface ComparisonResponse {
  symbols:          string[];
  period:           string;
  base_date:        string;
  data:             NormalisedPoint[];
  total_returns:    Record<string, number>;
}

export interface DrawdownPoint    { date: string; drawdown:     number; }
export interface DistributionPoint { date: string; daily_return: number; }

export interface DrawdownResponse     { symbol: string; data: DrawdownPoint[];     }
export interface DistributionResponse { symbol: string; data: DistributionPoint[]; }

export interface ApiStatus {
  date:             string;
  requests_used:    number;
  requests_limit:   number;
  requests_remaining: number;
  budget_warning:   boolean;
}
```

---

### 4.6 Component Architecture

```
src/
├── App.tsx                         # Layout shell, route-level state
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx     # Sidebar + main content shell
│   │   ├── Header.tsx              # App name, symbol search, status badge
│   │   └── Sidebar.tsx             # Watchlist panel (v1.1)
│   ├── market/
│   │   ├── MarketSummaryBar.tsx    # Price, change, volume metrics
│   │   └── FundamentalsPanel.tsx   # P/E, EPS, market cap table
│   ├── charts/
│   │   ├── CandlestickChart.tsx    # lightweight-charts wrapper
│   │   ├── VolumeChart.tsx         # recharts bar chart
│   │   ├── RSIChart.tsx            # recharts line + threshold bands
│   │   ├── MACDChart.tsx           # recharts line + histogram
│   │   ├── ComparisonChart.tsx     # normalised multi-stock recharts
│   │   ├── DrawdownChart.tsx       # recharts area chart
│   │   └── DistributionChart.tsx   # recharts bar histogram
│   ├── analytics/
│   │   ├── AnalyticsInsights.tsx   # Signal cards grid
│   │   ├── SignalBadge.tsx         # Bullish/Bearish/Neutral pill
│   │   └── SummaryCard.tsx         # Plain-English summary block
│   ├── controls/
│   │   ├── SymbolSearch.tsx        # Text input with submit
│   │   ├── PeriodSelector.tsx      # 1M/3M/6M/1Y/5Y tabs
│   │   ├── OverlayToggles.tsx      # EMA/Bollinger checkboxes
│   │   └── CompareInput.tsx        # Add/remove tickers for comparison
│   └── shared/
│       ├── MetricCard.tsx          # Reusable stat card
│       ├── LoadingSkeleton.tsx     # Skeleton screen while fetching
│       ├── ErrorBanner.tsx         # API error display
│       └── BudgetWarning.tsx       # Alert when API requests nearly exhausted
├── hooks/
│   ├── useStockData.ts             # React Query hook: quote + OHLCV
│   ├── useIndicators.ts            # React Query hook: RSI, MACD, EMA, BB
│   ├── useSignals.ts               # React Query hook: analytics signals
│   └── useComparison.ts            # React Query hook: normalised comparison
├── store/
│   └── dashboardStore.ts           # Zustand: active symbol, period, overlays
├── api/
│   ├── client.ts
│   └── stockApi.ts
├── types/
│   └── stock.ts
├── utils/
│   ├── formatters.ts               # formatPrice, formatVolume, formatPercent
│   └── chartHelpers.ts             # Transform API data for chart libraries
└── config.ts
```

---

### 4.7 State Management

Global state is kept minimal. Zustand manages only the dashboard-level controls. All server state (fetched data, loading, errors) is managed by React Query.

```ts
// src/store/dashboardStore.ts
import { create } from "zustand";

interface DashboardState {
  activeSymbol:    string;
  period:          "1M" | "3M" | "6M" | "1Y" | "5Y";
  overlays:        { ema20: boolean; ema50: boolean; ema200: boolean; bollinger: boolean; };
  compareSymbols:  string[];
  setSymbol:       (symbol: string) => void;
  setPeriod:       (period: DashboardState["period"]) => void;
  toggleOverlay:   (key: keyof DashboardState["overlays"]) => void;
  addCompare:      (symbol: string) => void;
  removeCompare:   (symbol: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeSymbol:   "AAPL",
  period:         "1Y",
  overlays:       { ema20: true, ema50: true, ema200: false, bollinger: false },
  compareSymbols: [],

  setSymbol:      (symbol)  => set({ activeSymbol: symbol.toUpperCase() }),
  setPeriod:      (period)  => set({ period }),
  toggleOverlay:  (key)     => set((s) => ({ overlays: { ...s.overlays, [key]: !s.overlays[key] } })),
  addCompare:     (symbol)  => set((s) => ({ compareSymbols: [...new Set([...s.compareSymbols, symbol.toUpperCase()])] })),
  removeCompare:  (symbol)  => set((s) => ({ compareSymbols: s.compareSymbols.filter(sym => sym !== symbol) })),
}));
```

**React Query hooks pattern:**
```ts
// src/hooks/useStockData.ts
import { useQuery } from "react-query";
import { stockApi } from "../api/stockApi";

export function useStockPrice(symbol: string, period: string) {
  return useQuery(
    ["price", symbol, period],
    () => stockApi.getPrice(symbol, period),
    {
      staleTime:  1000 * 60 * 60,    // 1 hour — matches backend TTL
      retry:      1,
      enabled:    !!symbol,
    }
  );
}
```

---

### 4.8 Charting Library Decision

| Chart Type | Library | Reason |
|---|---|---|
| Candlestick + Volume | `lightweight-charts` | Purpose-built for financial charts, GPU-accelerated canvas, handles panning/zooming natively |
| RSI | `recharts` | Simple line chart with reference lines at 30/70 |
| MACD | `recharts` | Composed chart: two lines + bar histogram |
| Comparison | `recharts` | Multi-series line chart with dynamic legend |
| Drawdown | `recharts` | Area chart, negative fill |
| Return histogram | `recharts` | Bar chart of bucketed return distribution |

---

## 5. API Contract — Full Endpoint Reference

### Base URL
```
Development:  http://localhost:8000
Production:   https://your-backend.railway.app
```

All responses include:
```json
{
  "is_cached": true,
  "cached_at": "2026-06-14T08:30:00Z"
}
```

---

### GET `/api/stock/{symbol}/quote`
Returns a real-time market snapshot. Uses `GLOBAL_QUOTE`. TTL: 1 hour.

**Path params:** `symbol` — ticker string (e.g., `AAPL`, `MSFT`)

**Success response `200`:**
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

### GET `/api/stock/{symbol}/price`
Returns OHLCV daily time series. Uses `TIME_SERIES_DAILY`. TTL: 24 hours.

**Query params:**

| Param | Type | Default | Values |
|---|---|---|---|
| `period` | string | `1Y` | `1M`, `3M`, `6M`, `1Y`, `5Y` |

**Success response `200`:**
```json
{
  "symbol":   "AAPL",
  "period":   "1Y",
  "currency": "USD",
  "data": [
    { "date": "2025-06-14", "open": 207.50, "high": 214.20, "low": 206.80, "close": 211.30, "volume": 58200000 },
    { "date": "2025-06-13", "open": 209.00, "high": 212.00, "low": 205.50, "close": 207.80, "volume": 61100000 }
  ],
  "is_cached": true,
  "cached_at": "2026-06-14T08:00:00Z"
}
```

Note: Data is always returned in descending date order (newest first). Frontend must reverse for chronological chart rendering.

---

### GET `/api/stock/{symbol}/indicators`
Returns pre-computed technical indicators. Calls `RSI`, `MACD`, `EMA` (×3), `BBANDS` — but all sourced from the same underlying OHLCV cache. Only 1 real API call is made for the full indicator set per day. TTL: 24 hours.

**Success response `200`:**
```json
{
  "symbol": "AAPL",
  "rsi": [
    { "date": "2026-06-13", "rsi": 58.34 }
  ],
  "macd": [
    { "date": "2026-06-13", "macd": 1.23, "signal": 0.98, "histogram": 0.25 }
  ],
  "ema": [
    { "date": "2026-06-13", "ema20": 209.10, "ema50": 204.55, "ema200": 191.30 }
  ],
  "bollinger": [
    { "date": "2026-06-13", "upper": 218.40, "middle": 209.10, "lower": 199.80 }
  ],
  "is_cached": true,
  "cached_at": "2026-06-14T08:00:00Z"
}
```

---

### GET `/api/stock/{symbol}/signals`
Returns computed analytics signals. No additional API calls — computed from the cached OHLCV data by the analytics engine. TTL: inherits from OHLCV cache.

**Success response `200`:**
```json
{
  "symbol":            "AAPL",
  "trend_signal":      "bullish",
  "crossover_type":    "none",
  "rsi_state":         "neutral",
  "rsi_value":         58.34,
  "volatility_level":  "medium",
  "volatility_value":  24.7,
  "volume_anomaly":    0.89,
  "bollinger_squeeze": false,
  "summary":           "Trend is bullish (EMA 50 above EMA 200). RSI at 58 — neutral range."
}
```

---

### GET `/api/stock/{symbol}/overview`
Returns company fundamentals. Uses `OVERVIEW`. TTL: 24 hours.

**Success response `200`:**
```json
{
  "symbol":         "AAPL",
  "name":           "Apple Inc",
  "description":    "Apple Inc. designs, manufactures...",
  "sector":         "Technology",
  "industry":       "Consumer Electronics",
  "market_cap":     3200000000000,
  "pe_ratio":       32.5,
  "forward_pe":     28.1,
  "peg_ratio":      2.3,
  "eps":            6.56,
  "revenue_ttm":    385000000000,
  "profit_margin":  0.264,
  "dividend_yield": 0.005,
  "beta":           1.24,
  "week_52_high":   237.23,
  "week_52_low":    164.08,
  "analyst_target": 230.00
}
```

---

### GET `/api/stock/{symbol}/drawdown`
Returns daily drawdown series. No additional API call — computed from cached OHLCV.

**Query params:** `period` — same as `/price` endpoint.

**Success response `200`:**
```json
{
  "symbol": "AAPL",
  "data": [
    { "date": "2025-06-14", "drawdown": 0.0 },
    { "date": "2025-09-15", "drawdown": -12.4 },
    { "date": "2026-01-10", "drawdown": -3.1 }
  ]
}
```

---

### GET `/api/stock/{symbol}/distribution`
Returns daily return values for histogram rendering. No additional API call.

**Query params:** `period` — same as `/price` endpoint.

**Success response `200`:**
```json
{
  "symbol": "AAPL",
  "data": [
    { "date": "2025-06-15", "daily_return": 0.73 },
    { "date": "2025-06-16", "daily_return": -1.12 }
  ]
}
```

---

### GET `/api/stocks/compare`
Returns normalised price series for multiple tickers.

**Query params:**

| Param | Type | Required | Example |
|---|---|---|---|
| `symbols` | string | Yes | `AAPL,MSFT,GOOGL` |
| `period`  | string | No  | `1Y` |

**Constraints:** Maximum 5 symbols. Each symbol must already have cached OHLCV data (triggers individual price fetches if not cached).

**Success response `200`:**
```json
{
  "symbols":      ["AAPL", "MSFT", "GOOGL"],
  "period":       "1Y",
  "base_date":    "2025-06-14",
  "data": [
    { "date": "2025-06-14", "AAPL": 100.0, "MSFT": 100.0, "GOOGL": 100.0 },
    { "date": "2025-06-16", "AAPL": 101.2, "MSFT": 98.7,  "GOOGL": 103.4 }
  ],
  "total_returns": {
    "AAPL": 12.4,
    "MSFT": -3.1,
    "GOOGL": 18.7
  }
}
```

---

### GET `/api/status`
Returns current API request budget status.

**Success response `200`:**
```json
{
  "date":                "2026-06-14",
  "requests_used":       8,
  "requests_limit":      25,
  "requests_remaining":  17,
  "budget_warning":      false
}
```

`budget_warning` is `true` when `requests_used >= 20`.

---

## 6. Caching Strategy

### Decision flow for every endpoint:

```
Request comes in
      │
      ▼
Check SQLite for cache_key
      │
   ┌──┴──────────────────┐
 Hit │                    │ Miss
   ▼                      ▼
Is cache fresh?      Can we make API call?
(now - fetched_at    (requests_used < 24?)
< ttl_seconds?)           │
   │                  ┌───┴────┐
 Yes │ No           Yes │      │ No
   ▼  ▼              ▼         ▼
Return  Fetch    Call Alpha   Return stale cache
cached  fresh    Vantage,     with staleness warning
data    data     store in     in response header
                 cache, 
                 return
```

### Cache key reference table:

| Endpoint | Cache Key Pattern | TTL |
|---|---|---|
| `/quote` | `GLOBAL_QUOTE:{SYMBOL}` | 3600s |
| `/price` | `TIME_SERIES_DAILY:{SYMBOL}` | 86400s |
| `/indicators` | `INDICATORS:{SYMBOL}` | 86400s |
| `/overview` | `OVERVIEW:{SYMBOL}` | 86400s |
| `/signals` | Derived from OHLCV — no separate cache | — |
| `/drawdown` | Derived from OHLCV — no separate cache | — |
| `/distribution` | Derived from OHLCV — no separate cache | — |
| `/compare` | `COMPARE:{SORTED_SYMBOLS}:{PERIOD}` | 86400s |

Note: The indicators endpoint makes individual Alpha Vantage calls for RSI, MACD, EMA, BBANDS. In v1.0 these are computed server-side from the cached OHLCV data using Pandas — not separate API calls — to conserve the daily request budget.

---

## 7. Analytics Engine — Computation Logic

All analytics are computed server-side in `services/analytics.py` from the cached OHLCV data. No additional API calls are made.

| Signal | Method | Input window |
|---|---|---|
| EMA 20 / 50 / 200 | `pandas.ewm(span=N, adjust=False)` | Full OHLCV series |
| RSI (14) | Wilder smoothing: rolling avg gain / loss | 14 periods |
| MACD | EMA(12) − EMA(26); signal = EMA(9) of MACD | Full series |
| Bollinger Bands | SMA(20) ± 2 × std(20) | 20 periods |
| Rolling volatility | `pct_change().rolling(20).std() * sqrt(252)` | 20 periods |
| Volume anomaly | `today_vol / rolling(30).mean()` | 30 periods |
| Drawdown | `(close - cummax()) / cummax() * 100` | Full series |
| Return distribution | `pct_change() * 100` | Full series |
| Golden/death cross | Compare sign of `(ema50 - ema200)` at t and t-1 | Last 2 rows |
| Bollinger squeeze | `bb_width.rank(pct=True) < 0.20` | Full series |

---

## 8. Error Codes & Handling

### Backend error response shape:
```json
{
  "detail": "Human-readable error message",
  "error_code": "SYMBOL_NOT_FOUND",
  "is_cached": false
}
```

### Error code reference:

| HTTP Status | `error_code` | When it occurs | Frontend action |
|---|---|---|---|
| `400` | `INVALID_SYMBOL` | Symbol contains invalid characters | Show inline validation error |
| `400` | `INVALID_PERIOD` | Period param not in allowed set | Fall back to `1Y` default |
| `400` | `TOO_MANY_SYMBOLS` | More than 5 symbols in compare | Show "max 5 stocks" message |
| `404` | `SYMBOL_NOT_FOUND` | Alpha Vantage returns no data | Show "symbol not found" banner |
| `429` | `BUDGET_EXHAUSTED` | 24 requests used today | Show budget warning, serve stale cache |
| `429` | `AV_RATE_LIMITED` | Alpha Vantage per-minute limit hit | Auto-retry after 60s |
| `502` | `AV_UPSTREAM_ERROR` | Alpha Vantage returned an error | Show error banner, suggest retry |
| `503` | `CACHE_UNAVAILABLE` | SQLite read/write failed | Show critical error banner |
| `500` | `ANALYTICS_ERROR` | Pandas computation failed (e.g., not enough data) | Hide signals panel, show fallback |

### Frontend error handling:

```ts
// ErrorBanner.tsx pattern
// React Query's isError + error.message feed directly into this component.
// Never crash the dashboard on a single endpoint failure — degrade gracefully.

{isError && (
  <ErrorBanner
    message={error.message}
    onRetry={() => refetch()}
  />
)}
```

---

## 9. Deployment

### Development
```bash
# Terminal 1 — backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm run dev    # runs on port 5173
```

### Production

**Backend → Railway**
```bash
# Procfile
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```
Set environment variables in Railway dashboard. SQLite file persists within the container (not ideal for scaling, but fine for v1.0 single-user).

**Frontend → Vercel**
```bash
# Set VITE_API_BASE_URL=https://your-app.railway.app in Vercel env vars
vercel deploy
```

Update `ALLOWED_ORIGINS` in backend `.env` to include the Vercel deployment URL.

---

## 10. Security Checklist

| Item | Status |
|---|---|
| API key stored in `.env`, not hardcoded | Required |
| `.env` in `.gitignore` | Required |
| `.env.example` committed with placeholder values | Required |
| CORS restricted to known frontend origins | Required |
| No Alpha Vantage key exposed in frontend code | Required |
| Symbol input sanitised (alphanumeric only, max 10 chars) | Required |
| Hard stop at 24/25 daily requests to avoid accidental overuse | Required |
| SQLite file excluded from version control | Required |

Symbol sanitisation regex (backend):
```python
import re

def sanitise_symbol(symbol: str) -> str:
    clean = re.sub(r"[^A-Z0-9\.\-]", "", symbol.upper().strip())
    if not clean or len(clean) > 10:
        raise ValueError("Invalid stock symbol")
    return clean
```

---

## 11. Testing Strategy

### Backend — pytest

```bash
pip install pytest pytest-asyncio httpx
pytest tests/ -v
```

Key test cases:

| Test | What it validates |
|---|---|
| `test_cache_hit` | Cache manager returns stored data without calling Alpha Vantage |
| `test_cache_miss_and_store` | On miss, fetches from API and writes to SQLite |
| `test_budget_increment` | Request counter increments on each real API call |
| `test_budget_hard_stop` | Returns 429 when requests_used >= 24 |
| `test_analytics_signals` | `compute_signals()` returns correct types and ranges for known inputs |
| `test_normalised_series` | Comparison series starts at 100.0 for all symbols |
| `test_invalid_symbol` | 400 returned for symbols with special characters |
| `test_av_error_passthrough` | Alpha Vantage error messages mapped to correct HTTP codes |

### Frontend — Vitest + React Testing Library

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Key test cases:

| Test | What it validates |
|---|---|
| `MarketSummaryBar renders price and change` | Displays formatted values correctly |
| `SignalBadge correct color for each state` | Green for bullish, red for bearish, gray for neutral |
| `PeriodSelector calls setperiod on click` | Zustand store updated on period change |
| `ErrorBanner shows message and retry button` | Error state renders and retry triggers refetch |
| `useStockData fetches correct endpoint` | Hook calls `stockApi.getPrice` with right symbol and period |

---

*End of TECH_SPEC v1.0*
