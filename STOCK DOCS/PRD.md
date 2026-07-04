# Product Requirements Document (PRD)
## Stock Market Analytics Dashboard

| Field | Details |
|---|---|
| **Project Name** | StockLens — Stock Market Analytics Dashboard |
| **Version** | v1.0 |
| **Status** | Draft |
| **Author** | — |
| **Created** | June 2026 |
| **Stack** | FastAPI (Python) + React (TypeScript) |
| **Data Source** | Alpha Vantage API (Free Tier) |

---

## 1. Executive Summary

StockLens is a full-stack stock market analytics dashboard built for data analytics use cases. It fetches financial market data from the Alpha Vantage API, processes it through a Python FastAPI backend, and visualizes it in a React frontend. The primary goal is not just to display price data but to surface actionable insights — technical signals, anomalies, volatility patterns, and relative performance — that a data analyst or retail investor can act on.

---

## 2. Problem Statement

Retail investors and data analysts who want to study stock market behaviour face two main friction points:

- **Data access**: Professional tools (Bloomberg, FactSet) are expensive. Free tools (Yahoo Finance, Google Finance) have poor APIs, are unreliable, or don't surface derived analytics.
- **Insight gap**: Raw price charts exist everywhere. What's missing is a layer of computed intelligence — trend signals, anomaly detection, volatility analysis — presented cleanly in one place.

StockLens solves both problems by wrapping the Alpha Vantage free API in a smart caching backend and presenting derived insights alongside raw market data.

---

## 3. Goals & Non-Goals

### Goals
- Build a functional, deployable stock analytics dashboard using FastAPI + React.
- Surface computed insights (not just raw data) as a core feature.
- Stay within Alpha Vantage's free tier (25 API requests/day) through smart caching.
- Support analysis of 3–5 stocks simultaneously.
- Deliver a project suitable for a data analytics portfolio.

### Non-Goals
- Real-time streaming / WebSocket price feeds (requires premium API tier).
- Paper trading or order execution functionality.
- User authentication or multi-user support (v1 is single-user).
- Mobile-first design (desktop dashboard is the primary target).
- Coverage of forex, crypto, or options data in v1.

---

## 4. Target Users

| User | Description | Primary Need |
|---|---|---|
| **Data Analytics Student** | Building a portfolio project | Clean analytics features, shareable dashboard |
| **Retail Investor** | Tracking a small portfolio | Price trends, technical signals, fundamentals |
| **Developer / Data Engineer** | Exploring financial APIs | Well-structured codebase, modular architecture |

---

## 5. Feature Requirements

### 5.1 Priority Levels
- **P0** — Must have for v1.0 (core functionality)
- **P1** — Should have for v1.0 (strong analytics value)
- **P2** — Nice to have, scope for v1.1

---

### 5.2 Backend — FastAPI Service

| ID | Feature | Priority | Description |
|---|---|---|---|
| BE-01 | API Caching Layer | P0 | All Alpha Vantage responses cached in SQLite. Cache TTL: 24h for daily data, 1h for quotes. Prevents hitting the 25 req/day limit. |
| BE-02 | Stock Price Endpoint | P0 | `GET /api/stock/{symbol}/price` — Returns OHLCV time series (daily). Supports `period` param: `1M`, `3M`, `6M`, `1Y`, `5Y`. |
| BE-03 | Technical Indicators Endpoint | P0 | `GET /api/stock/{symbol}/indicators` — Returns RSI (14), MACD, EMA (20/50/200), Bollinger Bands. |
| BE-04 | Company Overview Endpoint | P1 | `GET /api/stock/{symbol}/overview` — Returns P/E, EPS, market cap, dividend yield, 52-week high/low. |
| BE-05 | Real-time Quote Endpoint | P0 | `GET /api/stock/{symbol}/quote` — Returns current price, change %, volume from `GLOBAL_QUOTE`. |
| BE-06 | Multi-Stock Comparison Endpoint | P1 | `GET /api/stocks/compare?symbols=AAPL,MSFT,GOOGL` — Returns normalised price series (base 100) for multiple tickers. |
| BE-07 | Analytics Engine | P1 | Server-side computation of: rolling volatility (20-day), golden/death cross detection, RSI overbought/oversold flags, volume anomaly score. |
| BE-08 | Watchlist Endpoint | P2 | `GET/POST /api/watchlist` — Persist a list of symbols in SQLite. |
| BE-09 | Request Budget Monitor | P1 | Internal tracker logging daily API call count. Returns warning when >20 of 25 requests used. Exposed at `GET /api/status`. |

---

### 5.3 Frontend — React Dashboard

#### Module 1: Market Summary Bar (P0)
A persistent top bar showing key metrics for the selected stock.

