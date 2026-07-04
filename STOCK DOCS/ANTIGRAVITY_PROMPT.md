# StockLens — Master Build Prompt for Antigravity
## Complete AI Agent Briefing Document

---

## WHAT YOU ARE BUILDING

You are building **StockLens** — a full-stack stock market analytics dashboard.
This is a data analytics project, not just a chart viewer.
The goal is to surface actionable insights (trend signals, volatility, anomalies)
alongside standard price charts.

**Stack:**
- Backend:  Python 3.11 · FastAPI · SQLite · Pandas · NumPy · httpx
- Frontend: React 18 · TypeScript · Vite · Tailwind CSS · lightweight-charts · recharts · Zustand · React Query
- Data:     Alpha Vantage API (free tier — 25 requests/day hard limit)

**Project name:** StockLens
**Target:** 13 working days · 83 tasks · 6 milestones · 1 production deployment

---

## DOCUMENTS YOU HAVE BEEN GIVEN

You have been provided **8 project documents**. Each has a specific purpose.
Do NOT treat them as optional reading — they are the source of truth for every decision.

| File | Size | Purpose | When to use |
|---|---|---|---|
| `RULES.md` | 178 lines | 67 non-negotiable project constraints | Read FIRST. Refer back before every decision. |
| `PRD.md` | 355 lines | Product goals, features, milestones, non-goals | Read SECOND. Understand what and why before how. |
| `ARCHITECTURE.md` | 1,159 lines | System diagrams, data flow maps, request lifecycle, decision rationale | Read THIRD. Understand how the system works before writing code. |
| `TECH_SPEC.md` | 1,266 lines | Full code contracts — dependencies, patterns, all endpoint specs, error codes | Reference constantly during backend work. |
| `SCHEMA.md` | 1,562 lines | Every data shape — AV raw JSON, Pydantic models, TypeScript interfaces, SQLite DDL, enums, transformation maps | Reference every time you define, receive, or return data. |
| `DESIGN.md` | 1,592 lines | Visual identity, CSS tokens, component specs, wireframes, animation rules | Reference for every frontend component you build. |
| `IMPLEMENTATION_PLAN.md` | 3,370 lines | Step-by-step build guide with complete code for every file in exact creation order | Follow sequentially. This is your primary build guide. |
| `TASK_TRACKER.md` | 1,130 lines | 83 tasks with IDs, dependencies, gate tests, daily logs, bug tracker, git commit log | Use to track progress and verify completion. |

---

## MANDATORY READING ORDER

Before writing a single line of code, read these documents in this exact order.
Reading out of order will cause you to make decisions that conflict with constraints
defined earlier.

```
STEP 1 → Read RULES.md (complete)
         Memorise the 10 Non-Negotiables at the end.
         Do not proceed until you understand every rule category.

STEP 2 → Read PRD.md (complete)
         Understand: what features exist, what is explicitly out of scope,
         who the users are, and what the 6 milestones are.

STEP 3 → Read ARCHITECTURE.md §1–4 (System Topology, Layer Architecture, App Flow, Request Lifecycle)
         Understand how data moves from Alpha Vantage → FastAPI → SQLite → React.
         Memorise the cache decision flow (§5) — it is the most critical flow.

STEP 4 → Read TECH_SPEC.md §3.1–3.6 (Backend dependencies, bootstrap, CORS, DB schema, AV client, cache manager)
         This gives you the exact code patterns before you build M1.

STEP 5 → Read SCHEMA.md §2–5 (Enums, SQLite DDL, AV raw schemas, Pydantic models)
         Understand every data shape before creating any schema file.

STEP 6 → Read IMPLEMENTATION_PLAN.md §3 (Milestone 1 — Backend Foundation, complete)
         This is your step-by-step build guide for M1.

STEP 7 → (After M1 is built and gate-tested)
         Read DESIGN.md §1–7 (Philosophy, colors, typography, spacing, tokens, Tailwind config)
         before touching any frontend code.

STEP 8 → Read IMPLEMENTATION_PLAN.md §4 (Milestone 2 — Core Charts Frontend)
         Begin M2 only after M1 gate passes.

STEP 9 → For each subsequent milestone (M3–M6):
         Read the corresponding IMPLEMENTATION_PLAN.md section
         THEN read the relevant sections of TECH_SPEC / SCHEMA / DESIGN as needed.
         Reference map is provided below.
```

---

## THE 10 NON-NEGOTIABLE RULES

These come from `RULES.md`. Memorise them. Enforce them throughout every phase.
Breaking any of these rules is not a matter of preference — it will break the system.

