# Project Rules
## StockLens — Stock Market Analytics Dashboard

| Field | Details |
|---|---|
| **Document Type** | Project Rules & Constraints |
| **Project** | StockLens |
| **Version** | v1.0 |
| **Status** | Non-negotiable |
| **Author** | — |
| **Created** | June 2026 |

> These rules exist because every constraint in StockLens exists for a reason.
> Breaking any rule below risks wasted API budget, broken data,
> security leaks, or a dashboard that lies to its user.
> **When in doubt — check this file first.**

---

## 🔴 Rule Category 1 — Alpha Vantage API Budget

These are the highest-priority rules in the project. Breaking them burns irreplaceable daily quota.

| # | Rule | Why |
|---|---|---|
| R-01 | **NEVER call Alpha Vantage directly from the frontend.** All API calls go through FastAPI only. | Exposes the API key. No caching. Destroys budget. |
| R-02 | **ALWAYS check SQLite cache before calling Alpha Vantage.** Every fetch function must call `fetch_with_cache()`, not `_call_av()` directly. | One missed cache check costs 1 of 25 daily requests. |
| R-03 | **HARD STOP at 24 requests per day — not 25.** The 25th is a safety buffer for race conditions. | SQLite budget checks are not atomic. Two concurrent requests can both pass at count=24. |
| R-04 | **NEVER reset the budget counter manually during development.** Let it reset at midnight UTC. | Manual resets mask real budget pressure and break the daily tracker. |
| R-05 | **Indicators (RSI, MACD, EMA, Bollinger) MUST be computed from cached OHLCV using Pandas.** Do not call AV indicator endpoints. | Each AV indicator endpoint costs 1 request. Computing from OHLCV costs 0. |
| R-06 | **Drawdown, return distribution, and comparison normalisation MUST be computed server-side from cache.** Never call AV for these. | These are pure math on cached data. No API call is ever justified. |
| R-07 | **When budget is exhausted, return stale cache with a warning header — never return an error alone.** | A stale chart is better than a broken dashboard. User experience must degrade gracefully. |
| R-08 | **Fetch OHLCV once per symbol per day. All other features derive from that single fetch.** | OHLCV is the root dataset. Every other endpoint is a computation on top of it. |

---

## 🔴 Rule Category 2 — Security

| # | Rule | Why |
|---|---|---|
| R-09 | **NEVER commit `.env` to git.** Only commit `.env.example` with placeholder values. | A committed API key is a compromised key. AV free keys are limited and non-rotatable trivially. |
| R-10 | **The Alpha Vantage API key MUST only exist in `backend/.env` and Railway env vars.** Nowhere else. | Frontend bundles are public. Any key in `frontend/` is exposed to all users. |
| R-11 | **CORS `ALLOWED_ORIGINS` MUST be a specific URL — never `*`.** | Wildcard CORS allows any website to call your backend and drain your API budget. |
| R-12 | **ALL symbol inputs MUST be sanitised before use.** Use `sanitise_symbol()` on every route that accepts a symbol path parameter. | Unsanitised input can cause unexpected AV calls, SQLite injection, or downstream errors. |
| R-13 | **NEVER expose raw stack traces in API error responses.** Return only `detail`, `error_code`, and `is_cached`. | Stack traces reveal file paths, package versions, and internal logic. |
| R-14 | **`db/stock_cache.db` MUST be in `.gitignore`.** | The database may contain cached financial data and internal keys. It is not source code. |

---

## 🟠 Rule Category 3 — Architecture & Data Flow

| # | Rule | Why |
|---|---|---|
| R-15 | **Data flows in one direction: Alpha Vantage → FastAPI → SQLite → React. No shortcuts.** | Bypassing any layer breaks caching, error handling, or type safety. |
| R-16 | **The frontend MUST NEVER import Pandas, NumPy, or any analytics library.** All computation is server-side. | Signal computation on the frontend is untestable, duplicated, and ships unnecessary bundle weight. |
| R-17 | **Each layer communicates only with the layer directly adjacent to it.** Routers call services. Services call cache or AV. Never cross layers. | Cross-layer calls create circular dependencies and untestable code. |
| R-18 | **Analytics signals MUST be computed from the cached OHLCV record list — not from a live API call.** | The analytics engine is pure computation. It must never trigger a budget deduction. |
| R-19 | **The `api_cache` table is the single source of truth for all fetched data.** If it is not in SQLite, it has not been fetched. | Dual data sources (memory + disk) cause subtle inconsistencies between restarts. |
| R-20 | **Comparison normalisation MUST fail loudly if any symbol has no cached OHLCV.** Return `404`, not a partial result. | Silently dropping a symbol from a comparison is a data lie. The user asked for N stocks; show N or show an error. |

