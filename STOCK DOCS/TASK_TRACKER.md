# Task Tracker
## StockLens — Stock Market Analytics Dashboard

| Field | Details |
|---|---|
| **Document Type** | Task Tracker |
| **Project** | StockLens |
| **Version** | v1.0 |
| **Started** | — |
| **Target Completion** | — (13 working days from start) |
| **Author** | — |
| **References** | PRD v1.0 · TECH_SPEC v1.0 · ARCHITECTURE v1.0 · SCHEMA v1.0 · DESIGN v1.0 · IMPLEMENTATION_PLAN v1.0 |

---

## How to use this file

**Status key — update daily:**

| Symbol | Meaning |
|---|---|
| `🔲 TODO` | Not started |
| `🔄 IN PROGRESS` | Currently working on this |
| `✅ DONE` | Completed and verified |
| `⛔ BLOCKED` | Waiting on another task or external factor |
| `⏭️ SKIPPED` | Intentionally deferred to v1.1 |
| `❌ FAILED` | Attempted but failed — see Blocker Log §10 |

**Type key:**

| Code | Meaning |
|---|---|
| `BE` | Backend (Python / FastAPI) |
| `FE` | Frontend (React / TypeScript) |
| `DO` | DevOps / Deployment |
| `TS` | Testing / QA |
| `CH` | Chore / Configuration / Setup |

**Priority key:**

| Code | Meaning |
|---|---|
| `P0` | Must have — blocks everything downstream |
| `P1` | Should have — important for v1.0 |
| `P2` | Nice to have — can slip to v1.1 |

---

## Table of Contents