```
RULE 1  (R-01)  The frontend NEVER calls Alpha Vantage directly.
                Only FastAPI calls AV. Always through the backend.

RULE 2  (R-02)  ALWAYS check SQLite cache before calling Alpha Vantage.
                Use fetch_with_cache() — never _call_av() from a router.

RULE 3  (R-03)  Hard stop at 24 API requests per day — NOT 25.
                The 25th is a race-condition safety buffer.

RULE 4  (R-09)  NEVER commit .env to git. Ever.
                Only .env.example with placeholder values.

RULE 5  (R-21)  ALL numeric values from Alpha Vantage are STRINGS.
                Always cast: float("207.50"), int("58200000").

RULE 6  (R-22)  Alpha Vantage returns "None" as a literal string for missing values.
                Convert it to Python None → JSON null. Every time. No exceptions.

RULE 7  (R-29)  OHLCV data from AV is newest→oldest.
                REVERSE it to oldest→newest before passing to any chart library.

RULE 8  (R-44)  ALL numbers displayed in the UI use JetBrains Mono font.
                Prices, percentages, volumes, RSI, dates, axis ticks — everything.

RULE 9  (R-45)  Color = meaning. Never decorative.
                Green = bull/positive. Red = bear/negative. Amber = active/primary.

RULE 10 (R-57)  Tag v1.0.0 ONLY after the production checklist in TASK_TRACKER §16 is 100% complete.
```

---

## DOCUMENT CROSS-REFERENCE MAP

When you are working on a specific task, consult these documents:

```
TASK TYPE                      → PRIMARY DOC            → SUPPORTING DOCS
─────────────────────────────────────────────────────────────────────────────
Setting up Python project      → IMPLEMENTATION_PLAN §3 → TECH_SPEC §3.1–3.2
Creating SQLite tables         → SCHEMA.md §3           → TECH_SPEC §3.4
Writing Alpha Vantage client   → IMPLEMENTATION_PLAN §3 → SCHEMA.md §4 (raw AV shapes)
                                                         → RULES.md R-21,R-22,R-23
Building cache service         → IMPLEMENTATION_PLAN §3 → TECH_SPEC §3.6
                                                         → ARCHITECTURE.md §5
Building budget service        → IMPLEMENTATION_PLAN §3 → TECH_SPEC §3.10
                                                         → ARCHITECTURE.md §6
Writing a FastAPI route        → TECH_SPEC §5           → SCHEMA.md §5–6
                                                         → RULES.md R-24,R-25,R-26,R-27
Defining a Pydantic model      → SCHEMA.md §5           → SCHEMA.md §2 (enums)
Writing AV normalisation code  → SCHEMA.md §12.1–12.3   → RULES.md R-21,R-22,R-23
Computing indicators (Pandas)  → IMPLEMENTATION_PLAN §5 → TECH_SPEC §3.7
                                                         → ARCHITECTURE.md §7
Computing analytics signals    → IMPLEMENTATION_PLAN §6 → ARCHITECTURE.md §7
Setting up React project       → IMPLEMENTATION_PLAN §4 → DESIGN.md §7 (Tailwind config)
Writing CSS / design tokens    → DESIGN.md §6           → DESIGN.md §3 (colors)
Creating a TypeScript type     → SCHEMA.md §7           → SCHEMA.md §2 (enums)
Building Axios client          → IMPLEMENTATION_PLAN §4 → TECH_SPEC §4.4
Building Zustand store         → IMPLEMENTATION_PLAN §4 → TECH_SPEC §4.7
                                                         → SCHEMA.md §8
Creating a React Query hook    → IMPLEMENTATION_PLAN §4 → SCHEMA.md §9 (cache keys)
                                                         → TECH_SPEC §4.7
Building CandlestickChart      → IMPLEMENTATION_PLAN §4 → DESIGN.md §9.5 (chart config)
                                                         → SCHEMA.md §12.5 (transform map)
Building RSI chart             → IMPLEMENTATION_PLAN §5 → DESIGN.md §9.6
Building MACD chart            → IMPLEMENTATION_PLAN §5 → DESIGN.md §9.7
Building AnalyticsInsights     → IMPLEMENTATION_PLAN §6 → DESIGN.md §9.8
Building FundamentalsPanel     → IMPLEMENTATION_PLAN §7 → DESIGN.md §9.11
Building ComparisonChart       → IMPLEMENTATION_PLAN §7 → DESIGN.md §9.12
Creating a shared component    → DESIGN.md §9.13–9.15   → DESIGN.md §11 (animation)
Deploying to Railway           → IMPLEMENTATION_PLAN §8 → TECH_SPEC §9
Deploying to Vercel            → IMPLEMENTATION_PLAN §8 → TECH_SPEC §9
Handling errors                → TECH_SPEC §8           → SCHEMA.md §13
Naming a cache key             → SCHEMA.md §10          → RULES.md R-42,R-43
Writing a git commit           → TASK_TRACKER §15       → RULES.md R-53
Closing a milestone            → TASK_TRACKER §3–8      → IMPLEMENTATION_PLAN (gate tests)
```

---

## PHASE-BY-PHASE BUILD INSTRUCTIONS

Follow these phases in strict order. Do NOT start a phase until the previous phase's gate test passes.