---

## 🟠 Rule Category 4 — Backend Code Rules

| # | Rule | Why |
|---|---|---|
| R-21 | **ALL numeric values from Alpha Vantage MUST be explicitly cast.** They arrive as strings. Never assume. | `"207.50"` is a string. `float("207.50")` is a number. Mixing them causes silent calculation errors. |
| R-22 | **The string `"None"` from AV overview MUST be converted to Python `None` before storage.** Never store the literal string. | `"None"` as a string leaks into JSON as `"None"` instead of `null`. TypeScript cannot handle this correctly. |
| R-23 | **The `change_percent` field from AV MUST have `%` stripped before casting.** | `float("−0.67%")` raises `ValueError`. This has broken many AV integrations. |
| R-24 | **ALL FastAPI routes MUST call `sanitise_symbol()` as the first line.** No exceptions. | Unsanitised symbols can produce malformed cache keys, unexpected AV calls, or security issues. |
| R-25 | **Every service function that calls AV MUST have a stale-cache fallback.** If AV fails and stale data exists, return it. | Availability > freshness. A cached price from yesterday is better than an error page. |
| R-26 | **`fetch_with_cache()` is the ONLY permitted entry point to AV calls.** `_call_av()` is internal and MUST NOT be called from routers directly. | Bypassing the cache layer wastes budget. The abstraction exists to prevent this. |
| R-27 | **Pydantic models MUST be used for all API response serialisation.** No raw `dict` returns from routes. | Pydantic validates, documents (OpenAPI), and type-checks. Raw dicts do none of these. |
| R-28 | **All OHLCV `data[]` arrays MUST be returned newest → oldest** (as received from AV). The frontend is responsible for reversal. | Reversing in the backend would require knowing the consumer's use case. Different consumers may need different orders. |

---

## 🟠 Rule Category 5 — Frontend Code Rules

| # | Rule | Why |
|---|---|---|
| R-29 | **OHLCV data MUST be reversed to ascending order before passing to any chart library.** Use `toCandlestickData()` which handles this. | `lightweight-charts` requires ascending dates. Wrong order = blank chart with no error. |
| R-30 | **ALL API calls MUST go through `stockApi.ts`.** No component may call `apiClient` directly. | Direct calls bypass the typed interface and make the codebase unsearchable for "which component calls what". |
| R-31 | **Server state (fetched data) MUST be managed by React Query. UI state (symbol, period, overlays) MUST be managed by Zustand.** Never mix them. | Mixing state systems creates re-render bugs, stale data, and untestable logic. |
| R-32 | **`staleTime` on ALL React Query hooks MUST be at minimum 1 hour.** | Shorter stale times trigger re-fetches that propagate to FastAPI and potentially to AV. |
| R-33 | **`compareSymbols` in Zustand MUST enforce a maximum of 5 items.** Use `Set` to prevent duplicates. | The backend rejects > 5 symbols. The frontend must enforce this constraint proactively. |
| R-34 | **`activeSymbol` MUST be stored and passed as uppercase always.** `setSymbol()` calls `.toUpperCase()`. | AV symbols are case-sensitive in some edge cases. Inconsistent casing creates duplicate cache entries. |
| R-35 | **ALL components MUST handle `isLoading`, `isError`, and `data` states.** A component that renders nothing on load or silently fails is unacceptable. | Users must always know what the dashboard is doing. Loading = skeleton. Error = banner with retry. |
| R-36 | **NEVER use `localStorage` or `sessionStorage`.** All state is in-memory (Zustand) or server-side (SQLite). | Browser storage is not available in the artifact environment and creates cross-session contamination. |