1. [Project Progress Dashboard](#1-project-progress-dashboard)
2. [Milestone Overview Board](#2-milestone-overview-board)
3. [M1 — Backend Foundation](#3-m1--backend-foundation)
4. [M2 — Core Charts Frontend](#4-m2--core-charts-frontend)
5. [M3 — Technical Indicators](#5-m3--technical-indicators)
6. [M4 — Analytics Engine](#6-m4--analytics-engine)
7. [M5 — Fundamentals & Comparison](#7-m5--fundamentals--comparison)
8. [M6 — Polish & Deployment](#8-m6--polish--deployment)
9. [Cross-Milestone Dependency Map](#9-cross-milestone-dependency-map)
10. [Blocker Log](#10-blocker-log)
11. [Decision Log](#11-decision-log)
12. [API Budget Daily Tracker](#12-api-budget-daily-tracker)
13. [Daily Stand-Up Log](#13-daily-stand-up-log)
14. [Bug Tracker](#14-bug-tracker)
15. [Git Commit Log](#15-git-commit-log)
16. [Production Readiness Checklist](#16-production-readiness-checklist)
17. [Progress Metrics](#17-progress-metrics)

---

## 1. Project Progress Dashboard

> Update this section at the end of each working day.

```
OVERALL PROGRESS
─────────────────────────────────────────────────────────────────────
  Total tasks:        83
  Completed (✅):      0
  In progress (🔄):   0
  Blocked (⛔):        0
  Remaining (🔲):     83

  ████████████████████████████████████  0% complete

MILESTONE STATUS
─────────────────────────────────────────────────────────────────────
  M1 Backend Foundation     [                    ] 0/20   Day 1-3
  M2 Core Charts            [                    ] 0/22   Day 4-6
  M3 Technical Indicators   [                    ] 0/8    Day 7
  M4 Analytics Engine       [                    ] 0/13   Day 8-9
  M5 Fundamentals & Compare [                    ] 0/10   Day 10-11
  M6 Polish & Deploy        [                    ] 0/10   Day 12-13

CURRENT MILESTONE:       Not started
CURRENT DAY:             —
DAYS REMAINING:          13
LAST UPDATED:            —
```

---

## 2. Milestone Overview Board

| Milestone | Scope | Type | Est. Days | Tasks | Status | Gate |
|---|---|---|---|---|---|---|
| **M1** | Backend foundation | BE + CH | 3 | 20 | 🔲 TODO | curl /api/stock/AAPL/price returns JSON |
| **M2** | Core charts frontend | FE + CH | 3 | 22 | 🔲 TODO | Candlestick chart renders in browser |
| **M3** | Technical indicators | BE + FE | 1 | 8 | 🔲 TODO | RSI + MACD charts visible, zero new API calls |
| **M4** | Analytics engine | BE + FE | 2 | 13 | 🔲 TODO | Signals sidebar shows 5 signal cards |
| **M5** | Fundamentals & comparison | BE + FE | 2 | 10 | 🔲 TODO | Comparison chart + fundamentals panel live |
| **M6** | Polish & deploy | FE + DO + TS | 2 | 10 | 🔲 TODO | Production URLs live, smoke tests pass |
| **TOTAL** | | | **13** | **83** | | |

> **Gate rule:** A milestone is only DONE when its gate test passes. Do not start the next milestone until the current gate passes.

---

## 3. M1 — Backend Foundation

**Goal:** Working FastAPI server with SQLite cache, budget tracker, and price/quote endpoints.
**Days:** 1 – 3
**Gate:** `curl http://localhost:8000/api/stock/AAPL/price` returns OHLCV JSON with `is_cached: false`, and a second call returns `is_cached: true`.

---

### Day 1 Tasks — Environment & Core Structure

| Task ID | Task | Type | File(s) | Est. Time | Priority | Status | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| M1-01 | Verify Python 3.11+ installed | CH | — | 5 min | P0 | 🔲 TODO | — | `python --version` |
| M1-02 | Verify Node 20+ installed | CH | — | 5 min | P0 | 🔲 TODO | — | `node --version` |
| M1-03 | Verify Alpha Vantage API key works | CH | — | 10 min | P0 | 🔲 TODO | — | Open AV URL in browser |
| M1-04 | Create repository & root `.gitignore` | CH | `.gitignore` `README.md` | 10 min | P0 | 🔲 TODO | M1-01 | `git init` |
| M1-05 | Create `backend/` directory structure | CH | All `__init__.py` files | 10 min | P0 | 🔲 TODO | M1-04 | 5 subdirs + `__init__.py` |
| M1-06 | Create Python virtual environment | CH | `venv/` | 5 min | P0 | 🔲 TODO | M1-05 | `python -m venv venv` |
| M1-07 | Create `requirements.txt` and install | CH | `requirements.txt` | 15 min | P0 | 🔲 TODO | M1-06 | `pip install -r requirements.txt` |
| M1-08 | Create `.env` and `.env.example` | CH | `.env` `.env.example` | 5 min | P0 | 🔲 TODO | M1-07 | Never commit `.env` |
| M1-09 | Create `config.py` (Pydantic settings) | BE | `config.py` | 15 min | P0 | 🔲 TODO | M1-08 | Loads from `.env` |
| M1-10 | Create `db/database.py` (init_db, DDL) | BE | `db/database.py` | 20 min | P0 | 🔲 TODO | M1-09 | 3 tables + 1 index |
| M1-11 | Test `init_db()` — verify `.db` created | TS | `db/stock_cache.db` | 5 min | P0 | 🔲 TODO | M1-10 | `python -c "import asyncio; ..."` |
| M1-12 | Create `models/schemas.py` (all Pydantic) | BE | `models/schemas.py` | 30 min | P0 | 🔲 TODO | M1-09 | All response models |
| M1-13 | Create `services/exceptions.py` | BE | `services/exceptions.py` | 15 min | P0 | 🔲 TODO | M1-09 | 6 exception classes |

**Day 1 checkpoint:** `db/stock_cache.db` exists, `config.py` imports without error, all models importable.

---

### Day 2 Tasks — Services Layer

| Task ID | Task | Type | File(s) | Est. Time | Priority | Status | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| M1-14 | Create `services/budget.py` | BE | `services/budget.py` | 25 min | P0 | 🔲 TODO | M1-10 | `can_make_request()`, `increment_budget()`, `get_status()` |
| M1-15 | Create `services/cache.py` | BE | `services/cache.py` | 30 min | P0 | 🔲 TODO | M1-10 | `get_cached()`, `set_cached()`, `fetch_with_cache()`, key builders |
| M1-16 | Create `services/alpha_vantage.py` | BE | `services/alpha_vantage.py` | 40 min | P0 | 🔲 TODO | M1-14, M1-15 | `_call_av()`, `sanitise_symbol()`, normalisation helpers, fetch functions |

**Day 2 checkpoint:** All three services importable, `sanitise_symbol("aapl$")` raises `InvalidSymbolError`.

---

### Day 3 Tasks — Routers, App Bootstrap, Tests

| Task ID | Task | Type | File(s) | Est. Time | Priority | Status | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| M1-17 | Create `routers/stock.py` (price + quote) | BE | `routers/stock.py` | 40 min | P0 | 🔲 TODO | M1-15, M1-16 | Cache-aside pattern in both routes |
| M1-18 | Create `routers/status.py` | BE | `routers/status.py` | 10 min | P0 | 🔲 TODO | M1-14 | Calls `get_status()` |
| M1-19 | Create placeholder routers (indicators, compare) | BE | `routers/indicators.py` `routers/compare.py` | 5 min | P0 | 🔲 TODO | — | Just `router = APIRouter()` |
| M1-20 | Create `main.py` (FastAPI app + CORS + exception handler) | BE | `main.py` | 20 min | P0 | 🔲 TODO | M1-17, M1-18, M1-19 | CORS middleware, lifespan, error handler |

**Day 3 verification — run ALL 7 curl tests from M1 Checkpoint in Implementation Plan.**

### ✅ M1 Gate Tests

```
□  curl /health                         → {"status":"ok"}
□  curl /api/status                     → requests_used: 0
□  curl /api/stock/AAPL/price?period=1Y → OHLCV JSON, is_cached: false
□  curl /api/stock/AAPL/price?period=1Y → same data, is_cached: true
□  curl /api/status                     → requests_used: 1
□  curl /api/stock/AAPL$/price          → 400 INVALID_SYMBOL
□  Browser: http://localhost:8000/docs  → OpenAPI UI loads
□  git commit -m "feat(M1): backend foundation"
```

**M1 Status: 🔲 NOT STARTED**

---

## 4. M2 — Core Charts Frontend

**Goal:** React app with candlestick chart + volume + market summary bar pulling live data from backend.
**Days:** 4 – 6
**Gate:** Browser shows animated candlestick chart for AAPL with volume bars and the price glow effect.

---

### Day 4 Tasks — React Scaffold & Configuration

| Task ID | Task | Type | File(s) | Est. Time | Priority | Status | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| M2-01 | Scaffold Vite + React + TypeScript project | CH | `frontend/` | 10 min | P0 | 🔲 TODO | M1 gate ✅ | `npm create vite@latest` |
| M2-02 | Install all npm dependencies | CH | `package.json` | 10 min | P0 | 🔲 TODO | M2-01 | `axios lightweight-charts recharts react-query zustand clsx date-fns` |
| M2-03 | Install dev dependencies | CH | `package.json` | 5 min | P0 | 🔲 TODO | M2-01 | `tailwindcss postcss autoprefixer vitest` |
| M2-04 | Initialise Tailwind CSS | CH | `tailwind.config.js` `postcss.config.js` | 10 min | P0 | 🔲 TODO | M2-03 | `npx tailwindcss init -p` |
| M2-05 | Apply full Tailwind config from DESIGN.md §7 | CH | `tailwind.config.js` | 20 min | P0 | 🔲 TODO | M2-04 | All custom colors, fonts, animations, shadows |
| M2-06 | Create `src/styles/tokens.css` (design tokens) | CH | `tokens.css` | 20 min | P0 | 🔲 TODO | M2-04 | Full `:root {}` block from DESIGN.md §6 |
| M2-07 | Set up `src/index.css` (Tailwind directives + imports) | CH | `index.css` | 5 min | P0 | 🔲 TODO | M2-06 | `@tailwind base/components/utilities` + `@import tokens.css` |
| M2-08 | Add Google Fonts to `index.html` | CH | `index.html` | 5 min | P0 | 🔲 TODO | M2-04 | Inter + JetBrains Mono + DM Serif Display |
| M2-09 | Create `frontend/.env` and `.env.example` | CH | `.env` `.env.example` | 5 min | P0 | 🔲 TODO | M2-01 | `VITE_API_BASE_URL=http://localhost:8000` |
| M2-10 | Create `src/config.ts` | FE | `config.ts` | 5 min | P0 | 🔲 TODO | M2-09 | Reads `VITE_API_BASE_URL` |
| M2-11 | Create all `src/` subdirectories | CH | 9 directories | 5 min | P0 | 🔲 TODO | M2-01 | api, components/*, hooks, store, types, utils, styles |

**Day 4 checkpoint:** `npm run dev` starts without errors. Browser shows Vite default page on port 5173.

---

### Day 4 (continued) — Types, API Layer

| Task ID | Task | Type | File(s) | Est. Time | Priority | Status | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| M2-12 | Create `src/types/stock.ts` (all interfaces) | FE | `types/stock.ts` | 20 min | P0 | 🔲 TODO | M2-11 | Copy from SCHEMA.md §7 — all 16 interfaces + types |
| M2-13 | Create `src/api/client.ts` (Axios instance) | FE | `api/client.ts` | 10 min | P0 | 🔲 TODO | M2-12 | Base URL, timeout 10s, response interceptor |
| M2-14 | Create `src/api/stockApi.ts` (all endpoints) | FE | `api/stockApi.ts` | 25 min | P0 | 🔲 TODO | M2-13 | 9 API methods: getQuote, getPrice, getIndicators, getSignals, getOverview, getDrawdown, getDistribution, compareStocks, getStatus |

---

### Day 5 Tasks — State, Hooks, Shared Components

| Task ID | Task | Type | File(s) | Est. Time | Priority | Status | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| M2-15 | Create `src/store/dashboardStore.ts` (Zustand) | FE | `dashboardStore.ts` | 20 min | P0 | 🔲 TODO | M2-12 | symbol, period, overlays, compareSymbols + 5 actions |
| M2-16 | Create `src/hooks/useStockData.ts` (RQ hooks) | FE | `useStockData.ts` | 15 min | P0 | 🔲 TODO | M2-14 | `useStockPrice`, `useStockQuote`, `useApiStatus` |
| M2-17 | Create `LoadingSkeleton.tsx` | FE | `shared/LoadingSkeleton.tsx` | 15 min | P0 | 🔲 TODO | M2-11 | Wave animation, accepts height/width props |
| M2-18 | Create `ErrorBanner.tsx` | FE | `shared/ErrorBanner.tsx` | 15 min | P0 | 🔲 TODO | M2-11 | Error message + optional retry button |
| M2-19 | Create `MetricCard.tsx` | FE | `shared/MetricCard.tsx` | 10 min | P0 | 🔲 TODO | M2-11 | label + value + optional subvalue + color |
| M2-20 | Create `src/utils/formatters.ts` | FE | `utils/formatters.ts` | 20 min | P0 | 🔲 TODO | M2-11 | `formatPrice`, `formatPercent`, `formatVolume`, `formatMarketCap`, `formatRatio` |
| M2-21 | Create `src/utils/chartHelpers.ts` | FE | `utils/chartHelpers.ts` | 15 min | P0 | 🔲 TODO | M2-12 | `toCandlestickData()` (reverses array), `toVolumeData()` |

**Day 5 checkpoint:** No TypeScript errors (`npx tsc --noEmit` passes). Zustand store and React Query hooks importable.

---

### Day 6 Tasks — Core Charts & App Bootstrap

| Task ID | Task | Type | File(s) | Est. Time | Priority | Status | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| M2-22 | Create `MarketSummaryBar.tsx` | FE | `market/MarketSummaryBar.tsx` | 40 min | P0 | 🔲 TODO | M2-16, M2-19, M2-20 | Price hero with glow animation, change color, volume ratio |
| M2-23 | Create `CandlestickChart.tsx` | FE | `charts/CandlestickChart.tsx` | 60 min | P0 | 🔲 TODO | M2-16, M2-21 | lightweight-charts, volume sub-chart, resize handler |
| M2-24 | Bootstrap `main.tsx` with QueryClient + QueryClientProvider | FE | `main.tsx` | 10 min | P0 | 🔲 TODO | M2-16 | staleTime defaults, refetchOnWindowFocus: false |
| M2-25 | Bootstrap `App.tsx` with header + MarketSummaryBar + CandlestickChart | FE | `App.tsx` | 20 min | P0 | 🔲 TODO | M2-22, M2-23 | First visible layout |
| M2-26 | Verify full M2 visual checklist in browser | TS | — | 20 min | P0 | 🔲 TODO | M2-25 | All 8 visual checks + network tab validation |

### ✅ M2 Gate Tests

```
□  npm run dev starts without errors (port 5173)
□  Dark background (#080B18) fills entire viewport
□  Header shows amber ◈ StockLens
□  MarketSummaryBar renders price in large monospace
□  Up day = green glow; Down day = red glow on price
□  Candlestick chart: green/red candles, dark background
□  Volume bars below price chart
□  Chart resizes when browser window resizes
□  No console errors in browser DevTools
□  Network tab: requests go to localhost:8000, is_cached: true on second load
□  git commit -m "feat(M2): candlestick chart, market summary bar, React scaffold"
```

**M2 Status: 🔲 NOT STARTED**

---

## 5. M3 — Technical Indicators

**Goal:** RSI + MACD charts computed server-side from cached OHLCV. Zero new API calls for indicators.
**Days:** 7
**Gate:** `/api/stock/AAPL/indicators` returns RSI + MACD + EMA + Bollinger data. Budget counter unchanged after indicators fetch.

---

### Day 7 Tasks — Backend Indicators Service

| Task ID | Task | Type | File(s) | Est. Time | Priority | Status | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| M3-01 | Create `services/indicators.py` (Pandas computations) | BE | `services/indicators.py` | 50 min | P0 | 🔲 TODO | M2 gate ✅ | RSI (Wilder), MACD (12/26/9), EMA (20/50/200), Bollinger Bands (20, ±2σ) |
| M3-02 | Update `routers/indicators.py` with GET `/{symbol}/indicators` | BE | `routers/indicators.py` | 30 min | P0 | 🔲 TODO | M3-01 | Uses cached OHLCV via `get_stale(price_key(symbol))` — zero API calls |
| M3-03 | Test `/indicators` returns correct shape | TS | — | 10 min | P0 | 🔲 TODO | M3-02 | `curl /api/stock/AAPL/indicators` — check rsi[], macd[], ema[], bollinger[] |
| M3-04 | Verify zero budget increment for indicators | TS | — | 5 min | P0 | 🔲 TODO | M3-03 | `curl /api/status` before + after — count must not change |

### Day 7 (continued) — Frontend Indicator Charts

| Task ID | Task | Type | File(s) | Est. Time | Priority | Status | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| M3-05 | Create `hooks/useIndicators.ts` | FE | `useIndicators.ts` | 10 min | P0 | 🔲 TODO | M3-02 | React Query, staleTime: 1hr |
| M3-06 | Create `RSIChart.tsx` | FE | `charts/RSIChart.tsx` | 40 min | P0 | 🔲 TODO | M3-05 | recharts LineChart + ReferenceLine at 30/70 + dynamic current value badge |
| M3-07 | Create `MACDChart.tsx` | FE | `charts/MACDChart.tsx` | 35 min | P0 | 🔲 TODO | M3-05 | recharts ComposedChart — 2 lines + Bar histogram |
| M3-08 | Create `IndicatorsPanel.tsx` + update `App.tsx` | FE | `charts/IndicatorsPanel.tsx` `App.tsx` | 15 min | P0 | 🔲 TODO | M3-06, M3-07 | 2-column grid below CandlestickChart |

### ✅ M3 Gate Tests

```
□  curl /api/stock/AAPL/indicators → JSON with 4 arrays (rsi, macd, ema, bollinger)
□  rsi values all in range 0.0–100.0
□  Budget counter unchanged after /indicators fetch
□  RSI chart visible below candlestick (amber line)
□  30 and 70 reference lines shown (dashed green/red)
□  Current RSI value badge in card header changes color
□  MACD chart visible alongside RSI
□  MACD line (amber) + signal line (blue) + histogram bars
□  git commit -m "feat(M3): RSI + MACD charts, Pandas indicator engine"
```

**M3 Status: 🔲 NOT STARTED**

---

## 6. M4 — Analytics Engine

**Goal:** Server-side signals engine (trend, RSI state, volatility, volume anomaly, Bollinger squeeze) + Analytics Insights sidebar.
**Days:** 8 – 9
**Gate:** Analytics sidebar shows 5 signal cards with correct colors, values, and plain-English summary.

---

### Day 8 Tasks — Analytics Backend

| Task ID | Task | Type | File(s) | Est. Time | Priority | Status | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| M4-01 | Create `services/analytics.py` — `compute_signals()` | BE | `services/analytics.py` | 60 min | P0 | 🔲 TODO | M3 gate ✅ | EMA crossover, RSI, volatility, volume ratio, Bollinger squeeze, plain-English summary |
| M4-02 | Create `compute_drawdown()` in analytics.py | BE | `services/analytics.py` | 20 min | P1 | 🔲 TODO | M4-01 | `cummax()` → peak-to-trough % |
| M4-03 | Create `compute_return_distribution()` in analytics.py | BE | `services/analytics.py` | 15 min | P1 | 🔲 TODO | M4-01 | `pct_change() * 100` → daily returns list |
| M4-04 | Create `compute_normalised_comparison()` in analytics.py | BE | `services/analytics.py` | 25 min | P1 | 🔲 TODO | M4-01 | Divide all series by `iloc[0] * 100`, compute total returns |
| M4-05 | Add `GET /{symbol}/signals` to indicators router | BE | `routers/indicators.py` | 15 min | P0 | 🔲 TODO | M4-01 | Returns `AnalyticsSignals` Pydantic model |
| M4-06 | Add `GET /{symbol}/drawdown` to indicators router | BE | `routers/indicators.py` | 10 min | P1 | 🔲 TODO | M4-02 | Accepts `period` query param |
| M4-07 | Add `GET /{symbol}/distribution` to indicators router | BE | `routers/indicators.py` | 10 min | P1 | 🔲 TODO | M4-03 | Accepts `period` query param |
| M4-08 | Test all three new endpoints with curl | TS | — | 15 min | P0 | 🔲 TODO | M4-05, M4-06, M4-07 | Check shapes + value ranges |

**Day 8 checkpoint:** All 3 new endpoints return expected JSON. Drawdown values ≤ 0. Signals summary is a readable English string.

---

### Day 9 Tasks — Analytics Insights Frontend

| Task ID | Task | Type | File(s) | Est. Time | Priority | Status | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| M4-09 | Create `hooks/useSignals.ts` | FE | `hooks/useSignals.ts` | 10 min | P0 | 🔲 TODO | M4-05 | React Query, staleTime: 1hr |
| M4-10 | Create `SignalBadge.tsx` | FE | `analytics/SignalBadge.tsx` | 25 min | P0 | 🔲 TODO | M4-09 | 9 variants (bullish/bearish/neutral/overbought/oversold/high/low/medium/squeeze) |
| M4-11 | Create `AnalyticsInsights.tsx` (sidebar panel) | FE | `analytics/AnalyticsInsights.tsx` | 60 min | P0 | 🔲 TODO | M4-09, M4-10 | 5 signal cards + RSI gradient track + volume bar + summary paragraph |
| M4-12 | Create `DrawdownChart.tsx` | FE | `charts/DrawdownChart.tsx` | 30 min | P1 | 🔲 TODO | M4-06 | recharts AreaChart, negative fill, bear color |
| M4-13 | Create `DistributionChart.tsx` | FE | `charts/DistributionChart.tsx` | 30 min | P1 | 🔲 TODO | M4-07 | recharts BarChart, positive = bull, negative = bear |

### ✅ M4 Gate Tests

```
□  curl /api/stock/AAPL/signals → valid JSON with all 8 signal fields
□  trend_signal is "bullish" or "bearish" (not "neutral" unless data too short)
□  rsi_value is between 0–100
□  curl /api/stock/AAPL/drawdown → drawdown values all ≤ 0.0
□  curl /api/stock/AAPL/distribution → daily_return values present
□  Analytics sidebar renders 5 signal cards
□  Each card shows correct badge color (green=bull, red=bear, blue=neutral)
□  RSI gradient track renders with marker at correct % position
□  Summary text renders in italic serif font
□  Changing symbol updates all 5 signal cards
□  Cards animate in with staggered delay on symbol change
□  DrawdownChart renders with red area fill below zero
□  DistributionChart renders return histogram
□  App.tsx updated to 2-column layout (main + 320px sidebar)
□  git commit -m "feat(M4): analytics signals engine, insights sidebar, drawdown + distribution charts"
```

**M4 Status: 🔲 NOT STARTED**

---

## 7. M5 — Fundamentals & Comparison

**Goal:** Company overview panel (fundamentals) + multi-stock normalised performance comparison chart.
**Days:** 10 – 11
**Gate:** Comparison chart shows 2+ tickers normalised to 100 with total return legend. Fundamentals table shows P/E, EPS, market cap, etc.

---

### Day 10 Tasks — Backend Overview + Compare

| Task ID | Task | Type | File(s) | Est. Time | Priority | Status | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| M5-01 | Add `GET /{symbol}/overview` to stock router | BE | `routers/stock.py` | 25 min | P1 | 🔲 TODO | M4 gate ✅ | Calls `fetch_overview()` via cache-aside, 24h TTL |
| M5-02 | Create `routers/compare.py` with `GET /compare` | BE | `routers/compare.py` | 35 min | P1 | 🔲 TODO | M4-04 | Max 5 symbols, checks cache for each, calls `compute_normalised_comparison()` |
| M5-03 | Test overview endpoint with curl | TS | — | 10 min | P1 | 🔲 TODO | M5-01 | Check nullable fields show `null` not `"None"` |
| M5-04 | Test compare endpoint — fetch two symbols, then compare | TS | — | 15 min | P1 | 🔲 TODO | M5-02 | MSFT price first, then `/compare?symbols=AAPL,MSFT` |

**Day 10 checkpoint:** Both endpoints return valid JSON. Compare base values are exactly `100.0` on `base_date`.

---

### Day 11 Tasks — Frontend Comparison + Fundamentals

| Task ID | Task | Type | File(s) | Est. Time | Priority | Status | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| M5-05 | Create `ComparisonChart.tsx` | FE | `charts/ComparisonChart.tsx` | 50 min | P1 | 🔲 TODO | M5-02 | recharts LineChart, dynamic series per symbol, 5 color slots, 100 reference line |
| M5-06 | Create total returns legend below comparison chart | FE | `charts/ComparisonChart.tsx` | 20 min | P1 | 🔲 TODO | M5-05 | Colored dot + symbol + % return badge |
| M5-07 | Create `CompareInput.tsx` (add/remove symbols) | FE | `controls/CompareInput.tsx` | 25 min | P1 | 🔲 TODO | M2-15 | Text input + Add button + symbol chips with × |
| M5-08 | Create `FundamentalsPanel.tsx` (sidebar) | FE | `market/FundamentalsPanel.tsx` | 35 min | P1 | 🔲 TODO | M5-01 | 8-row table: P/E, ForwardPE, EPS, Revenue, Profit Margin, Div Yield, Beta, Target |
| M5-09 | Add FundamentalsPanel to sidebar (below AnalyticsInsights) | FE | `App.tsx` or `Sidebar.tsx` | 10 min | P1 | 🔲 TODO | M5-08 | Separated by border-top |
| M5-10 | Add ComparisonChart to main content area | FE | `App.tsx` | 10 min | P1 | 🔲 TODO | M5-05, M5-07 | Below IndicatorsPanel |

### ✅ M5 Gate Tests

```
□  curl /api/stock/MSFT/overview → valid JSON, pe_ratio is number not "None"
□  Fetch MSFT price first: curl /api/stock/MSFT/price
□  curl /api/stocks/compare?symbols=AAPL,MSFT → base values = 100.0
□  total_returns sums correctly vs final data point
□  ComparisonChart renders with 2 colored lines (amber + blue)
□  Total returns legend shows +/- % in bull/bear color
□  Reference line at 100 visible (dashed, dark)
□  Adding a symbol via CompareInput adds a new line
□  Removing a symbol removes the line
□  FundamentalsPanel shows 8 rows in sidebar
□  Null values display as "—"
□  Analyst Target shows upside/downside % badge
□  git commit -m "feat(M5): company overview, fundamentals panel, comparison chart"
```

**M5 Status: 🔲 NOT STARTED**

---

## 8. M6 — Polish & Deployment

**Goal:** Full UI polish (header, search, period tabs, overlay toggles, budget badge), production deployment on Railway + Vercel.
**Days:** 12 – 13
**Gate:** Production URLs live, all smoke tests pass, no CORS errors in browser.

---

### Day 12 Tasks — UI Polish & Controls

| Task ID | Task | Type | File(s) | Est. Time | Priority | Status | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| M6-01 | Create `SymbolSearch.tsx` | FE | `controls/SymbolSearch.tsx` | 25 min | P0 | 🔲 TODO | M5 gate ✅ | Pill input, amber focus ring, submits on Enter, clears after submit |
| M6-02 | Create `PeriodSelector.tsx` | FE | `controls/PeriodSelector.tsx` | 15 min | P0 | 🔲 TODO | M2-15 | 5 pill tabs, amber active state |
| M6-03 | Create `OverlayToggles.tsx` | FE | `controls/OverlayToggles.tsx` | 20 min | P0 | 🔲 TODO | M2-15 | EMA20/50/200 + BB chips, colored indicators, toggle Zustand overlays |
| M6-04 | Create `BudgetBadge.tsx` | FE | `shared/BudgetBadge.tsx` | 20 min | P0 | 🔲 TODO | M2-16 | 3 states: normal/warning/critical with correct colors |
| M6-05 | Create `Header.tsx` (final) | FE | `layout/Header.tsx` | 20 min | P0 | 🔲 TODO | M6-01, M6-04 | ◈ StockLens logotype + SymbolSearch + BudgetBadge |
| M6-06 | Create `DashboardLayout.tsx` | FE | `layout/DashboardLayout.tsx` | 20 min | P0 | 🔲 TODO | M6-05 | Header + MarketSummaryBar + Toolbar + 2-col layout |
| M6-07 | Assemble final `App.tsx` with all components | FE | `App.tsx` | 30 min | P0 | 🔲 TODO | M6-06 | Final layout matching DESIGN.md §8.1 wireframe |
| M6-08 | Wire EMA overlay data to CandlestickChart | FE | `charts/CandlestickChart.tsx` | 30 min | P0 | 🔲 TODO | M6-03, M3-05 | Add EMA line series conditionally based on Zustand overlay state |

---

### Day 13 Tasks — Deployment & Final QA

| Task ID | Task | Type | File(s) | Est. Time | Priority | Status | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|
| M6-09 | Create `backend/Procfile` for Railway | DO | `Procfile` | 5 min | P0 | 🔲 TODO | M6-07 | `web: uvicorn main:app --host 0.0.0.0 --port $PORT` |
| M6-10 | Deploy backend to Railway (set env vars) | DO | Railway dashboard | 30 min | P0 | 🔲 TODO | M6-09 | Set `ALPHA_VANTAGE_API_KEY`, `ALLOWED_ORIGINS`, `ENVIRONMENT=production` |
| M6-11 | Deploy frontend to Vercel (set env vars) | DO | Vercel dashboard | 20 min | P0 | 🔲 TODO | M6-10 | Set `VITE_API_BASE_URL=https://your-app.railway.app` |
| M6-12 | Update Railway ALLOWED_ORIGINS with Vercel URL + redeploy | DO | Railway env vars | 10 min | P0 | 🔲 TODO | M6-11 | CORS must include https://your-app.vercel.app |

### ✅ M6 Gate Tests — Production

```
CONTROLS:
□  SymbolSearch: type "TSLA" + Enter → all charts update to TSLA
□  PeriodSelector: click "3M" → candlestick chart shows 3 months
□  OverlayToggles: toggle EMA20 off → line disappears from chart
□  BudgetBadge: shows correct count, yellow at 20+, red at 24+

ERROR STATES:
□  Type "XYZQ9999" → ErrorBanner shows "No data found for..."
□  ErrorBanner retry button retriggers fetch
□  When budget = 24: charts still show (stale cache), yellow warning banner

PRODUCTION:
□  curl https://your-backend.railway.app/health → {"status":"ok"}
□  curl https://your-backend.railway.app/api/stock/AAPL/price → OHLCV JSON
□  Browser: https://your-app.vercel.app → dashboard loads
□  Network tab: requests go to railway.app (not localhost)
□  No CORS errors in browser console
□  Mobile browser: dashboard is functional (not broken, just not polished)

FINAL:
□  git tag -a v1.0.0 -m "StockLens v1.0.0"
□  git push origin main --tags
```

**M6 Status: 🔲 NOT STARTED**

---

## 9. Cross-Milestone Dependency Map

Shows which tasks from earlier milestones must be complete before later tasks can start.

```
HARD DEPENDENCIES (cannot start until predecessor is ✅ DONE)
──────────────────────────────────────────────────────────────────────

M1-10 (database.py)   ──► M1-14 (budget.py)
                      ──► M1-15 (cache.py)

M1-15 (cache.py)      ──► M1-16 (alpha_vantage.py)
M1-14 (budget.py)     ──► M1-16 (alpha_vantage.py)

M1-16 (alpha_vantage) ──► M1-17 (stock router)

M1-17 (stock router)  ──► M1-20 (main.py)

M1 gate ✅            ──► ALL of M2

M2-12 (types)         ──► M2-13, M2-14, M2-15
M2-14 (stockApi)      ──► M2-16 (hooks)
M2-15 (Zustand)       ──► M2-22, M2-23, M4-11
M2-16 (hooks)         ──► M2-22, M2-23, M2-24

M2 gate ✅            ──► M3-01 (indicators service)

M3-01 (indicators)    ──► M3-02 (indicators router)
M3-02 (router)        ──► M3-05 (useIndicators hook)
M3-05 (hook)          ──► M3-06 (RSIChart), M3-07 (MACDChart)

M3 gate ✅            ──► M4-01 (analytics engine)

M4-01 (signals fn)    ──► M4-05 (signals route)
M4-02 (drawdown)      ──► M4-06 (drawdown route)
M4-03 (distribution)  ──► M4-07 (distribution route)
M4-04 (normalise)     ──► M5-02 (compare router)
M4-05 (signals route) ──► M4-09 (useSignals hook)
M4-09 (hook)          ──► M4-10 (SignalBadge), M4-11 (Insights panel)

M4 gate ✅            ──► M5-01 (overview endpoint), M5-02 (compare router)

M5-01 (overview)      ──► M5-08 (FundamentalsPanel)
M5-02 (compare)       ──► M5-05 (ComparisonChart)
M5-05 (chart)         ──► M5-06 (returns legend), M5-10 (add to App)

M5 gate ✅            ──► ALL of M6 (polish & deploy)

M6-07 (App.tsx final) ──► M6-09 (Procfile), M6-10 (Railway deploy)
M6-10 (Railway URL)   ──► M6-11 (Vercel deploy with Railway URL)
M6-11 (Vercel URL)    ──► M6-12 (update CORS, redeploy Railway)


SOFT DEPENDENCIES (can be done in parallel but logically ordered)
──────────────────────────────────────────────────────────────────────
M2-17, M2-18, M2-19   Can be built in parallel (all shared components)
M2-20, M2-21           Can be built in parallel (utils)
M3-06, M3-07           Can be built in parallel (both need M3-05)
M4-02, M4-03, M4-04   Can be built in parallel (all analytics fns in same file)
M5-05, M5-08           Can be built in parallel (FE + BE different)
M6-01 through M6-04    Can be built in parallel (all UI controls)
```

---

## 10. Blocker Log

Record any task that is blocked, the reason, and the resolution.

| Blocker ID | Date | Task Blocked | Task ID | Reason | Resolution | Resolved Date |
|---|---|---|---|---|---|---|
| BLK-001 | — | — | — | — | — | — |

> **Guidance on common blockers:**
>
> | Blocker | Most likely fix |
> |---|---|
> | Alpha Vantage returns `"Note: Thank you..."` | Per-minute rate limit (5 req/min). Wait 60s. |
> | Alpha Vantage returns `"Information: ..."` | Daily limit hit (25 req). Wait until midnight UTC. |
> | `ModuleNotFoundError` in FastAPI | Not in virtual environment. Run `source venv/bin/activate`. |
> | Candlestick chart blank (no candles) | Data not sorted ascending. Confirm `toCandlestickData()` reverses the array. |
> | CORS error in browser | Backend `ALLOWED_ORIGINS` doesn't include frontend origin. Update `.env`. |
> | SQLite `database is locked` | Multiple Uvicorn workers competing. Use `--workers 1` in dev. |
> | Railway deploy fails | `Procfile` missing or `$PORT` not used. |
> | Vercel build fails | `VITE_API_BASE_URL` env var not set in Vercel project settings. |
> | `null` showing as `"None"` string | Alpha Vantage normalisation missing `"None" → None` conversion. |
> | React Query showing stale data | Call `queryClient.invalidateQueries()` or clear browser storage. |

---

## 11. Decision Log

Record every significant technical decision made during the build — the why matters as much as the what.

| Decision ID | Date | Decision | Alternatives Considered | Reason | Impact |
|---|---|---|---|---|---|
| DEC-001 | Pre-build | SQLite over Redis for caching | Redis (faster), in-memory dict | Persistent across restarts = no wasted API budget. No extra infra. | Affects M1-10, M1-15 |
| DEC-002 | Pre-build | Compute indicators server-side from OHLCV | Use AV dedicated indicator endpoints | Saves 4+ API calls per symbol per day | Affects M3-01 |
| DEC-003 | Pre-build | `lightweight-charts` for candlestick | Plotly, Recharts, D3.js | GPU canvas, native pan/zoom, 10k+ candles | Affects M2-23 |
| DEC-004 | Pre-build | `recharts` for all other charts | Chart.js, Victory, Nivo | React-native API, simpler customisation | Affects M3-06/07, M4-12/13, M5-05 |
| DEC-005 | Pre-build | React Query + Zustand (split state) | Redux, Context API | RQ for server state, Zustand for UI — clean separation | Affects M2-15/16 |
| DEC-006 | Pre-build | Hard stop at 24/25 requests (not 25) | Stop at 25 | Prevents race condition if 2 requests reach check at 24 simultaneously | Affects M1-14 |
| DEC-007 | — | — | — | — | — |

---

## 12. API Budget Daily Tracker

Track real Alpha Vantage API calls made each day. This is distinct from the in-app `/api/status` endpoint — this is a manual log you maintain.

> **Free tier reset:** Midnight UTC daily. Max 25 requests per day.
> **Hard stop in app:** At 24 requests. The 25th is a safety buffer.

| Date | Requests Used | Symbols Fetched | Notes | Remaining |
|---|---|---|---|---|
| Day 1 (setup) | 0 | — | No AV calls during M1 setup | 25 |
| Day 2 (M1 test) | 1 | AAPL | First real fetch via `/price` | 24 |
| Day 3 (M1 gate) | 1–2 | AAPL | Quote + price if not cached | 22–23 |
| Day 4 (M2 scaffold) | 0 | — | No AV calls during frontend setup | 22–23 |
| Day 5 (M2 components) | 0 | — | Working from cache | 22–23 |
| Day 6 (M2 chart test) | 0–1 | AAPL | Cache warm from Day 3; reset at midnight | 24–25 |
| Day 7 (M3) | 0 | — | Indicators use cached OHLCV | 24–25 |
| Day 8 (M4) | 0 | — | Analytics use cached OHLCV | 24–25 |
| Day 9 (M4 frontend) | 0 | — | All from cache | 24–25 |
| Day 10 (M5 backend) | 1–2 | AAPL, MSFT | Overview (1) + MSFT price for compare test (1) | 22–24 |
| Day 11 (M5 frontend) | 0–1 | GOOGL | Add GOOGL to comparison test | 23–24 |
| Day 12 (M6 polish) | 0 | — | All from cache, testing UI only | 23–24 |
| Day 13 (deploy) | 2–3 | AAPL | Fresh deploys reset server cache → re-fetch on prod | 21–23 |

> ⚠️ **Watch out:** Restarting the backend server does NOT clear the SQLite cache (persisted on disk). Cache survives restarts — this is by design and protects your budget.

---

## 13. Daily Stand-Up Log

Fill in at the start and end of each working session.

---

### Template (copy per day)

```
DATE: ___________  DAY: ___  MILESTONE: ___

PLANNED TODAY:
  1.
  2.
  3.

COMPLETED:
  ✅
  ✅
  ✅

BLOCKED:
  ⛔  (add to Blocker Log §10 if unresolved by EOD)

DECISIONS MADE:
  (add to Decision Log §11 if significant)

API REQUESTS USED TODAY: ___  (total to date: ___)

NOTES:
```

---

### Day 1 Log

```
DATE: ___________  DAY: 1  MILESTONE: M1

PLANNED TODAY:
  1. Complete M1-01 through M1-13 (prereqs + env + models + exceptions)
  2. Verify database creates on first run (M1-11)
  3. All schemas importable without error

COMPLETED:

BLOCKED:

API REQUESTS USED TODAY: 0  (total: 0)

NOTES:
```

---

### Day 2 Log

```
DATE: ___________  DAY: 2  MILESTONE: M1

PLANNED TODAY:
  1. Complete M1-14 (budget.py)
  2. Complete M1-15 (cache.py)
  3. Complete M1-16 (alpha_vantage.py)

COMPLETED:

BLOCKED:

API REQUESTS USED TODAY: 0  (total: 0)

NOTES:
```

---

### Day 3 Log

```
DATE: ___________  DAY: 3  MILESTONE: M1

PLANNED TODAY:
  1. Complete M1-17 through M1-20 (routers + main.py)
  2. Run uvicorn, execute all 7 curl tests
  3. Pass M1 gate ✅, make git commit

COMPLETED:

BLOCKED:

API REQUESTS USED TODAY: 1–2  (total: 1–2)

NOTES:
```

---

### Day 4 Log

```
DATE: ___________  DAY: 4  MILESTONE: M2

PLANNED TODAY:
  1. Complete M2-01 through M2-11 (scaffold + config + directories)
  2. Complete M2-12 through M2-14 (types + API client + stockApi)
  3. npm run dev starts without errors

COMPLETED:

BLOCKED:

API REQUESTS USED TODAY: 0  (total: __)

NOTES:
```

---

### Day 5 Log

```
DATE: ___________  DAY: 5  MILESTONE: M2

PLANNED TODAY:
  1. Complete M2-15 through M2-21 (Zustand + hooks + shared components + utils)
  2. npx tsc --noEmit passes with 0 errors
  3. All utilities tested manually in browser console

COMPLETED:

BLOCKED:

API REQUESTS USED TODAY: 0  (total: __)

NOTES:
```

---

### Day 6 Log

```
DATE: ___________  DAY: 6  MILESTONE: M2

PLANNED TODAY:
  1. Complete M2-22 (MarketSummaryBar) — the signature price hero component
  2. Complete M2-23 (CandlestickChart) — the main chart
  3. Complete M2-24, M2-25, M2-26 (main.tsx, App.tsx, visual verify)
  4. Pass M2 gate ✅, make git commit

COMPLETED:

BLOCKED:

API REQUESTS USED TODAY: 0–1  (total: __)

NOTES:
```

---

### Day 7 Log

```
DATE: ___________  DAY: 7  MILESTONE: M3

PLANNED TODAY:
  1. Complete M3-01 (indicators.py — Pandas RSI/MACD/EMA/BB)
  2. Complete M3-02 (indicators router)
  3. Complete M3-03, M3-04 (curl tests + budget verification)
  4. Complete M3-05 through M3-08 (hook + RSI chart + MACD chart + panel)
  5. Pass M3 gate ✅, make git commit

COMPLETED:

BLOCKED:

API REQUESTS USED TODAY: 0  (total: __)  ← key metric for this milestone

NOTES:
```

---

### Day 8 Log

```
DATE: ___________  DAY: 8  MILESTONE: M4

PLANNED TODAY:
  1. Complete M4-01 (compute_signals — the core analytics function)
  2. Complete M4-02, M4-03, M4-04 (drawdown, distribution, normalised compare)
  3. Complete M4-05, M4-06, M4-07 (3 new router endpoints)
  4. Complete M4-08 (curl test all 3 endpoints)

COMPLETED:

BLOCKED:

API REQUESTS USED TODAY: 0  (total: __)

NOTES:
```

---

### Day 9 Log

```
DATE: ___________  DAY: 9  MILESTONE: M4

PLANNED TODAY:
  1. Complete M4-09 (useSignals hook)
  2. Complete M4-10 (SignalBadge — 9 variants)
  3. Complete M4-11 (AnalyticsInsights — the most complex component)
  4. Complete M4-12, M4-13 (DrawdownChart + DistributionChart)
  5. Pass M4 gate ✅, make git commit

COMPLETED:

BLOCKED:

API REQUESTS USED TODAY: 0  (total: __)

NOTES:
```

---

### Day 10 Log

```
DATE: ___________  DAY: 10  MILESTONE: M5

PLANNED TODAY:
  1. Complete M5-01 (overview endpoint — costs 1 API call for AAPL)
  2. Complete M5-02 (compare router)
  3. Complete M5-03, M5-04 (curl tests — costs 1 API call for MSFT)
  4. Verify total budget usage

COMPLETED:

BLOCKED:

API REQUESTS USED TODAY: 2  (total: __)

NOTES:
```

---

### Day 11 Log

```
DATE: ___________  DAY: 11  MILESTONE: M5

PLANNED TODAY:
  1. Complete M5-05, M5-06 (ComparisonChart + returns legend)
  2. Complete M5-07 (CompareInput control)
  3. Complete M5-08, M5-09, M5-10 (FundamentalsPanel + wire into sidebar/App)
  4. Pass M5 gate ✅, make git commit

COMPLETED:

BLOCKED:

API REQUESTS USED TODAY: 0–1  (total: __)

NOTES:
```

---

### Day 12 Log

```
DATE: ___________  DAY: 12  MILESTONE: M6

PLANNED TODAY:
  1. Complete M6-01 through M6-04 (Search + Period + Overlays + Budget badge)
  2. Complete M6-05, M6-06 (Header + DashboardLayout)
  3. Complete M6-07 (final App.tsx assembly — full layout)
  4. Complete M6-08 (wire EMA overlays to candlestick chart)

COMPLETED:

BLOCKED:

API REQUESTS USED TODAY: 0  (total: __)

NOTES:
```

---

### Day 13 Log

```
DATE: ___________  DAY: 13  MILESTONE: M6

PLANNED TODAY:
  1. Complete M6-09 (Procfile)
  2. Complete M6-10 (Railway deploy + env vars)
  3. Complete M6-11 (Vercel deploy + env var)
  4. Complete M6-12 (update CORS + redeploy)
  5. Pass M6 gate ✅ — all production tests green
  6. git tag v1.0.0 + push

COMPLETED:

BLOCKED:

API REQUESTS USED TODAY: 2–3  (production cache cold start)  (total: __)

NOTES:
```

---

## 14. Bug Tracker

Log all bugs found during development and testing.

| Bug ID | Date Found | Milestone | Severity | Component | Description | Steps to Reproduce | Root Cause | Fix | Status | Fixed Date |
|---|---|---|---|---|---|---|---|---|---|---|
| BUG-001 | — | — | — | — | — | — | — | — | 🔲 OPEN | — |

**Severity levels:**

| Level | Meaning |
|---|---|
| 🔴 Critical | Dashboard unusable — crash, blank screen, data loss |
| 🟠 High | Key feature broken — chart not rendering, endpoint 500 |
| 🟡 Medium | Feature degraded but workaround exists |
| 🟢 Low | Visual glitch, typo, minor UX issue |

**Known potential bugs to watch for:**

| Area | Potential Bug | How to detect |
|---|---|---|
| AV normalisation | `"None"` string from AV overview leaking as literal string | `curl /overview` — pe_ratio should be `null`, not `"None"` |
| lightweight-charts | Candles not rendering (blank chart) | Confirm data sorted ascending; check `toCandlestickData()` reversal |
| React Query | Old symbol data flashing before new symbol loads | Stale-while-revalidate delay; add `isFetching` check to show skeleton |
| Budget counter | Count increments even on cache hit | Add log in `increment_budget()` and check it only runs after `_call_av()` |
| Pandas RSI | First 14 RSI values are NaN (not in output) | Confirm `dropna()` is applied before returning records |
| CORS | CORS error after deploying to prod | Railway `ALLOWED_ORIGINS` must match exact Vercel URL including `https://` |
| Compare | Base value not exactly 100.0 | `iloc[0]` must be the earliest date row; ensure sort ascending before normalise |
| Zustand | Compare symbols list accumulates duplicates | `new Set([...])` in `addCompare` action |

---

## 15. Git Commit Log

Track all commits with their task IDs.

| Commit # | Date | Message | Tasks Completed | Branch |
|---|---|---|---|---|
| 001 | — | `chore: initialise repository structure` | M1-04 | main |
| 002 | — | `chore(M1): Python venv, requirements, .env, config` | M1-05–M1-09 | feature/M1-backend |
| 003 | — | `feat(M1): database module, Pydantic schemas, exceptions` | M1-10–M1-13 | feature/M1-backend |
| 004 | — | `feat(M1): budget service, cache service, AV client` | M1-14–M1-16 | feature/M1-backend |
| 005 | — | `feat(M1): stock router, status router, main.py — M1 gate ✅` | M1-17–M1-20 | feature/M1-backend |
| 006 | — | `chore(M2): Vite scaffold, Tailwind, tokens, fonts, env` | M2-01–M2-11 | feature/M2-charts |
| 007 | — | `feat(M2): TypeScript types, Axios client, stockApi` | M2-12–M2-14 | feature/M2-charts |
| 008 | — | `feat(M2): Zustand store, React Query hooks, shared components, utils` | M2-15–M2-21 | feature/M2-charts |
| 009 | — | `feat(M2): MarketSummaryBar, CandlestickChart, App bootstrap — M2 gate ✅` | M2-22–M2-26 | feature/M2-charts |
| 010 | — | `feat(M3): Pandas indicator engine, indicators router` | M3-01–M3-04 | feature/M3-indicators |
| 011 | — | `feat(M3): RSI chart, MACD chart, IndicatorsPanel — M3 gate ✅` | M3-05–M3-08 | feature/M3-indicators |
| 012 | — | `feat(M4): analytics engine — signals, drawdown, distribution, compare` | M4-01–M4-08 | feature/M4-analytics |
| 013 | — | `feat(M4): SignalBadge, AnalyticsInsights sidebar, Drawdown + Distribution charts — M4 gate ✅` | M4-09–M4-13 | feature/M4-analytics |
| 014 | — | `feat(M5): company overview endpoint, compare router` | M5-01–M5-04 | feature/M5-fundamentals |
| 015 | — | `feat(M5): ComparisonChart, FundamentalsPanel, CompareInput — M5 gate ✅` | M5-05–M5-10 | feature/M5-fundamentals |
| 016 | — | `feat(M6): SymbolSearch, PeriodSelector, OverlayToggles, BudgetBadge, Header, DashboardLayout, App final` | M6-01–M6-08 | feature/M6-deploy |
| 017 | — | `feat(M6): EMA overlay wiring to candlestick chart` | M6-08 | feature/M6-deploy |
| 018 | — | `chore(M6): Procfile, Railway deploy, Vercel deploy — M6 gate ✅` | M6-09–M6-12 | main |
| 019 | — | `release: v1.0.0 StockLens initial release` | All | main |

---

## 16. Production Readiness Checklist

Complete this checklist before tagging v1.0.0. Every item must be ✅ before release.

### Security

```
□  .env is in .gitignore and NOT committed
□  API key is only in Railway env vars (not in code)
□  ALLOWED_ORIGINS contains only the specific Vercel URL (not *)
□  Symbol input sanitised (alphanumeric + . and - only, max 10 chars)
□  No stack traces exposed in API error responses
□  SQLite db file is in .gitignore
```

### Backend

```
□  /health endpoint returns 200
□  /api/status returns correct budget count
□  All 9 endpoints return correct response shapes
□  Cache-aside pattern verified (second call is_cached: true)
□  Budget hard stop at 24 (test by mocking count to 24)
□  Stale cache returned when budget exhausted (not 500 error)
□  All nullable overview fields return null (not "None" string)
□  Symbol sanitisation rejects AAPL$ → 400 INVALID_SYMBOL
□  Invalid period rejects "2Y" → 400 INVALID_PERIOD
□  Compare rejects > 5 symbols → 400 TOO_MANY_SYMBOLS
```

### Frontend

```
□  No console errors on initial load
□  No TypeScript errors (npx tsc --noEmit passes)
□  All 5 analytics signal cards render
□  Period tabs all work (1M/3M/6M/1Y/5Y)
□  Symbol search changes all charts
□  Overlay toggles show/hide EMA lines on chart
□  Budget badge shows correct count
□  Budget warning state: yellow badge at 20+
□  Budget critical state: red "CACHE ONLY" badge at 24
□  Error banner shows for invalid symbol
□  Retry button on error banner triggers refetch
□  Loading skeletons show while fetching
□  Comparison chart reacts to add/remove symbol
□  Fundamentals table shows "—" for null values
```

### Performance

```
□  Initial page load (cache warm): < 2 seconds
□  Symbol change: skeletons appear immediately, data < 2s
□  Candlestick chart renders 252 candles without lag
□  Chart resize handler works (drag browser window)
□  No memory leaks (check DevTools Memory tab after 10+ symbol changes)
```

### Deployment

```
□  Railway backend URL is live and healthy
□  Vercel frontend URL is live
□  Production CORS: no errors when frontend calls backend
□  Production budget starts at 0 on first day
□  Production SQLite db created on first startup
```

---

## 17. Progress Metrics

Update this section weekly to track velocity and identify bottlenecks.

### Task completion by type

| Type | Total | Done | Remaining | % |
|---|---|---|---|---|
| BE (Backend) | 28 | 0 | 28 | 0% |
| FE (Frontend) | 40 | 0 | 40 | 0% |
| DO (DevOps) | 4 | 0 | 4 | 0% |
| TS (Testing) | 7 | 0 | 7 | 0% |
| CH (Chore) | 4 | 0 | 4 | 0% |
| **Total** | **83** | **0** | **83** | **0%** |

### Task completion by priority

| Priority | Total | Done | Remaining | % |
|---|---|---|---|---|
| P0 (Must) | 52 | 0 | 52 | 0% |
| P1 (Should) | 28 | 0 | 28 | 0% |
| P2 (Nice) | 3 | 0 | 3 | 0% |

### Daily velocity

| Day | Tasks Planned | Tasks Done | Delta | Running Total |
|---|---|---|---|---|
| 1 | 13 | 0 | — | 0 / 83 |
| 2 | 3 | 0 | — | 0 / 83 |
| 3 | 4 | 0 | — | 0 / 83 |
| 4 | 11 | 0 | — | 0 / 83 |
| 5 | 7 | 0 | — | 0 / 83 |
| 6 | 5 | 0 | — | 0 / 83 |
| 7 | 8 | 0 | — | 0 / 83 |
| 8 | 8 | 0 | — | 0 / 83 |
| 9 | 5 | 0 | — | 0 / 83 |
| 10 | 4 | 0 | — | 0 / 83 |
| 11 | 6 | 0 | — | 0 / 83 |
| 12 | 8 | 0 | — | 0 / 83 |
| 13 | 4 | 0 | — | 0 / 83 |

### Milestones completed

```
  M1 Backend Foundation      [ ] NOT STARTED
  M2 Core Charts             [ ] NOT STARTED
  M3 Technical Indicators    [ ] NOT STARTED
  M4 Analytics Engine        [ ] NOT STARTED
  M5 Fundamentals + Compare  [ ] NOT STARTED
  M6 Polish + Deploy         [ ] NOT STARTED
```

---

*End of TASK_TRACKER.md v1.0*