- Current price (large, prominent)
- Day change: absolute value and % (green/red)
- Volume vs 30-day average volume (e.g., "1.4× avg")
- 52-week high / 52-week low range indicator
- Last updated timestamp

#### Module 2: Candlestick Price Chart (P0)
The primary chart of the dashboard.

- OHLCV candlestick chart (Recharts or Lightweight Charts library)
- Volume bars as a sub-chart below the price chart
- Overlay toggles: EMA 20, EMA 50, EMA 200, Bollinger Bands
- Date range selector: 1M / 3M / 6M / 1Y / 5Y
- Crosshair with tooltip showing OHLCV values on hover

#### Module 3: Technical Indicators Panel (P0)
Two sub-charts below the main price chart.

- **RSI chart**: Line chart with 30 (oversold) and 70 (overbought) threshold bands highlighted. Color the line red above 70, green below 30.
- **MACD chart**: MACD line, signal line, and histogram bars. Highlight positive/negative divergence.

#### Module 4: Analytics Insights Widget (P1)
A card panel showing computed signals — the core data analytics differentiator.

| Signal | Logic | Display |
|---|---|---|
| Trend signal | EMA 50 vs EMA 200 crossover | "Bullish (Golden Cross)" / "Bearish (Death Cross)" badge |
| RSI state | RSI > 70 or < 30 | "Overbought", "Oversold", or "Neutral" badge |
| Volatility | 20-day rolling std dev of returns | Low / Medium / High with numeric value |
| Volume anomaly | Today's vol vs 30-day avg | "3.2× avg volume — potential breakout" |
| Bollinger squeeze | Band width below 20th percentile | "Volatility compression detected" alert |

#### Module 5: Fundamental Data Panel (P1)
A clean data table showing company financials pulled from the `OVERVIEW` endpoint.

- Market cap, P/E ratio, Forward P/E, PEG ratio
- EPS (TTM), Revenue (TTM), Profit margin
- Dividend yield, Beta
- Analyst target price

#### Module 6: Multi-Stock Comparison Chart (P1)
A line chart comparing normalised performance of 2–5 stocks.

- All prices normalised to 100 at the start of the selected date range
- Each ticker gets a distinct color + dash pattern
- Custom legend showing each ticker's total return % over the period
- Ticker input with add/remove controls

#### Module 7: Stock Search & Watchlist (P0 / P2)
- Search bar with symbol input (P0)
- Watchlist sidebar showing quick stats for saved symbols (P2)

---

### 5.4 Analytics-First Features (Data Analytics Layer)

These features are what elevate this from a "chart viewer" to an "analytics dashboard":

| Feature | Description | API Dependency |
|---|---|---|
| Signal summary card | One-line plain-English summary of the stock's current technical state | Computed from cached indicators |
| Return distribution histogram | Distribution of daily returns over the selected period | Computed from OHLCV |
| Rolling volatility chart | 20-day rolling std deviation plotted as a line chart | Computed from OHLCV |
| Drawdown chart | Visualises peak-to-trough decline over time | Computed from OHLCV |
| Correlation heatmap | Pairwise correlation matrix for a watchlist of stocks | Computed from multiple OHLCV series |

---

## 6. Technical Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      React Frontend                      │
│  (TypeScript + Recharts / Lightweight Charts + Axios)    │
└──────────────────────┬───────────────────────────────────┘
                       │  REST API (JSON)
┌──────────────────────▼───────────────────────────────────┐
│                   FastAPI Backend                        │
│  Routes → Service Layer → Cache Manager → Analytics Eng  │
└──────────────────────┬───────────────────────────────────┘
          ┌────────────┴──────────────┐
          ▼                           ▼
