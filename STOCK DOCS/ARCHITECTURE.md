# Architecture & App Flow
## StockLens — Stock Market Analytics Dashboard

| Field | Details |
|---|---|
| **Document Type** | Architecture & App Flow |
| **Project** | StockLens |
| **Version** | v1.0 |
| **Status** | Draft |
| **Author** | — |
| **Created** | June 2026 |
| **References** | PRD v1.0, TECH_SPEC v1.0 |

---

## Table of Contents

1. [System Topology](#1-system-topology)
2. [Layer Architecture](#2-layer-architecture)
3. [App Flow — User Journey](#3-app-flow--user-journey)
4. [Request Lifecycle — Full Round Trip](#4-request-lifecycle--full-round-trip)
5. [Cache Decision Flow](#5-cache-decision-flow)
6. [API Budget Control Flow](#6-api-budget-control-flow)
7. [Analytics Pipeline](#7-analytics-pipeline)
8. [Frontend Data Flow](#8-frontend-data-flow)
9. [State Management Flow](#9-state-management-flow)
10. [Component Render Tree](#10-component-render-tree)
11. [Backend Module Dependency Map](#11-backend-module-dependency-map)
12. [Data Transformation Pipeline](#12-data-transformation-pipeline)
13. [Error Propagation Flow](#13-error-propagation-flow)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Startup Sequence](#15-startup-sequence)
16. [Key Architectural Decisions](#16-key-architectural-decisions)

---

## 1. System Topology

The highest-level view of StockLens. Three runtime environments, one external API.

```
╔══════════════════════════════════════════════════════════════════════╗
║                          USER'S BROWSER                              ║
║                                                                      ║
║   ┌──────────────────────────────────────────────────────────────┐  ║
║   │                  React App  (Vite / TypeScript)              │  ║
║   │                                                              │  ║
║   │   Zustand (UI state)   React Query (server cache)            │  ║
║   │   lightweight-charts   recharts   Tailwind CSS               │  ║
║   └────────────────────────────┬─────────────────────────────────┘  ║
║                                │  HTTP/JSON  (port 5173 dev)         ║
╚════════════════════════════════│═════════════════════════════════════╝
                                 │
                    Axios REST calls  ↕  JSON responses
                                 │
╔════════════════════════════════│═════════════════════════════════════╗
║                        FASTAPI SERVER                                ║
║                                                                      ║
║   ┌──────────────────────────────────────────────────────────────┐  ║
║   │   Routers → Services → Cache Manager → Analytics Engine      │  ║
║   │   Uvicorn ASGI    Python 3.11+    Pandas / NumPy             │  ║
║   └──────────────────────────┬───────────────────────────────────┘  ║
║                              │                                       ║
║          ┌───────────────────┴──────────────────┐                   ║
║          ▼                                       ▼                   ║
║   ┌─────────────┐                    ┌─────────────────────────┐    ║
║   │   SQLite    │                    │  Alpha Vantage API       │    ║
║   │  Cache DB   │                    │  (only on cache miss)    │    ║
║   │  (local)    │                    │  25 req/day free limit   │    ║
║   └─────────────┘                    └─────────────────────────┘    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Key constraint driving all architecture decisions:**
> Alpha Vantage free tier = **25 requests/day hard limit**.
> Every design choice — caching, analytics computation, endpoint design — exists to work within this constraint.

---

## 2. Layer Architecture

StockLens is structured in clean horizontal layers. Each layer has a single responsibility and communicates only with the layer directly adjacent to it.

```
┌─────────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                            │
│                                                                     │
│   React Components (TSX)                                            │
│   Charts · Signal cards · Summary bar · Fundamentals table          │
│   Knows nothing about APIs or data fetching                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ props / hooks
┌──────────────────────────────▼──────────────────────────────────────┐
│                       CLIENT STATE LAYER                            │
│                                                                     │
│   React Query   →  server state (fetched data, loading, errors)     │
│   Zustand       →  UI state (active symbol, period, overlays)       │
│   Axios Client  →  HTTP transport to FastAPI                        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP/JSON
┌──────────────────────────────▼──────────────────────────────────────┐
│                         ROUTING LAYER  (FastAPI)                    │
│                                                                     │
│   /api/stock/{symbol}/quote        →  stock.router                  │
│   /api/stock/{symbol}/price        →  stock.router                  │
│   /api/stock/{symbol}/indicators   →  indicators.router             │
│   /api/stock/{symbol}/signals      →  indicators.router             │
│   /api/stock/{symbol}/overview     →  stock.router                  │
│   /api/stock/{symbol}/drawdown     →  stock.router                  │
│   /api/stock/{symbol}/distribution →  stock.router                  │
│   /api/stocks/compare              →  compare.router                │
│   /api/status                      →  status.router                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ function calls
┌──────────────────────────────▼──────────────────────────────────────┐
│                        SERVICE LAYER                                │
│                                                                     │
│   alpha_vantage.py   →  HTTP client wrapping Alpha Vantage calls    │
│   cache.py           →  SQLite read/write with TTL logic            │
│   budget.py          →  Daily request counter + hard stop logic     │
│   analytics.py       →  Pandas/NumPy signal computation engine      │
└────────────────┬────────────────────────────┬───────────────────────┘
                 │                            │
┌────────────────▼──────────┐    ┌────────────▼──────────────────────┐
│      DATA LAYER           │    │       EXTERNAL API LAYER          │
│                           │    │                                   │
│   SQLite: api_cache       │    │   Alpha Vantage REST API          │
│   SQLite: api_budget      │    │   https://www.alphavantage.co     │
│   SQLite: watchlist       │    │   HTTPS · JSON · 25 req/day       │
└───────────────────────────┘    └───────────────────────────────────┘
```

---

## 3. App Flow — User Journey

This is the complete flow from a user opening the browser to seeing a fully rendered dashboard with analytics signals.

```
  USER OPENS BROWSER
         │
         ▼
  ┌─────────────────┐
  │  React App      │  Vite dev server (or CDN in prod) serves the
  │  loads in       │  React bundle. App.tsx mounts, reads Zustand
  │  browser        │  store — default symbol is "AAPL", period "1Y"
  └────────┬────────┘
           │
           ▼
  ┌─────────────────────────────────────────────────────┐
  │  Dashboard renders with loading skeletons           │
  │                                                     │
  │   ┌──────────────────┐   ┌───────────────────────┐ │
  │   │ MarketSummaryBar │   │  CandlestickChart     │ │
  │   │  [skeleton]      │   │  [skeleton]           │ │
  │   └──────────────────┘   └───────────────────────┘ │
  │   ┌──────────────────┐   ┌───────────────────────┐ │
  │   │ AnalyticsInsights│   │  IndicatorsPanel      │ │
  │   │  [skeleton]      │   │  [skeleton]           │ │
  │   └──────────────────┘   └───────────────────────┘ │
  └──────────────────────────────────┬──────────────────┘
                                     │
           React Query fires parallel requests
                                     │
          ┌──────────┬───────────────┼────────────────┐
          ▼          ▼               ▼                ▼
       /quote     /price         /indicators      /signals
       /overview
          │          │               │                │
          └──────────┴───────────────┴────────────────┘
                                     │
                              All 4 resolve
                                     │
                                     ▼
  ┌─────────────────────────────────────────────────────┐
  │  Dashboard fully rendered                           │
  │                                                     │
  │   ┌──────────────────┐   ┌───────────────────────┐ │
  │   │ $213.07  -0.67%  │   │  [Candlestick chart]  │ │
  │   │ Vol 0.89× avg    │   │  EMA 20/50 overlaid   │ │
  │   └──────────────────┘   └───────────────────────┘ │
  │   ┌──────────────────┐   ┌───────────────────────┐ │
  │   │ Bullish ✓        │   │  RSI: 58 — Neutral    │ │
  │   │ Vol squeeze: No  │   │  MACD: Positive       │ │
  │   └──────────────────┘   └───────────────────────┘ │
  └──────────────────────────────────┬──────────────────┘
                                     │
         USER INTERACTS (e.g., changes symbol to TSLA)
                                     │
                                     ▼
  ┌─────────────────────────────────────────────────────┐
  │  Zustand: setSymbol("TSLA")                         │
  │  React Query: invalidates all AAPL queries          │
  │  New queries fire for TSLA                          │
  │  Dashboard re-renders with skeletons → then data    │
  └─────────────────────────────────────────────────────┘
```

---

## 4. Request Lifecycle — Full Round Trip

Detailed flow for a single request from the React component to the response being rendered. Uses `/api/stock/AAPL/price?period=1Y` as the example.

```
REACT COMPONENT (CandlestickChart.tsx)
│
│  const { data, isLoading, isError } = useStockPrice("AAPL", "1Y");
│                       │
│              React Query checks its own
│              in-memory cache first
│              (staleTime: 1 hour)
│                       │
│             ┌─────────┴──────────┐
│          HIT│                    │MISS
│          (< 1hr old)        (stale or first load)
│             │                    │
│       return cached         fire Axios GET
│       data immediately      /api/stock/AAPL/price?period=1Y
│                                  │
│                                  ▼
│                         FASTAPI ROUTER (stock.py)
│                         @router.get("/{symbol}/price")
│                                  │
│                         sanitise_symbol("AAPL") ✓
│                         validate period="1Y" ✓
│                                  │
│                                  ▼
│                         SERVICE: cache.py
│                         cache_key = "TIME_SERIES_DAILY:AAPL"
│                         SELECT from api_cache WHERE cache_key=?
│                                  │
│                    ┌─────────────┴─────────────┐
│               HIT  │                           │  MISS
│          (fresh, age < 86400s)          (expired or absent)
│                    │                           │
│            parse JSON                   SERVICE: budget.py
│            return cached data           can_make_request()?
│                    │                           │
│                    │            ┌──────────────┴──────────────┐
│                    │         YES│                             │NO
│                    │     (used < 24)                  (used >= 24)
│                    │            │                             │
│                    │     alpha_vantage.py            raise BudgetExhaustedError
│                    │     httpx.get(AV endpoint)      → 429 to frontend
│                    │     increment budget counter         │
│                    │     set_cached(key, data, 86400s)    │
│                    │            │                          │
│                    └─────┬──────┘                          │
│                          │                                  │
│                          ▼                                  ▼
│                  FASTAPI RESPONSE (200)          FASTAPI RESPONSE (429)
│                  { symbol, period, data[] }      { detail, error_code }
│                          │                                  │
│                          ▼                                  ▼
│                   AXIOS INTERCEPTOR               AXIOS INTERCEPTOR
│                   res → r.data                   err → new Error(msg)
│                          │                                  │
│                          ▼                                  ▼
│               React Query stores data            React Query sets isError=true
│               in memory cache                    error.message = detail
│               (stale after 1hr)
│                          │
│                          ▼
│               CandlestickChart re-renders
│               with OHLCV data → lightweight-charts
│               draws candles
│
```

---

## 5. Cache Decision Flow

The most critical flow in StockLens. Every service function runs through this decision tree before touching Alpha Vantage.

```
                    ┌─────────────────────┐
                    │  Service function   │
                    │  called with params │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Build cache key    │
                    │  e.g.               │
                    │  "GLOBAL_QUOTE:AAPL"│
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  SELECT from        │
                    │  api_cache WHERE    │
                    │  cache_key = ?      │
                    └──────────┬──────────┘
                               │
               ┌───────────────┴────────────────┐
          NULL │                                │ ROW FOUND
               │                                │
               ▼                                ▼
   ┌───────────────────────┐       ┌────────────────────────────┐
   │  Cache MISS           │       │  Check freshness           │
   │  → go to budget check │       │  age = now - fetched_at    │
   └───────────────────────┘       │  ttl = row.ttl_seconds     │
                                   └────────────┬───────────────┘
                                                │
                                   ┌────────────┴──────────────┐
                              FRESH│ age < ttl                 │STALE
                              (✓)  │                           │ age >= ttl
                                   │                           │
                                   ▼                           ▼
                    ┌──────────────────────┐    ┌──────────────────────────┐
                    │  Return parsed JSON  │    │  Cache EXPIRED           │
                    │  from cache          │    │  → go to budget check    │
                    │  is_cached: true ✓   │    └──────────────────────────┘
                    └──────────────────────┘
                                                        │
                    ┌───────────────────────────────────┘
                    │           BUDGET CHECK
                    ▼
        ┌────────────────────────┐
        │  SELECT request_count  │
        │  FROM api_budget       │
        │  WHERE date = today    │
        └────────────┬───────────┘
                     │
        ┌────────────┴──────────────┐
  < 24  │                           │ >= 24
  (OK)  │                           │ (HARD STOP)
        │                           │
        ▼                           ▼
┌──────────────────┐     ┌──────────────────────────────────┐
│  Call Alpha      │     │  Raise BudgetExhaustedError      │
│  Vantage API     │     │  HTTP 429                        │
│  via httpx       │     │                                  │
└────────┬─────────┘     │  If stale cache exists:          │
         │               │    return stale + warning header │
         │               │  If no cache at all:             │
         ▼               │    return 429 error              │
┌──────────────────┐     └──────────────────────────────────┘
│  Success?        │
└────────┬─────────┘
         │
  ┌──────┴────────┐
YES│               │NO (AV error / rate limit)
   │               │
   ▼               ▼
┌──────────┐  ┌───────────────────────────────────┐
│ Store in │  │  Map error to HTTP status          │
│ SQLite   │  │  "Error Message" → 404             │
│ cache    │  │  "Note" / "Information" → 429      │
│          │  │  Network error → 502               │
│ UPDATE   │  └───────────────────────────────────┘
│ budget   │
│ counter  │
│ +1       │
└────┬─────┘
     │
     ▼
┌────────────────────┐
│  Return fresh data │
│  is_cached: false  │
└────────────────────┘
```

### Cache TTL reference:

```
Endpoint                 Cache Key Pattern              TTL
─────────────────────────────────────────────────────────────
/quote                   GLOBAL_QUOTE:{SYM}             1 hour
/price                   TIME_SERIES_DAILY:{SYM}        24 hours
/indicators              INDICATORS:{SYM}               24 hours
/overview                OVERVIEW:{SYM}                 24 hours
/compare                 COMPARE:{SYM1}_{SYM2}:{PER}   24 hours
/signals                 (derived — no own cache entry)
/drawdown                (derived — no own cache entry)
/distribution            (derived — no own cache entry)
```

---

## 6. API Budget Control Flow

The budget system is a thin layer that sits between the cache manager and the Alpha Vantage client. It is the last line of defence against exceeding 25 requests/day.

```
   ┌────────────────────────────────────────────────────────┐
   │                 api_budget table (SQLite)              │
   │   date TEXT PK  │  request_count INTEGER DEFAULT 0    │
   │   2026-06-14    │  8                                  │
   └────────────────────────────────────────────────────────┘
                              ▲
                read/write    │
                              │
   ┌─────────────────────────────────────────────────────────┐
   │                  budget.py  (service)                   │
   │                                                         │
   │   can_make_request()                                    │
   │     SELECT count FROM api_budget WHERE date=today       │
   │     return count < DAILY_REQUEST_HARD_STOP (24)         │
   │                                                         │
   │   increment_budget()                                    │
   │     INSERT OR REPLACE INTO api_budget                   │
   │       (date, request_count)                             │
   │     VALUES (today, COALESCE(count,0)+1)                 │
   │                                                         │
   │   get_status() → { used, limit, remaining, warning }    │
   │     warning = True when used >= 20                      │
   └─────────────────────────────────────────────────────────┘

   Budget state machine:

   0 ──────────────────── 19 ──────── 20 ─────── 24 ─── 25
   │                       │           │           │      │
   │    Normal operation   │  Warning  │  Hard     │ AV's │
   │    All requests pass  │  banner   │  stop     │ own  │
   │                       │  shown    │  no more  │ limit│
   │                       │  on UI    │  AV calls │      │

   Daily reset:
   ┌─────────────────────────────────────────────────┐
   │  Budget is keyed by date (YYYY-MM-DD).          │
   │  A new date = new row = counter resets to 0.    │
   │  No cron job needed — it resets automatically.  │
   └─────────────────────────────────────────────────┘

   GET /api/status response at different budget levels:

   Used 8:   { used:8,  remaining:17, warning:false }  → grey badge in UI
   Used 20:  { used:20, remaining:5,  warning:true  }  → yellow badge in UI
   Used 24:  { used:24, remaining:1,  warning:true  }  → red badge, cache-only mode
```

---

## 7. Analytics Pipeline

All analytics are computed in `services/analytics.py` using Pandas. Zero additional Alpha Vantage calls are made — the analytics engine consumes only the cached OHLCV data already in SQLite.

```
   Alpha Vantage
   TIME_SERIES_DAILY
         │
         ▼
   SQLite Cache
   (api_cache table)
   OHLCV for symbol
         │
         ▼ (cache hit — no API call)
   ┌─────────────────────────────────────────────────────────┐
   │                 Analytics Engine Input                  │
   │   list[dict]: date, open, high, low, close, volume      │
   │   Typically 252 rows (1 year) to 1260 rows (5 years)    │
   └─────────────────────┬───────────────────────────────────┘
                         │
                         ▼ pd.DataFrame()
   ┌─────────────────────────────────────────────────────────┐
   │               Pandas DataFrame (df)                     │
   │   index: date (datetime)                                │
   │   cols:  open  high  low  close  volume                 │
   └──────────────────────────────────────────────────────────┘
                         │
          ┌──────────────┼───────────────────────────┐
          │              │               │            │
          ▼              ▼               ▼            ▼

   ┌────────────┐ ┌────────────┐ ┌───────────┐ ┌──────────────┐
   │  TREND     │ │  MOMENTUM  │ │ VOLATILITY│ │   VOLUME     │
   │            │ │            │ │           │ │              │
   │ EMA 50     │ │ RSI (14)   │ │ 20-day    │ │ Today vol    │
   │ EMA 200    │ │ Wilder     │ │ rolling   │ │ ÷ 30-day     │
   │            │ │ smoothing  │ │ std × √252│ │ rolling avg  │
   │ crossover  │ │            │ │           │ │              │
   │ detection  │ │ MACD       │ │ Bollinger │ │ ratio > 2.0  │
   │            │ │ EMA12-26   │ │ Band width│ │ = anomaly    │
   │ golden →   │ │ Signal EMA9│ │ percentile│ │              │
   │ bullish    │ │            │ │ rank      │ │              │
   │            │ │            │ │ < 20th    │ │              │
   │ death →    │ │            │ │ = squeeze │ │              │
   │ bearish    │ │            │ │           │ │              │
   └──────┬─────┘ └─────┬──────┘ └─────┬─────┘ └──────┬───────┘
          │             │              │               │
          └─────────────┴──────────────┴───────────────┘
                                    │
                                    ▼
                     ┌──────────────────────────────┐
                     │      AnalyticsSignals         │
                     │                              │
                     │  trend_signal:  "bullish"    │
                     │  crossover_type: "none"      │
                     │  rsi_state:    "neutral"     │
                     │  rsi_value:    58.34         │
                     │  volatility_level: "medium"  │
                     │  volatility_value: 24.7      │
                     │  volume_anomaly: 0.89        │
                     │  bollinger_squeeze: false    │
                     │  summary: "Trend is bullish  │
                     │   (EMA 50 above EMA 200)..." │
                     └──────────────────────────────┘
                                    │
                     Additional analytics (computed separately):

          ┌──────────────────────┬──────────────────────────┐
          ▼                      ▼                          ▼
   ┌─────────────┐    ┌──────────────────────┐   ┌──────────────────┐
   │  Drawdown   │    │ Normalised Series    │   │ Return           │
   │  Series     │    │ (multi-stock)        │   │ Distribution     │
   │             │    │                      │   │                  │
   │ peak =      │    │ (close / close[0])   │   │ pct_change()     │
   │  cummax()   │    │   × 100              │   │ × 100            │
   │             │    │                      │   │                  │
   │ drawdown =  │    │ All tickers start    │   │ list of daily    │
   │ (close-peak)│    │ at 100 on base_date  │   │ % returns for    │
   │  / peak×100 │    │                      │   │ histogram        │
   └─────────────┘    └──────────────────────┘   └──────────────────┘
```

---

## 8. Frontend Data Flow

How data moves from API responses through the frontend layers to the rendered chart pixels.

```
   FastAPI JSON response
         │
         ▼
   Axios (src/api/client.ts)
   Interceptors normalise errors
         │
         ▼
   stockApi.ts helper functions
   e.g. stockApi.getPrice("AAPL","1Y")
         │
         ▼
   React Query useQuery hook
   (src/hooks/useStockData.ts)

   { data, isLoading, isError, refetch }
         │
         │  isLoading=true ──────────────────────────► LoadingSkeleton.tsx
         │  isError=true   ──────────────────────────► ErrorBanner.tsx
         │  data ──────────┐
         │                 │
         ▼                 ▼
   Zustand store      Raw API data (OHLCVResponse)
   (overlays, period)      │
         │                 ▼
         │        chartHelpers.ts
         │        transformForCandlestick(data)
         │        [ { time, open, high, low, close } ]
         │                 │
         └──────┬──────────┘
                │
                ▼
   CandlestickChart.tsx
   lightweight-charts IChartApi
   series.setData(transformed)
         │
         ▼  (Zustand overlays checked)
   if overlays.ema20  → addLineSeries(ema20Data)
   if overlays.ema50  → addLineSeries(ema50Data)
   if overlays.ema200 → addLineSeries(ema200Data)
   if overlays.bollinger → addLineSeries(upper/lower)
         │
         ▼
   Canvas renders → user sees chart


   Parallel flows (same pattern, different components):

   useIndicators → RSIChart.tsx   (recharts LineChart)
                 → MACDChart.tsx  (recharts ComposedChart)

   useSignals    → AnalyticsInsights.tsx
                   → SignalBadge (bullish/bearish/neutral pill)
                   → SummaryCard (plain-English text block)

   useOverview   → FundamentalsPanel.tsx
                   (data table with formatted numbers)

   useComparison → ComparisonChart.tsx
                   (recharts LineChart, dynamic series)
```

---

## 9. State Management Flow

Two separate state systems. Neither replaces the other — they manage fundamentally different types of state.

```
   ┌──────────────────────────────────────────────────────────┐
   │                    ZUSTAND STORE                         │
   │              (src/store/dashboardStore.ts)               │
   │                                                          │
   │   Purpose: UI state that is NOT server data              │
   │                                                          │
   │   activeSymbol: "AAPL"   ◄── SymbolSearch.tsx           │
   │   period: "1Y"           ◄── PeriodSelector.tsx         │
   │   overlays: {            ◄── OverlayToggles.tsx         │
   │     ema20: true,                                         │
   │     ema50: true,                                         │
   │     ema200: false,                                       │
   │     bollinger: false                                     │
   │   }                                                      │
   │   compareSymbols: []     ◄── CompareInput.tsx           │
   │                                                          │
   │   When activeSymbol changes:                             │
   │     → React Query keys change ["price","TSLA","1Y"]     │
   │     → Old queries become stale                          │
   │     → New queries fire automatically                    │
   └──────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │                  REACT QUERY CACHE                       │
   │               (in-memory, per session)                   │
   │                                                          │
   │   Purpose: Server state (API responses)                  │
   │                                                          │
   │   Query key → Cached data                               │
   │   ─────────────────────────────────────────             │
   │   ["quote","AAPL"]      →  StockQuote object            │
   │   ["price","AAPL","1Y"] →  OHLCVResponse object         │
   │   ["indicators","AAPL"] →  IndicatorsResponse object    │
   │   ["signals","AAPL"]    →  AnalyticsSignals object      │
   │   ["overview","AAPL"]   →  CompanyOverview object       │
   │   ["compare","AAPL,MSFT","1Y"] → ComparisonResponse    │
   │                                                          │
   │   staleTime: 3,600,000ms (1 hour)                       │
   │   → Won't re-fetch from FastAPI unless stale            │
   │   → FastAPI's SQLite cache won't be hit until then      │
   │                                                          │
   │   Invalidation:                                          │
   │   queryClient.invalidateQueries(["price","AAPL"])       │
   │   → triggers background re-fetch on next render         │
   └──────────────────────────────────────────────────────────┘

   Interaction between the two systems:

   User types "TSLA" + presses Enter
         │
         ▼
   SymbolSearch calls useDashboardStore.setSymbol("TSLA")
         │
         ▼
   Zustand activeSymbol updates → all subscribed components re-render
         │
         ▼
   useStockPrice("TSLA","1Y") — query key is ["price","TSLA","1Y"]
   React Query: no cache entry for TSLA → isLoading = true
         │
         ▼
   Axios GET /api/stock/TSLA/price?period=1Y
         │
         ▼
   FastAPI → cache miss → Alpha Vantage → SQLite → response
         │
         ▼
   React Query stores in memory → components render with data
```

---

## 10. Component Render Tree

The full React component hierarchy showing which component consumes which data hook.

```
App.tsx
└── DashboardLayout.tsx
    ├── Header.tsx
    │   ├── [logo + title]
    │   ├── SymbolSearch.tsx         → writes: Zustand.setSymbol()
    │   └── BudgetWarning.tsx        → reads:  useQuery(["status"])
    │
    ├── main content area
    │   │
    │   ├── MarketSummaryBar.tsx     → reads: useStockQuote(symbol)
    │   │   ├── MetricCard [price]
    │   │   ├── MetricCard [change %]
    │   │   ├── MetricCard [volume ratio]
    │   │   └── MetricCard [52w range]
    │   │
    │   ├── PeriodSelector.tsx       → reads+writes: Zustand period
    │   ├── OverlayToggles.tsx       → reads+writes: Zustand overlays
    │   │
    │   ├── CandlestickChart.tsx     → reads: useStockPrice(symbol, period)
    │   │   │                                 useIndicators(symbol)
    │   │   │                                 Zustand overlays
    │   │   └── [lightweight-charts canvas]
    │   │
    │   ├── VolumeChart.tsx          → reads: useStockPrice(symbol, period)
    │   │   └── [recharts BarChart]
    │   │
    │   ├── IndicatorsPanel.tsx      → reads: useIndicators(symbol)
    │   │   ├── RSIChart.tsx
    │   │   │   └── [recharts LineChart + ReferenceLine 30/70]
    │   │   └── MACDChart.tsx
    │   │       └── [recharts ComposedChart: 2 lines + Bar]
    │   │
    │   ├── AnalyticsInsights.tsx   → reads: useSignals(symbol)
    │   │   ├── SummaryCard.tsx      (plain-English summary)
    │   │   ├── SignalBadge [trend]
    │   │   ├── SignalBadge [RSI state]
    │   │   ├── SignalBadge [volatility]
    │   │   ├── SignalBadge [volume anomaly]
    │   │   └── SignalBadge [bollinger squeeze]
    │   │
    │   ├── FundamentalsPanel.tsx   → reads: useOverview(symbol)
    │   │   └── [data table: P/E, EPS, mkt cap, beta, etc.]
    │   │
    │   ├── DrawdownChart.tsx        → reads: useDrawdown(symbol, period)
    │   │   └── [recharts AreaChart, negative fill]
    │   │
    │   ├── DistributionChart.tsx   → reads: useDistribution(symbol, period)
    │   │   └── [recharts BarChart — return histogram]
    │   │
    │   └── ComparisonChart.tsx     → reads:  useComparison(compareSymbols)
    │       │                         reads:  Zustand compareSymbols
    │       │                         writes: Zustand addCompare/removeCompare
    │       ├── CompareInput.tsx
    │       └── [recharts LineChart — normalised multi-series]
    │
    └── Sidebar.tsx                 (v1.1 — watchlist panel)
```

---

## 11. Backend Module Dependency Map

How the Python modules relate to each other. Arrows point in the direction of import/dependency.

```
   main.py
      │  imports and mounts
      ├──────────────────────────────────────────┐
      │                                          │
      ▼                                          ▼
   routers/                                config.py
   ├── stock.py      ◄──────────────────── (settings object)
   ├── indicators.py ◄──────────────────── (API key, TTLs, limits)
   ├── compare.py    ◄────────────────────
   └── status.py     ◄────────────────────
         │  all routers import from services/
         │
         ├──► services/cache.py
         │       └──► db/database.py  (aiosqlite, init_db)
         │       └──► config.py
         │
         ├──► services/alpha_vantage.py
         │       └──► services/budget.py
         │       └──► services/cache.py  (set_cached after fetch)
         │       └──► config.py
         │
         ├──► services/budget.py
         │       └──► db/database.py
         │
         ├──► services/analytics.py
         │       └──► (pandas, numpy — no internal deps)
         │       └──► models/schemas.py  (AnalyticsSignals)
         │
         └──► models/schemas.py
                 └──► (pydantic — no internal deps)


   Dependency direction (no circular imports):

   routers → services → db / models
   routers → models
   services → config
   services → models
```

---

## 12. Data Transformation Pipeline

Raw Alpha Vantage JSON → cleaned Pandas DataFrame → API response → frontend chart format.

```
STEP 1: Alpha Vantage raw JSON (TIME_SERIES_DAILY)
─────────────────────────────────────────────────
{
  "Meta Data": { ... },
  "Time Series (Daily)": {
    "2026-06-13": {
      "1. open":   "207.50",
      "2. high":   "214.20",
      "3. low":    "206.80",
      "4. close":  "211.30",
      "5. volume": "58200000"
    },
    ...
  }
}
Note: all values are STRINGS. Numbers must be cast.

                    │
                    ▼ services/alpha_vantage.py

STEP 2: Normalised Python list
──────────────────────────────
[
  { "date":"2026-06-13", "open":207.50, "high":214.20,
    "low":206.80, "close":211.30, "volume":58200000 },
  ...
]
Keys renamed (stripped numeric prefixes).
Values cast to float/int.
Period filtering applied (1M/3M/6M/1Y/5Y slice).

                    │
                    ▼ Stored in SQLite as JSON string.
                      Returned as API response.

STEP 3: FastAPI JSON response
─────────────────────────────
{
  "symbol": "AAPL",
  "period": "1Y",
  "currency": "USD",
  "data": [ ... ],          ← the list from STEP 2
  "is_cached": true,
  "cached_at": "2026-06-14T08:00:00Z"
}

                    │
                    ▼ React Query → stockApi.getPrice()

STEP 4: TypeScript OHLCVResponse object
────────────────────────────────────────
const { data } = useStockPrice("AAPL", "1Y");
// data.data is OHLCVDataPoint[]
// { date: string, open: number, high: number,
//   low: number, close: number, volume: number }

                    │
                    ▼ chartHelpers.transformForCandlestick()

STEP 5: lightweight-charts format
───────────────────────────────────
[
  { time: "2026-06-13", open: 207.50, high: 214.20,
    low: 206.80, close: 211.30 },
  ...
]
Note: sorted ASCENDING (oldest first) — lightweight-charts requires this.
Date as "YYYY-MM-DD" string (lightweight-charts parses it).

                    │
                    ▼ series.setData()

STEP 6: Canvas pixels
─────────────────────
lightweight-charts renders GPU-accelerated canvas.
User sees interactive candlestick chart.
```

---

## 13. Error Propagation Flow

How errors travel from Alpha Vantage all the way to the user's screen — and what happens at each layer.

```
   Alpha Vantage returns error
          │
          │  Three types of AV "errors" (all return HTTP 200):
          │
          ├── "Error Message": "Invalid API call..."
          │         → AlphaVantageError → HTTP 404 (symbol not found)
          │
          ├── "Note": "Thank you for using Alpha Vantage..."
          │         → RateLimitError → HTTP 429 (per-minute limit)
          │
          └── "Information": "..."
                    → RateLimitError → HTTP 429 (daily limit hit)

   httpx network failure (timeout / DNS)
          → httpx.RequestError → HTTP 502 (upstream error)

   Budget exhausted (requests_used >= 24)
          → BudgetExhaustedError → HTTP 429
          │
          ▼
   FastAPI exception handlers
   (registered in main.py)
   Convert all exceptions → JSON error response:
   {
     "detail": "Human-readable message",
     "error_code": "BUDGET_EXHAUSTED",
     "is_cached": false
   }
          │
          ▼
   Axios response interceptor (client.ts)
   4xx/5xx → extract detail → new Error(detail)
   2xx     → pass through
          │
          ▼
   React Query
   isError = true
   error = Error("Daily API request limit reached...")
          │
          ┌──────────────────────────────┐
          │  Component renders           │
          │                             │
   isLoading → <LoadingSkeleton />      │
   isError   → <ErrorBanner            │
               message={error.message} │
               onRetry={refetch}    /> │
   data      → normal render           │
          └──────────────────────────────┘

   Special case: BUDGET_EXHAUSTED with stale cache
   ─────────────────────────────────────────────────
   FastAPI checks: is there stale data in SQLite?
   YES → return stale data + X-Cache-Stale: true header
         + X-Cache-Warning: "Budget exhausted, serving stale data"
   NO  → return 429 error

   Frontend checks X-Cache-Stale header:
   true → show yellow "Using cached data from {date}" banner
          but render the chart normally with stale data
```

---

## 14. Deployment Architecture

How the system is deployed in production. Two separate services, two platforms.

```
DEVELOPMENT
───────────

  localhost:5173           localhost:8000          www.alphavantage.co
  ┌────────────┐          ┌──────────────┐         ┌──────────────────┐
  │ Vite dev   │  Axios   │  Uvicorn     │  httpx  │  Alpha Vantage   │
  │ server     │ ───────► │  --reload    │ ───────►│  REST API        │
  │ (HMR)      │          │  FastAPI     │         │                  │
  └────────────┘          └──────────────┘         └──────────────────┘
                               │
                          ./db/stock_cache.db
                          (local SQLite file)


PRODUCTION
──────────

  Vercel (CDN edge)         Railway.app               www.alphavantage.co
  ┌─────────────────┐      ┌─────────────────────┐   ┌──────────────────┐
  │  React build    │      │  Uvicorn container  │   │  Alpha Vantage   │
  │  (static files) │      │  (Python 3.11)      │   │  REST API        │
  │                 │ HTTPS│                     │   │                  │
  │  VITE_API_BASE  │─────►│  PORT=$PORT         │──►│                  │
  │  =railway URL   │      │                     │   └──────────────────┘
  │                 │      │  ALPHA_VANTAGE_KEY   │
  │  Global CDN     │      │  (env var in Railway)│
  │  auto-deploy    │      │                     │
  │  on git push    │      │  /db/stock_cache.db │
  └─────────────────┘      │  (container volume) │
                           └─────────────────────┘

  CORS:
  Backend ALLOWED_ORIGINS = https://stocklens.vercel.app
  Frontend VITE_API_BASE_URL = https://stocklens-api.railway.app

  Deploy commands:

  Frontend (Vercel):
  ┌──────────────────────────────────────────────────┐
  │  Build command:    npm run build                 │
  │  Output dir:       dist                          │
  │  Env vars:         VITE_API_BASE_URL             │
  │  Auto-deploy:      on push to main branch        │
  └──────────────────────────────────────────────────┘

  Backend (Railway):
  ┌──────────────────────────────────────────────────┐
  │  Procfile:  web: uvicorn main:app \              │
  │                  --host 0.0.0.0 --port $PORT     │
  │  Env vars:  ALPHA_VANTAGE_API_KEY                │
  │             ALLOWED_ORIGINS                      │
  │             ENVIRONMENT=production               │
  │  Auto-deploy: on push to main branch             │
  └──────────────────────────────────────────────────┘
```

---

## 15. Startup Sequence

What happens in the first seconds of the system coming online.

```
BACKEND STARTUP (Uvicorn starts main.py)
─────────────────────────────────────────

  T+0.0s  Uvicorn starts ASGI server on port 8000

  T+0.1s  FastAPI app object created
          CORS middleware registered
          Routers mounted at /api/*

  T+0.2s  Lifespan context manager runs:
          await init_db()
            → CREATE TABLE IF NOT EXISTS api_cache (...)
            → CREATE TABLE IF NOT EXISTS api_budget (...)
            → CREATE TABLE IF NOT EXISTS watchlist (...)
          All tables created or verified

  T+0.3s  Settings loaded from .env:
          ALPHA_VANTAGE_API_KEY ✓
          CACHE_TTL_DAILY=86400 ✓
          DAILY_REQUEST_HARD_STOP=24 ✓
          ALLOWED_ORIGINS=http://localhost:5173 ✓

  T+0.5s  Server ready. Listening for requests.
          Log: "Application startup complete"


FRONTEND STARTUP (Browser loads React app)
───────────────────────────────────────────

  T+0.0s  Browser fetches index.html from Vite / Vercel CDN

  T+0.1s  React bundle (main.tsx) executes
          React Query QueryClient created (staleTime: 1hr)
          Zustand store initialised:
            activeSymbol: "AAPL"
            period: "1Y"
            overlays: { ema20:true, ema50:true, ema200:false, bollinger:false }

  T+0.2s  App.tsx renders → DashboardLayout mounts
          All components render with isLoading=true → skeletons shown

  T+0.3s  React Query fires parallel requests:
          GET /api/stock/AAPL/quote
          GET /api/stock/AAPL/price?period=1Y
          GET /api/stock/AAPL/indicators
          GET /api/stock/AAPL/signals
          GET /api/stock/AAPL/overview
          GET /api/status

  T+0.4s  (cache warm)  All FastAPI endpoints hit SQLite cache — hit
          JSON responses returned < 50ms each

  T+0.5s  (cache cold)  Cache miss → Alpha Vantage called (uses 5 requests)
          Responses arrive in ~1–3s
          SQLite updated with fresh data

  T+1.0s  All queries resolve
          Components re-render with real data
          Charts draw, signal badges appear
          Budget status badge updates
          User sees fully loaded dashboard
```

---

## 16. Key Architectural Decisions

A record of the significant design choices made and why — useful for future contributors.

```
┌─────────────────────────────────────────────────────────────────────┐
│ DECISION 1: SQLite for caching (not Redis, not in-memory)           │
├─────────────────────────────────────────────────────────────────────┤
│ Options considered: Redis, in-memory dict, SQLite                   │
│ Chosen: SQLite                                                      │
│ Reason: Survives server restarts (persistent on disk). No extra     │
│ infrastructure. Free on Railway. Warm cache after restart = no      │
│ wasted API budget. For a 25 req/day system, persistence matters     │
│ far more than raw speed.                                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ DECISION 2: Analytics computed server-side in Python                │
├─────────────────────────────────────────────────────────────────────┤
│ Options considered: Python backend, JavaScript frontend             │
│ Chosen: Python backend (services/analytics.py)                      │
│ Reason: Pandas/NumPy are mature, battle-tested financial libraries. │
│ Logic in one place (easier to test). Frontend stays pure rendering. │
│ Also avoids shipping large computation bundles to the browser.      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ DECISION 3: lightweight-charts for candlesticks, recharts for rest  │
├─────────────────────────────────────────────────────────────────────┤
│ Options considered: Plotly, D3.js, recharts, lightweight-charts     │
│ Chosen: Split approach                                              │
│ Reason: lightweight-charts (TradingView) is the industry standard   │
│ for financial candle charts. GPU-accelerated canvas. Built-in pan/  │
│ zoom. recharts is simpler for standard line/bar charts and has a    │
│ better React API. Mixing both avoids over-engineering.              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ DECISION 4: React Query for server state, Zustand for UI state      │
├─────────────────────────────────────────────────────────────────────┤
│ Options considered: Redux, Context API, React Query + Zustand       │
│ Chosen: React Query + Zustand                                       │
│ Reason: React Query solves loading/error/caching for API data with  │
│ zero boilerplate. Zustand handles the thin layer of UI preferences  │
│ (symbol, period, overlays). Redux would be overkill. Context API    │
│ would cause excessive re-renders across the heavy chart components. │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ DECISION 5: Hard stop at 24/25 requests (not 25)                    │
├─────────────────────────────────────────────────────────────────────┤
│ Reason: Leaves 1 request as a safety buffer against race conditions │
│ (two concurrent requests both passing the budget check at count=24).│
│ The budget check is not atomic in SQLite without transactions, so   │
│ a 1-request buffer prevents accidental overage. When budget monitor │
│ shows 24 used, the system switches to cache-only mode gracefully.   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ DECISION 6: Indicators computed from OHLCV cache, not AV endpoints  │
├─────────────────────────────────────────────────────────────────────┤
│ Alpha Vantage has dedicated endpoints for RSI, MACD, EMA, BBANDS.  │
│ Using them directly would cost 4+ extra API calls per symbol.       │
│ Chosen: Compute all indicators server-side with Pandas from the     │
│ single cached OHLCV time series. This costs 0 extra API calls and   │
│ produces identical results (standard formulas). The AV indicator    │
│ endpoints are only needed if sub-daily intraday indicators are       │
│ required — not the case in v1.0.                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Document Relationship Map

```
  PRD.md                    TECH_SPEC.md              ARCHITECTURE.md
  ──────────                ────────────              ───────────────
  What we build             How it's built            How it flows
  Why we build it           Exact contracts           Where data goes
  Who it's for              Code snippets             Decision rationale
  Feature list              Data models               Sequence diagrams
  Milestones                Error codes               Deployment diagrams
       │                         │                         │
       └─────────────────────────┼─────────────────────────┘
                                 │
                         TASK_TRACKER.md  (next)
                         Sprint breakdown
                         Task status per milestone
                         Daily progress log
```

---

*End of ARCHITECTURE.md v1.0*