---

### ═══════════════════════════════════════════════
### PHASE 1 — Backend Foundation  (Days 1–3)
### ═══════════════════════════════════════════════

**Primary guide:**   `IMPLEMENTATION_PLAN.md §3` (read completely before starting)
**Schema reference:** `SCHEMA.md §3` (SQLite DDL), `SCHEMA.md §5` (Pydantic models)
**Tech reference:**   `TECH_SPEC.md §3.1–3.6`
**Rules to enforce:** R-01, R-02, R-03, R-05, R-09, R-21, R-22, R-23, R-24, R-25, R-26, R-27

**What you will build:**
```
backend/
├── venv/                     ← Python virtual environment
├── .env                      ← API key + config (NEVER commit)
├── .env.example              ← Placeholder version (commit this)
├── requirements.txt          ← Exact versions from TECH_SPEC §3.1
├── config.py                 ← Pydantic settings, reads from .env
├── main.py                   ← FastAPI app, CORS, lifespan, error handlers
├── db/database.py            ← init_db(), 3 CREATE TABLE statements + 1 index
├── models/schemas.py         ← All Pydantic models from SCHEMA.md §5
├── services/
│   ├── exceptions.py         ← 6 custom exception classes
│   ├── budget.py             ← Daily request counter, can_make_request(), hard stop at 24
│   ├── cache.py              ← SQLite cache, fetch_with_cache(), key builders
│   └── alpha_vantage.py      ← AV HTTP client, sanitise_symbol(), normalisation, fetch fns
└── routers/
    ├── stock.py              ← GET /{symbol}/price, GET /{symbol}/quote
    ├── indicators.py         ← Placeholder only (implement in Phase 3)
    ├── compare.py            ← Placeholder only (implement in Phase 5)
    └── status.py             ← GET /api/status (budget info)
```

**File creation order** (from IMPLEMENTATION_PLAN.md — follow exactly):
```
1. requirements.txt + pip install
2. .env + .env.example
3. config.py
4. db/database.py  → verify with: python -c "import asyncio; from db.database import init_db; asyncio.run(init_db())"
5. models/schemas.py
6. services/exceptions.py
7. services/budget.py
8. services/cache.py
9. services/alpha_vantage.py
10. routers/stock.py
11. routers/status.py
12. routers/indicators.py (placeholder)
13. routers/compare.py (placeholder)
14. main.py
```

**Critical details to get right:**
- In `alpha_vantage.py`: ALL AV numeric fields arrive as STRINGS. Cast every value. See SCHEMA.md §4.1–4.3 for exact raw AV shapes and field names (they have prefixes like `"1. open"`).
- In `alpha_vantage.py`: Check for `"Note"`, `"Information"`, and `"Error Message"` keys before assuming success. AV returns HTTP 200 even for errors.
- In `alpha_vantage.py`: The `"None"` string from AV OVERVIEW must become Python `None`. Build `_safe_float()` and `_safe_int()` helpers that return `None` for this case.
- In `alpha_vantage.py`: Strip the `%` suffix from `"10. change percent"` before casting.
- In `budget.py`: Hard stop is at `DAILY_REQUEST_HARD_STOP = 24`, not 25.
- In `cache.py`: Build all 5 cache key builder functions (`quote_key`, `price_key`, `indicators_key`, `overview_key`, `compare_key`). Compare keys must sort symbols alphabetically.

**Phase 1 Gate — run ALL of these. All must pass:**
```bash
uvicorn main:app --reload --port 8000

curl http://localhost:8000/health
# → {"status":"ok","version":"1.0.0"}

curl http://localhost:8000/api/status
# → {"date":"YYYY-MM-DD","requests_used":0,"requests_limit":25,...}

curl "http://localhost:8000/api/stock/AAPL/price?period=1Y"
# → OHLCV JSON, "is_cached":false (costs 1 API request)

curl "http://localhost:8000/api/stock/AAPL/price?period=1Y"
# → same data, "is_cached":true (costs 0 API requests)

curl http://localhost:8000/api/status
# → requests_used: 1  (confirm budget incremented exactly once)

curl "http://localhost:8000/api/stock/AAPL\$\$/price"
# → 400 {"error_code":"INVALID_SYMBOL",...}

# Open http://localhost:8000/docs — OpenAPI UI must load and show all routes
```

**Git commit after gate passes:**
```
git add backend/
git commit -m "feat(M1): backend foundation — FastAPI, SQLite cache, budget service, price+quote endpoints"
```

**Update TASK_TRACKER.md:** Mark M1-01 through M1-20 as ✅ DONE.

---

### ═══════════════════════════════════════════════
### PHASE 2 — Core Charts Frontend  (Days 4–6)
### ═══════════════════════════════════════════════