┌─────────────────┐       ┌───────────────────────┐
│  SQLite Cache   │       │  Alpha Vantage API     │
│  (stock_cache   │       │  (25 req/day free)     │
│   .db)          │       │                        │
└─────────────────┘       └───────────────────────┘
```

### Backend Directory Structure
```
backend/
├── main.py                  # FastAPI app entry point
├── routers/
│   ├── stock.py             # Price, quote, overview routes
│   ├── indicators.py        # Technical indicator routes
│   ├── compare.py           # Multi-stock comparison routes
│   └── status.py            # API budget status route
├── services/
│   ├── alpha_vantage.py     # Alpha Vantage API client
│   ├── cache.py             # SQLite cache manager
│   └── analytics.py         # Signals, volatility, anomaly engine
├── models/
│   └── schemas.py           # Pydantic response models
├── db/
│   └── stock_cache.db       # SQLite database (gitignored)
├── config.py                # API key, cache TTL settings
└── requirements.txt
```

### Frontend Directory Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── MarketSummaryBar.tsx
│   │   ├── CandlestickChart.tsx
│   │   ├── IndicatorsPanel.tsx
│   │   ├── AnalyticsInsights.tsx
│   │   ├── FundamentalsPanel.tsx
│   │   ├── ComparisonChart.tsx
│   │   └── Watchlist.tsx
│   ├── hooks/
│   │   ├── useStockData.ts
│   │   └── useIndicators.ts
│   ├── api/
│   │   └── stockApi.ts       # Axios API client
│   ├── types/
│   │   └── stock.ts          # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## 7. API Rate Limit Strategy

Given the 25 requests/day hard limit, the following strategy must be enforced:

| Rule | Implementation |
|---|---|
| Cache-first reads | Always check SQLite before calling Alpha Vantage |
| 24h TTL for daily data | Time series, indicators, overview |
| 1h TTL for quotes | `GLOBAL_QUOTE` endpoint only |
| Pre-fetch on startup | Fetch all watchlist stocks at startup, warm cache |
| Budget dashboard | `GET /api/status` shows requests used today |
| Hard stop at 24/25 | Block new API calls once 24 requests used; return cached data only |
| Batch where possible | Fetch OHLCV once per symbol and derive all analytics from it |

---

## 8. Data Models

### StockQuote
```typescript
interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  latestTradingDay: string;
}
```

### OHLCVDataPoint
```typescript
interface OHLCVDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

### AnalyticsSignals
```typescript
interface AnalyticsSignals {
  trendSignal: "bullish" | "bearish" | "neutral";
  crossoverType: "golden" | "death" | "none";
  rsiState: "overbought" | "oversold" | "neutral";
  rsiValue: number;
  volatilityLevel: "low" | "medium" | "high";
  volatilityValue: number;
  volumeAnomaly: number;        // ratio vs 30-day avg
  bollingerSqueeze: boolean;
  summary: string;              // plain-English summary string
}
```

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load time | < 2 seconds for cached data |
| API response time | < 500ms for cached endpoints |
| Cache hit rate | > 90% after first daily load |
| Browser support | Chrome, Firefox, Edge (latest 2 versions) |
| Responsiveness | Desktop-first; usable at 1280px+ width |
| Error handling | Graceful degradation if API returns no data; show last cached value with staleness warning |
| Environment config | API key stored in `.env`, never committed to git |

---

## 10. Milestones & Delivery Plan

| Milestone | Scope | Estimated Effort |
|---|---|---|
| **M1 — Backend foundation** | FastAPI setup, Alpha Vantage client, SQLite cache, price + quote endpoints | 2–3 days |
| **M2 — Core charts** | React scaffold, Candlestick chart, Volume chart, Market summary bar | 2–3 days |
| **M3 — Indicators** | RSI + MACD backend endpoints + frontend sub-charts | 1–2 days |
| **M4 — Analytics engine** | Server-side signals computation, Analytics Insights widget | 2–3 days |
| **M5 — Fundamentals + Comparison** | Overview endpoint, Fundamentals panel, Multi-stock comparison chart | 2 days |
| **M6 — Polish + Deploy** | Error handling, loading states, API budget monitor, deployment | 1–2 days |
| **Total** | | **~12–15 days** |

---

## 11. Out of Scope (v1.0)

- User login / authentication
- Push notifications or email alerts
- News feed integration
- Backtesting or strategy simulation
- Mobile / tablet responsive layout
- Real-time WebSocket streaming
- Crypto or forex data

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| OQ-1 | Which charting library for candlesticks — Recharts or Lightweight Charts (TradingView)? Lightweight Charts has better financial chart support. | Dev | Open |
| OQ-2 | Should analytics signals be computed in Python (backend) or JavaScript (frontend)? Backend preferred for reusability. | Dev | Open |
| OQ-3 | Deployment target — Vercel (frontend) + Railway (backend) or a single VPS? | Dev | Open |
| OQ-4 | Should the watchlist persist across sessions (SQLite) or be in-memory only for v1? | Dev | Open |

---

## 13. Glossary

| Term | Definition |
|---|---|
| OHLCV | Open, High, Low, Close, Volume — the standard data fields for a price candle |
| RSI | Relative Strength Index — momentum oscillator measuring overbought/oversold conditions (0–100) |
| MACD | Moving Average Convergence Divergence — trend-following momentum indicator |
| EMA | Exponential Moving Average — weighted moving average giving more weight to recent prices |
| Bollinger Bands | Volatility bands placed ±2 std deviations above/below a 20-day SMA |
| Golden Cross | EMA 50 crossing above EMA 200 — bullish signal |
| Death Cross | EMA 50 crossing below EMA 200 — bearish signal |
| Drawdown | Peak-to-trough decline of a price series — measures downside risk |
| Sharpe Ratio | Risk-adjusted return: excess return divided by standard deviation of returns |
| TTL | Time To Live — how long cached data is considered fresh before re-fetching |

---

*End of PRD v1.0*