---

## 🟡 Rule Category 6 — Data & Schema Rules

| # | Rule | Why |
|---|---|---|
| R-37 | **ALL field names MUST use `snake_case` across Python, JSON responses, and TypeScript.** No `camelCase` conversion. | Consistent naming makes the data traceable across layers without translation. `change_percent` is always `change_percent`. |
| R-38 | **`symbol` MUST always be uppercase and validated against `[A-Z0-9.\-]{1,10}`.** No exceptions at any layer. | AV is case-sensitive. Lowercase `aapl` may return different data or errors on some endpoints. |
| R-39 | **`date` fields MUST always be `"YYYY-MM-DD"` strings.** Never Unix timestamps in API responses. | Timestamps are timezone-ambiguous. `lightweight-charts` and `recharts` both accept ISO date strings directly. |
| R-40 | **`drawdown` values MUST always be ≤ 0.0.** If a computed drawdown is positive, there is a bug in `compute_drawdown()`. | Drawdown is a peak-to-trough measure. A positive drawdown is mathematically impossible. |
| R-41 | **`rsi_value` MUST always be in range 0.0 – 100.0.** Validate in the Pydantic model. | An RSI outside 0–100 means the computation failed. Displaying it would mislead the user. |
| R-42 | **SQLite cache keys MUST follow the convention `{FUNCTION}:{SYMBOL}[:{PARAMS}]` in uppercase.** No spaces, slashes, or quotes. | Consistent keys allow predictable lookup, debugging, and cache invalidation. |
| R-43 | **Comparison cache keys MUST sort symbols alphabetically before joining.** `COMPARE:AAPL_MSFT` and `COMPARE:MSFT_AAPL` must resolve to the same key. | Order-independent keys prevent duplicate cache entries for identical comparison requests. |

---

## 🟡 Rule Category 7 — Design & UI Rules