**Primary guide:**   `IMPLEMENTATION_PLAN.md §4` (read completely before starting)
**Design reference:** `DESIGN.md §1–9` (read BEFORE writing any component)
**Schema reference:** `SCHEMA.md §7` (TypeScript interfaces), `SCHEMA.md §8–9` (Zustand + React Query schemas)
**Tech reference:**   `TECH_SPEC.md §4.1–4.8`
**Rules to enforce:** R-29, R-30, R-31, R-32, R-34, R-35, R-36, R-44, R-45, R-52

**Read DESIGN.md §1–3 (philosophy + color system) before writing a single CSS value.**

**What you will build:**
```
frontend/
├── .env + .env.example
├── index.html                ← Google Fonts link (Inter + JetBrains Mono + DM Serif Display)
├── tailwind.config.js        ← FULL config from DESIGN.md §7 (custom colors, fonts, animations, shadows)
├── src/
│   ├── index.css             ← Tailwind directives + @import tokens.css
│   ├── styles/tokens.css     ← Full CSS :root{} block from DESIGN.md §6
│   ├── config.ts             ← Reads VITE_API_BASE_URL
│   ├── types/stock.ts        ← ALL interfaces from SCHEMA.md §7
│   ├── api/client.ts         ← Axios instance, 10s timeout, response interceptor
│   ├── api/stockApi.ts       ← All 9 API methods
│   ├── store/dashboardStore.ts ← Zustand: symbol, period, overlays, compareSymbols
│   ├── hooks/useStockData.ts ← useStockPrice, useStockQuote, useApiStatus
│   ├── utils/formatters.ts   ← formatPrice, formatPercent, formatVolume, formatMarketCap, formatRatio
│   ├── utils/chartHelpers.ts ← toCandlestickData (REVERSES array), toVolumeData
│   ├── components/shared/
│   │   ├── LoadingSkeleton.tsx ← Wave animation skeleton
│   │   ├── ErrorBanner.tsx   ← Error message + retry button
│   │   └── MetricCard.tsx    ← label + value + subvalue
│   ├── components/market/
│   │   └── MarketSummaryBar.tsx ← Live price + glow animation + change + volume
│   ├── components/charts/
│   │   └── CandlestickChart.tsx ← lightweight-charts, volume sub-chart, resize handler
│   ├── main.tsx              ← QueryClient + QueryClientProvider bootstrap
│   └── App.tsx               ← Header + MarketSummaryBar + CandlestickChart layout
```

**Critical details to get right:**
- `tailwind.config.js`: Use the COMPLETE config from DESIGN.md §7. Do not abbreviate it. All custom colors, font families, font sizes, border radii, shadows, and keyframe animations are required.
- `tokens.css`: Copy the COMPLETE `:root {}` block from DESIGN.md §6. Every `--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*`, and `--transition-*` variable must be present.
- `chartHelpers.ts → toCandlestickData()`: This function MUST reverse the array. AV sends newest→oldest. lightweight-charts requires oldest→newest. Wrong order = blank chart, no error message.
- `CandlestickChart.tsx`: Use the EXACT lightweight-charts configuration from DESIGN.md §9.5. Colors, grid, crosshair, price scale, time scale — all specified. The volume sub-chart uses a separate price scale with `scaleMargins: { top: 0.85, bottom: 0 }`.
- `MarketSummaryBar.tsx`: The price number glow is the signature element. It uses CSS `textShadow` + `animation: glowPulse` that is amber for up days and coral for down days. See DESIGN.md §9.2 for exact specs.
- `main.tsx`: QueryClient must set `staleTime` globally to avoid over-fetching. `refetchOnWindowFocus: false` is required.

**Phase 2 Gate — visual checks in browser at http://localhost:5173:**
```
□  Dark background (--color-void: #080B18) fills viewport
□  Header: amber ◈ StockLens logotype visible
□  MarketSummaryBar: price renders in JetBrains Mono at 40px
□  Up day: green glow animates on price. Down day: red/coral glow.
□  Candlestick chart: dark background (#0D1117), green/red candles
□  Volume bars below chart (green=up day, red=down day, 50% opacity)
□  Resizing browser window redraws chart correctly
□  DevTools Network tab: second page load shows is_cached:true (no new API calls)
□  DevTools Console: zero errors
□  DevTools Elements: JetBrains Mono applied to all price/number elements
```

**Git commit after gate passes:**
```
git commit -m "feat(M2): React scaffold, design tokens, candlestick chart, market summary bar"
```

---

### ═══════════════════════════════════════════════
### PHASE 3 — Technical Indicators  (Day 7)
### ═══════════════════════════════════════════════

**Primary guide:**   `IMPLEMENTATION_PLAN.md §5`
**Design reference:** `DESIGN.md §9.6` (RSI chart), `DESIGN.md §9.7` (MACD chart)
**Architecture ref:** `ARCHITECTURE.md §7` (analytics pipeline — indicators section)
**Rules to enforce:** R-02, R-05 (indicators from cache, NOT from AV endpoints)

**What you will build:**
```
backend/
└── services/indicators.py    ← compute_all_indicators() — RSI, MACD, EMA 20/50/200, Bollinger Bands
└── routers/indicators.py     ← GET /{symbol}/indicators (replace placeholder)

frontend/
├── hooks/useIndicators.ts    ← React Query, staleTime: 1hr
├── components/charts/
│   ├── RSIChart.tsx          ← recharts LineChart, 30/70 reference bands, value badge
│   ├── MACDChart.tsx         ← recharts ComposedChart, 2 lines + histogram bars
│   └── IndicatorsPanel.tsx   ← 2-column grid of RSI + MACD
```

**Critical details:**
- `services/indicators.py`: ALL indicators computed from cached OHLCV using Pandas. ZERO Alpha Vantage calls. This is the most important rule for this phase (R-05).
- RSI uses Wilder smoothing: `delta.clip(lower=0).ewm(alpha=1/14, adjust=False).mean()`. NOT simple rolling average.
- MACD is EMA(12) − EMA(26). Signal is EMA(9) of MACD. Histogram is MACD − Signal.
- Bollinger Bands: SMA(20) ± 2×std(20). Middle band = SMA(20).
- EMA uses `adjust=False` in pandas `.ewm()`. This matches standard financial calculation.
- `RSIChart.tsx`: Reference lines at 30 (green, dashed) and 70 (red, dashed). Value badge color: red if >70, green if <30, secondary if neutral. See DESIGN.md §9.6.
- `MACDChart.tsx`: Histogram bars should be bull color for positive, bear color for negative. See DESIGN.md §9.7.

**Phase 3 Gate:**
```bash
curl http://localhost:8000/api/stock/AAPL/indicators
# → JSON with rsi[], macd[], ema[], bollinger[] arrays

# Check budget did NOT increase (indicators use zero API calls)
curl http://localhost:8000/api/status
# → same requests_used as after Phase 1

# Visual:
□  RSI chart visible below candlestick, amber line
□  70 and 30 reference lines visible (dashed)
□  MACD chart alongside RSI, histogram bars green/red
□  Both charts in 2-column grid
```

**Git commit:**
```
git commit -m "feat(M3): Pandas indicator engine, RSI chart, MACD chart — zero extra API calls"
```

---

### ═══════════════════════════════════════════════
### PHASE 4 — Analytics Engine  (Days 8–9)
### ═══════════════════════════════════════════════

**Primary guide:**   `IMPLEMENTATION_PLAN.md §6`
**Design reference:** `DESIGN.md §9.8` (AnalyticsInsights panel — the most important component)
**Architecture ref:** `ARCHITECTURE.md §7` (full analytics pipeline diagram)
**Schema reference:** `SCHEMA.md §5.7` (AnalyticsSignals Pydantic model), `SCHEMA.md §6.4` (signals JSON)
**Rules to enforce:** R-05, R-06, R-16, R-18

**What you will build:**
```
backend/
└── services/analytics.py     ← compute_signals(), compute_drawdown(),
                                 compute_return_distribution(), compute_normalised_comparison()
└── routers/indicators.py     ← Add: GET /{symbol}/signals
                                      GET /{symbol}/drawdown
                                      GET /{symbol}/distribution

frontend/
├── hooks/useSignals.ts
├── components/analytics/
│   ├── SignalBadge.tsx        ← 9 variants: bullish/bearish/neutral/overbought/oversold/high/low/medium/squeeze
│   └── AnalyticsInsights.tsx ← 5 signal cards + RSI gradient track + volume bar + italic summary
├── components/charts/
│   ├── DrawdownChart.tsx      ← recharts AreaChart, red fill, values ≤ 0
│   └── DistributionChart.tsx  ← recharts BarChart, bull=green bars right of 0, bear=red bars left
```

**Critical details:**
- `compute_signals()`: Input is OHLCV records newest→oldest from AV. Sort to oldest→newest INSIDE the function for Pandas computation.
- EMA crossover detection: Compare sign of `(ema50 − ema200)` at the LAST two rows (`iloc[-1]` and `iloc[-2]`). Golden cross = negative yesterday, positive today. Death cross = opposite.
- RSI in analytics uses `ewm(alpha=1/14, adjust=False)` — same Wilder smoothing as indicators.py.
- Volatility = 20-day rolling std of daily returns × √252 × 100 (annualised, as percentage).
- Bollinger squeeze = `bb_width.rank(pct=True).iloc[-1] < 0.20` where `bb_width = (std20 × 4) / sma20`.
- `compute_normalised_comparison()`: Divide ALL series by `combined.iloc[0]` then multiply by 100. This ensures ALL tickers start at exactly 100.0 on the base date.
- `AnalyticsInsights.tsx`: This is the dashboard's signature analytics component. Follow DESIGN.md §9.8 exactly. 5 signal cards, staggered entrance animation (`animation-delay: N*60ms`), RSI gradient track (green→amber→red), italic serif summary paragraph.
- `SignalBadge.tsx`: All 9 variants from DESIGN.md §9.10. Every badge pairs icon + text (never color alone — Rule R-46).
- `drawdown` values are ALWAYS ≤ 0. If any value is positive, there is a bug.