| # | Rule | Why |
|---|---|---|
| R-44 | **ALL numbers displayed in the UI MUST use `JetBrains Mono`.** Prices, percentages, volumes, RSI values, dates, axis ticks — everything numeric. | Proportional fonts cause number columns to shift width as values change. Mono keeps alignment stable. |
| R-45 | **Color MUST carry meaning. It is NEVER decorative.** Green = positive/bull. Red = negative/bear. Amber = active/primary. Blue = neutral/info. | A dashboard where colors are aesthetic choices trains users to ignore them. Every color must be a data signal. |
| R-46 | **Signal badges MUST pair color + icon + text label.** Never color alone or text alone. | Color-blind users cannot distinguish green from red. Icon + text make signals universally readable. |
| R-47 | **`--color-text-muted` (#4A5568) MUST NEVER be used for important information.** Only timestamps, footnotes, disabled states. | Muted text fails WCAG AA contrast for body copy. Critical data must meet contrast minimums. |
| R-48 | **`DM Serif Display` MUST appear at most once per screen.** Reserved for empty-state headlines only. | Overusing display type destroys its visual impact. One instance = emphasis. Many instances = noise. |
| R-49 | **The candlestick chart background MUST be `#0D1117` (`--color-chart-bg`).** Not `--color-void`. Not `--color-surface`. | Charts need their own background layer distinct from cards. Using the wrong token breaks the visual depth hierarchy. |
| R-50 | **Loading states MUST use the skeleton wave animation — not spinners, not blank space.** | Skeleton loaders preserve layout during fetch. Blank space causes layout shift. Spinners give no spatial context. |
| R-51 | **The price glow animation MUST be amber for up days and coral for down days.** It MUST stop if the day's change is exactly 0. | The glow is a data signal (sentiment direction), not decoration. A flat day has no sentiment. |
| R-52 | **ALL CSS values MUST use design tokens (`var(--color-*)`, `var(--space-*)`) — never hardcoded hex or pixel values.** | Hardcoded values break theming and make the design system meaningless. One token change should update all instances. |

---

## 🟡 Rule Category 8 — Git & Version Control

| # | Rule | Why |
|---|---|---|
| R-53 | **ALL commits MUST follow the convention: `type(scope): description`.** E.g. `feat(M3): RSI chart with 30/70 bands`. | Conventional commits make the git log readable as a project diary. |
| R-54 | **NEVER commit directly to `main`.** Use feature branches (`feature/M1-...`) and merge when the milestone gate passes. | Direct commits to main skip the gate verification step. Broken code on main blocks everyone. |
| R-55 | **NEVER commit `.env`, `stock_cache.db`, `node_modules/`, or `venv/`.** These are in `.gitignore` and must stay there. | Committed secrets are permanent — git history is public. Committed binaries bloat the repo. |
| R-56 | **Milestone gates MUST be verified before merging to `main`.** The gate test is not optional. | Skipping gates means shipping unverified code. Each gate is the minimum proof the milestone works. |
| R-57 | **`v1.0.0` MUST be tagged only after the M6 gate passes and the production readiness checklist (TASK_TRACKER §16) is fully ✅.** | A version tag is a public contract. Tagging before production validation is premature. |

---

## 🟡 Rule Category 9 — Testing Rules

| # | Rule | Why |
|---|---|---|
| R-58 | **Every new backend service function MUST have at least one test in `backend/tests/`.** | Untested services will break silently. Cache logic and analytics math are especially subtle. |
| R-59 | **The budget counter MUST be tested with a mocked count of 23 and 24 to verify hard stop behaviour.** | The hard stop at 24 is the most critical business rule. If it fails, you will exceed the AV limit. |
| R-60 | **`compute_signals()` MUST be tested with known input → expected output.** At minimum: test a bullish dataset, a bearish dataset, and an insufficient-data dataset. | Signal computation is pure math. Pure math is the easiest thing to unit test. If you don't test it, you don't know it's right. |
| R-61 | **The `toCandlestickData()` array reversal MUST be verified in a test.** | This transformation is silent — wrong order produces a blank chart with no error message. It must be caught in tests, not in the browser. |
| R-62 | **All gate tests from IMPLEMENTATION_PLAN.md MUST be run manually before closing a milestone.** | Gate tests are the integration proof that backend + frontend + cache work together. Unit tests alone are insufficient. |

---

## 🟡 Rule Category 10 — Performance & Deployment Rules

| # | Rule | Why |
|---|---|---|
| R-63 | **The backend MUST run with `--workers 1` during development.** | Multiple workers create SQLite `database is locked` errors because aiosqlite connections are not shared across processes. |
| R-64 | **`ENVIRONMENT=production` MUST be set in Railway env vars.** NEVER set it to `development` in production. | Development mode enables debug tracebacks in API responses — a security issue. |
| R-65 | **The Vercel `VITE_API_BASE_URL` MUST point to the Railway URL — not `localhost`.** | Hardcoding localhost in production means every user's frontend calls their own machine. |
| R-66 | **After deploying to Railway, Railway MUST be redeployed after updating `ALLOWED_ORIGINS` with the Vercel URL.** | CORS is evaluated at startup. Changing the env var without redeploying has no effect. |
| R-67 | **The production SQLite database MUST NOT be seeded manually.** It builds from real fetches. | Manually seeded data will be stale, non-canonical, and inconsistent with production API responses. |

---

## Summary — The 10 Absolute Non-Negotiables

If you only remember ten rules, make it these:

```
1.  (R-01)  Frontend NEVER calls Alpha Vantage. Only FastAPI does.
2.  (R-02)  Cache ALWAYS checked before any AV call. No exceptions.
3.  (R-03)  Hard stop at 24 requests per day. Not 25. Not 26.
4.  (R-09)  .env NEVER committed to git. EVER.
5.  (R-21)  All AV numeric values are strings. Always cast explicitly.
6.  (R-22)  AV's "None" string → Python None → JSON null. Every time.
7.  (R-29)  OHLCV array MUST be reversed before charting. Newest→Oldest from AV. Oldest→Newest for charts.
8.  (R-44)  All numbers in the UI use JetBrains Mono. No exceptions.
9.  (R-45)  Color = meaning. Green = bull. Red = bear. Amber = active. Never decorative.
10. (R-57)  v1.0.0 tag only after production checklist is 100% ✅.
```

---

*End of RULES.md v1.0*