**Phase 4 Gate:**
```bash
curl http://localhost:8000/api/stock/AAPL/signals
# → {trend_signal, crossover_type, rsi_state, rsi_value (0-100), volatility_level, volatility_value, volume_anomaly, bollinger_squeeze, summary}

curl "http://localhost:8000/api/stock/AAPL/drawdown?period=1Y"
# → data[] where every drawdown value is ≤ 0.0

# Visual:
□  Analytics sidebar shows 5 signal cards with correct colors
□  RSI gradient track renders with movable marker
□  Volume shows ×ratio value, amber if ≥ 2.0
□  Summary renders in DM Serif Display italic
□  Changing symbol updates ALL 5 cards
□  Cards animate in with stagger (not all at once)
□  App.tsx updated to 2-column layout: main content + 320px sidebar
```

**Git commit:**
```
git commit -m "feat(M4): analytics engine, signals endpoint, AnalyticsInsights sidebar, drawdown + distribution charts"
```

---

### ═══════════════════════════════════════════════
### PHASE 5 — Fundamentals & Comparison  (Days 10–11)
### ═══════════════════════════════════════════════

**Primary guide:**   `IMPLEMENTATION_PLAN.md §7`
**Design reference:** `DESIGN.md §9.11` (FundamentalsPanel), `DESIGN.md §9.12` (ComparisonChart)
**Schema reference:** `SCHEMA.md §5.8` (CompanyOverview), `SCHEMA.md §5.9` (ComparisonResponse), `SCHEMA.md §6.5` (overview JSON), `SCHEMA.md §6.8` (compare JSON)
**Rules to enforce:** R-20 (comparison fails loudly if symbol not cached), R-22 (AV "None" → null)

**What you will build:**
```
backend/
├── routers/stock.py          ← Add: GET /{symbol}/overview
└── routers/compare.py        ← Replace placeholder: GET /compare?symbols=AAPL,MSFT&period=1Y

frontend/
├── components/market/
│   └── FundamentalsPanel.tsx ← 8-row table (P/E, ForwardPE, EPS, Revenue, Margin, Div, Beta, Target)
├── components/charts/
│   └── ComparisonChart.tsx   ← recharts LineChart, 5 color slots, normalised to 100, returns legend
└── components/controls/
    └── CompareInput.tsx      ← Text input + Add button + removable symbol chips
```

**Critical details:**
- Overview endpoint: Uses `fetch_overview()` via `fetch_with_cache()`. TTL = 86400s (24hr). Costs 1 API call per new symbol.
- Compare endpoint: Validates max 5 symbols, checks `get_stale(price_key(sym))` for EACH symbol before computing. If ANY symbol has no cached OHLCV, return 404 — not a partial result (Rule R-20).
- `ComparisonChart.tsx`: The 5 color tokens for series are `--color-chart-1` through `--color-chart-5` from DESIGN.md §3.2. Reference line at y=100 (dashed, dark).
- Total returns: `normalised_value.iloc[-1] − 100`. Display as `+12.4%` or `−3.1%` in bull/bear color.
- `FundamentalsPanel.tsx`: Null values (`null` in JSON) display as `"—"`. Use `formatMarketCap()`, `formatRatio()` utilities. See DESIGN.md §9.11 for exact row styling.
- Before testing compare: You MUST fetch price data for each symbol FIRST. The compare endpoint requires cached OHLCV for all requested symbols.

**Phase 5 Gate:**
```bash
# Fetch MSFT price first (required for compare)
curl "http://localhost:8000/api/stock/MSFT/price?period=1Y"

curl http://localhost:8000/api/stock/AAPL/overview
# → JSON with pe_ratio as number (not "None" string)

curl "http://localhost:8000/api/stocks/compare?symbols=AAPL,MSFT&period=1Y"
# → base_date with both values = 100.0 exactly

# Visual:
□  FundamentalsPanel: 8 rows, null values show "—"
□  Analyst target row shows upside/downside % badge
□  ComparisonChart: 2 colored lines normalised to 100
□  Reference line at 100 visible (dashed)
□  Total returns legend: green for positive, red for negative
□  CompareInput: add symbol chip + × to remove
□  Removing a symbol removes the line from chart
```

**Git commit:**
```
git commit -m "feat(M5): company overview, fundamentals panel, comparison chart with normalised returns"
```

---

### ═══════════════════════════════════════════════
### PHASE 6 — Polish & Deployment  (Days 12–13)
### ═══════════════════════════════════════════════

**Primary guide:**   `IMPLEMENTATION_PLAN.md §8`
**Design reference:** `DESIGN.md §9.1` (Header), `DESIGN.md §9.3` (Period tabs), `DESIGN.md §9.4` (Overlay chips), `DESIGN.md §9.9` (Budget badge), `DESIGN.md §9.14` (Error banner)
**Tech reference:**   `TECH_SPEC.md §9` (deployment)
**Rules to enforce:** R-11 (specific CORS origin, not *), R-44, R-45, R-52, R-64, R-65, R-66

**What you will build:**
```
frontend/
├── components/controls/
│   ├── SymbolSearch.tsx      ← Pill input, amber focus ring, uppercase enforcement, clear after submit
│   ├── PeriodSelector.tsx    ← 5 pill tabs, amber active state
│   └── OverlayToggles.tsx    ← EMA20/50/200 + BB chips with colored indicator dots
├── components/shared/
│   └── BudgetBadge.tsx       ← 3 states: normal/warning/critical (see DESIGN.md §9.9)
├── components/layout/
│   ├── Header.tsx            ← Logotype + SymbolSearch + BudgetBadge
│   └── DashboardLayout.tsx   ← Full 2-col layout shell
└── App.tsx                   ← Final assembly of ALL components

backend/
└── Procfile                  ← "web: uvicorn main:app --host 0.0.0.0 --port $PORT"
```

**Wiring EMA overlays to the candlestick chart:**
- `OverlayToggles.tsx` writes to Zustand `overlays` state.
- `CandlestickChart.tsx` reads Zustand `overlays` and conditionally adds/removes EMA line series.
- EMA data comes from `useIndicators()` hook (already built in Phase 3).
- EMA 20 → amber (#F5A623), dashed. EMA 50 → ice blue (#64B5F6), solid. EMA 200 → purple (#A78BFA), sparse dotted.

**Deployment — Railway (backend):**
```
1. Push to GitHub
2. Railway → New Project → Deploy from GitHub → root: backend/
3. Set env vars in Railway:
   ALPHA_VANTAGE_API_KEY = your_key
   ALLOWED_ORIGINS       = https://PLACEHOLDER (update after Vercel deploy)
   ENVIRONMENT           = production
4. Copy Railway URL (e.g. https://stocklens-api.railway.app)
```

**Deployment — Vercel (frontend):**
```
1. Vercel → New Project → Import from GitHub → root: frontend/
2. Framework preset: Vite
3. Set env var: VITE_API_BASE_URL = https://stocklens-api.railway.app
4. Deploy → copy Vercel URL (e.g. https://stocklens.vercel.app)
5. Go back to Railway → update ALLOWED_ORIGINS = https://stocklens.vercel.app
6. Redeploy Railway (CORS is read at startup — must redeploy to take effect)
```

**Phase 6 Gate — ALL must pass:**
```
CONTROLS:
□  SymbolSearch: type "TSLA" + Enter → all charts and signals update
□  PeriodSelector: clicking each period changes chart range
□  OverlayToggles: toggling EMA shows/hides lines on candlestick chart
□  BudgetBadge: shows count, turns yellow at 20+, red + "CACHE ONLY" at 24

PRODUCTION:
□  curl https://your-backend.railway.app/health → {"status":"ok"}
□  Browser: https://your-app.vercel.app → dashboard loads, no CORS errors
□  DevTools Network: requests go to railway.app, NOT localhost
□  No console errors in production

PRODUCTION READINESS CHECKLIST (TASK_TRACKER §16):
□  Complete ALL 35 items in the checklist before tagging
```

**Final git commands:**
```bash
git commit -m "feat(M6): header, symbol search, period tabs, overlay toggles, budget badge, final layout"
git commit -m "chore(M6): Procfile, Railway + Vercel deployment — production live"
git tag -a v1.0.0 -m "StockLens v1.0.0 — initial production release"
git push origin main --tags
```

---

## COMMON MISTAKES — DO NOT MAKE THESE

These are the most frequent failure points in this specific stack.
Each one has caused real project failures. Avoid them all.

```
MISTAKE 1: Calling AV from the frontend
           Impact:  API key exposed in browser. Budget unprotected. No caching.
           Fix:     Re-read RULES.md R-01. All AV calls go through FastAPI only.

MISTAKE 2: Not checking cache before calling AV
           Impact:  Wastes 1 of 25 daily requests every time.
           Fix:     Use fetch_with_cache() exclusively. Never call _call_av() from a router.

MISTAKE 3: Forgetting to cast AV string values to numbers
           Impact:  Silent calculation errors. "207.50" + 1 = "207.501" in Python.
           Fix:     float(), int() on EVERY value from AV. No exceptions. See SCHEMA.md §4.

MISTAKE 4: Storing AV "None" string as-is
           Impact:  JSON returns "None" instead of null. TypeScript breaks silently.
           Fix:     Use _safe_float(), _safe_int() helpers that return Python None for "None".

MISTAKE 5: Not reversing OHLCV array before charting
           Impact:  Blank candlestick chart with no error message. Very hard to debug.
           Fix:     toCandlestickData() MUST call [...data].reverse() first.

MISTAKE 6: Hardcoding colors instead of using CSS tokens
           Impact:  Design system breaks. Theme changes require hunting through components.
           Fix:     Always var(--color-*). Never #hexcode directly in component styles.

MISTAKE 7: Testing compare without fetching symbol prices first
           Impact:  404 "No cached data for MSFT". Confusing if you forget this dependency.
           Fix:     Always fetch /price for each symbol before testing /compare.

MISTAKE 8: Setting ALLOWED_ORIGINS=* in production
           Impact:  Any website can call your backend and drain your API budget.
           Fix:     Set exact Vercel URL. Redeploy Railway after updating the env var.

MISTAKE 9: Forgetting to redeploy Railway after updating ALLOWED_ORIGINS
           Impact:  CORS errors in production despite correct env var.
           Fix:     CORS is read at startup. Change env var → Redeploy → Test.

MISTAKE 10: Using multiple Uvicorn workers in development
            Impact:  SQLite "database is locked" errors from concurrent writes.
            Fix:     Use --workers 1 in development (Railway uses 1 worker by default).
```

---

## TASK TRACKING INSTRUCTIONS

After completing each task, update `TASK_TRACKER.md`:

```
1. Find the task row by its Task ID (e.g., M1-07)
2. Change status from 🔲 TODO to ✅ DONE
3. Add completion date if the column is present
4. Fill in the Daily Stand-Up Log for today (§13)
5. Log any bugs found in Bug Tracker (§14)
6. Log any decisions made in Decision Log (§11)
7. Update API budget tracker (§12) with today's AV call count
8. After each milestone gate passes, update the Progress Dashboard (§1)
9. Add each git commit to the Git Commit Log (§15)
```

---

## FINAL VERIFICATION BEFORE SHIPPING

Before tagging v1.0.0, complete EVERY item in `TASK_TRACKER.md §16` (Production Readiness Checklist).
That checklist has 35 items across 5 categories: Security, Backend, Frontend, Performance, Deployment.

All 35 items must be ✅ checked.
All 6 milestone gates must have passed.
Both production URLs must be live and responding.

Only then: `git tag -a v1.0.0`

---

## QUICK-ACCESS REFERENCE CARD

Print or keep this visible while building.

```
┌──────────────────────────────────────────────────────────────────────┐
│                    STOCKLENS QUICK REFERENCE                         │
├──────────────────────────────────────────────────────────────────────┤
│  AV LIMIT:       25 req/day │ Hard stop: 24 │ Warning: 20           │
│  CACHE TTL:      OHLCV/Overview/Indicators = 24h │ Quote = 1h       │
│  MAX SYMBOLS:    5 in comparison                                     │
├──────────────────────────────────────────────────────────────────────┤
│  PORTS:          Backend: 8000 │ Frontend: 5173                     │
│  DB FILE:        backend/db/stock_cache.db (auto-created, gitignore) │
├──────────────────────────────────────────────────────────────────────┤
│  COLORS:         Bull: #4ADE80 │ Bear: #FF6B6B │ Amber: #F5A623     │
│                  Surface: #0D1117 │ Void: #080B18 │ Panel: #131A2A  │
│  FONTS:          Numbers: JetBrains Mono │ UI: Inter                │
│                  Display: DM Serif Display (empty states only)       │
├──────────────────────────────────────────────────────────────────────┤
│  CACHE KEYS:     GLOBAL_QUOTE:AAPL                                   │
│                  TIME_SERIES_DAILY:AAPL                              │
│                  INDICATORS:AAPL                                     │
│                  OVERVIEW:AAPL                                       │
│                  COMPARE:AAPL_MSFT:1Y  ← sorted alphabetically      │
├──────────────────────────────────────────────────────────────────────┤
│  AV QUIRKS:      All values are strings │ "None" → null             │
│                  "10. change percent" has "%" suffix → strip it      │
│                  HTTP 200 even on errors → check "Error Message" key │
│                  Data is newest→oldest → REVERSE before charting    │
├──────────────────────────────────────────────────────────────────────┤
│  DOCUMENT WHEN TO USE:                                               │
│  RULES.md        Before every decision                               │
│  SCHEMA.md       Every time you define, receive, or return data      │
│  DESIGN.md       Before every component you build                    │
│  IMPL PLAN       The step-by-step guide — follow sequentially        │
│  TASK_TRACKER    Update after every task and every commit            │
└──────────────────────────────────────────────────────────────────────┘
```

---

*This is the complete briefing for building StockLens.*
*Follow the phases in order. Pass each gate before proceeding.*
*When in doubt, check RULES.md first. Then ARCHITECTURE.md. Then IMPLEMENTATION_PLAN.md.*
*Build in the file order specified in IMPLEMENTATION_PLAN.md — the order matters.*
