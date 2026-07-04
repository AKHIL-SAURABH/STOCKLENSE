# Implementation Plan
## StockLens — Stock Market Analytics Dashboard

| Field | Details |
|---|---|
| **Document Type** | Implementation Plan |
| **Project** | StockLens |
| **Version** | v1.0 |
| **Status** | Draft |
| **Author** | — |
| **Created** | June 2026 |
| **Stack** | FastAPI (Python 3.11+) · React (TypeScript) · SQLite · Alpha Vantage API |
| **Total estimated time** | 12–15 working days |
| **References** | PRD v1.0 · TECH_SPEC v1.0 · ARCHITECTURE v1.0 · SCHEMA v1.0 · DESIGN v1.0 |

---

## How to use this document

Follow the milestones **in order**. Each milestone ends with a
**Checkpoint** — a set of manual verifications you must pass before
moving to the next milestone. Never skip a checkpoint.

Each task shows:
- `📁 CREATE` — new file to create
- `✏️  EDIT` — file to modify
- `▶ RUN` — terminal command to execute
- `🧪 TEST` — verification step
- `⚠️  PITFALL` — common mistake at this step

---

## Table of Contents

1. [Prerequisites Checklist](#1-prerequisites-checklist)
2. [Repository Setup](#2-repository-setup)
3. [Milestone 1 — Backend Foundation](#3-milestone-1--backend-foundation)
4. [Milestone 2 — Core Charts Frontend](#4-milestone-2--core-charts-frontend)
5. [Milestone 3 — Technical Indicators](#5-milestone-3--technical-indicators)
6. [Milestone 4 — Analytics Engine](#6-milestone-4--analytics-engine)
7. [Milestone 5 — Fundamentals & Comparison](#7-milestone-5--fundamentals--comparison)
8. [Milestone 6 — Polish & Deployment](#8-milestone-6--polish--deployment)
9. [Git Workflow](#9-git-workflow)
10. [Environment Variable Reference](#10-environment-variable-reference)
11. [Dependency Version Lock](#11-dependency-version-lock)
12. [Common Errors & Fixes](#12-common-errors--fixes)
13. [Full File Tree — Final State](#13-full-file-tree--final-state)

---

## 1. Prerequisites Checklist

Complete every item before writing a single line of code.

### System requirements

```
□  Python 3.11 or higher
   Verify:  python --version   → Python 3.11.x
   Install: https://python.org/downloads

□  Node.js 20 LTS or higher
   Verify:  node --version     → v20.x.x
   Install: https://nodejs.org

□  npm 10+  (comes with Node 20)
   Verify:  npm --version      → 10.x.x

□  Git 2.40+
   Verify:  git --version

□  A code editor (VS Code recommended)
   Extensions needed:
   - Python (ms-python.python)
   - Pylance
   - ES7 React/Redux/React-Native Snippets
   - Tailwind CSS IntelliSense
   - REST Client (for .http file testing)
```

### Accounts and API keys

```
□  Alpha Vantage free API key
   Get it:  https://www.alphavantage.co/support/#api-key
   Copy it: store it safely — you will need it in step 3.2

□  GitHub account (for deployment triggers)

□  Railway account  (backend hosting — free tier)
   Sign up: https://railway.app

□  Vercel account   (frontend hosting — free tier)
   Sign up: https://vercel.com
```

### Verify Alpha Vantage key works before starting

Open this URL in your browser (replace YOUR_KEY):
```
https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=YOUR_KEY
```

Expected: JSON with `"Global Quote"` key and price data.
If you see `"Invalid API call"`: the key is wrong or not active yet.

---

## 2. Repository Setup

Estimated time: 30 minutes

### 2.1 Create the monorepo

```bash
# ▶ RUN
mkdir stocklens && cd stocklens
git init
echo "# StockLens — Stock Market Analytics Dashboard" > README.md
```

### 2.2 Create the top-level structure

```bash
# ▶ RUN
mkdir backend frontend
touch .gitignore
```

### 2.3 Write the root .gitignore

```
# 📁 CREATE  .gitignore  (root level)

# Python
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
*.egg-info/
dist/
build/
*.egg
.pytest_cache/
.mypy_cache/

# Virtual environments
venv/
.venv/
env/

# Environment variables — NEVER commit these
.env
backend/.env
frontend/.env
*.env.local

# SQLite database — contains cached data, not source
backend/db/*.db

# Node
node_modules/
frontend/node_modules/

# Build output
frontend/dist/
frontend/build/

# IDE
.vscode/settings.json
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

### 2.4 Initial commit

```bash
# ▶ RUN
git add .
git commit -m "chore: initialise repository structure"
```

---

## 3. Milestone 1 — Backend Foundation

**Goal:** A working FastAPI server that fetches AAPL price data, caches it in SQLite,
and returns it via REST. No frontend yet.

**Estimated time:** 2–3 days
**When done:** `curl http://localhost:8000/api/stock/AAPL/price` returns OHLCV JSON.

---

### Day 1 — Python environment, FastAPI skeleton, database

#### Step 1.1 — Create the Python virtual environment

```bash
# ▶ RUN
cd backend
python -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Confirm Python version
python --version   # must be 3.11+
```

#### Step 1.2 — Create requirements.txt

```
# 📁 CREATE  backend/requirements.txt

fastapi==0.111.0
uvicorn[standard]==0.29.0
httpx==0.27.0
pandas==2.2.2
numpy==1.26.4
python-dotenv==1.0.1
pydantic==2.7.1
pydantic-settings==2.2.1
aiosqlite==0.20.0
```

```bash
# ▶ RUN
pip install -r requirements.txt
```

⚠️ **PITFALL:** If `pip install` fails on `numpy` or `pandas`, make sure
you are inside the virtual environment (`which python` should point to
`backend/venv/bin/python`).

#### Step 1.3 — Create the backend directory structure

```bash
# ▶ RUN  (from backend/)
mkdir -p routers services models db tests
touch routers/__init__.py
touch services/__init__.py
touch models/__init__.py
touch db/__init__.py
touch tests/__init__.py
```

#### Step 1.4 — Create the .env file

```
# 📁 CREATE  backend/.env

ALPHA_VANTAGE_API_KEY=your_actual_key_here

CACHE_TTL_DAILY=86400
CACHE_TTL_QUOTE=3600

DAILY_REQUEST_LIMIT=25
DAILY_REQUEST_HARD_STOP=24

ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:5173
```

```
# 📁 CREATE  backend/.env.example   (commit this, not .env)

ALPHA_VANTAGE_API_KEY=your_key_here
CACHE_TTL_DAILY=86400
CACHE_TTL_QUOTE=3600
DAILY_REQUEST_LIMIT=25
DAILY_REQUEST_HARD_STOP=24
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:5173
```

#### Step 1.5 — Create config.py

```
# 📁 CREATE  backend/config.py

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    alpha_vantage_api_key: str
    cache_ttl_daily: int = 86400
    cache_ttl_quote: int = 3600
    daily_request_limit: int = 25
    daily_request_hard_stop: int = 24
    environment: str = "development"
    allowed_origins: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()
```

#### Step 1.6 — Create the database module

```
# 📁 CREATE  backend/db/database.py

import aiosqlite
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "stock_cache.db")

CREATE_API_CACHE = """
CREATE TABLE IF NOT EXISTS api_cache (
    cache_key     TEXT    NOT NULL,
    response_data TEXT    NOT NULL,
    fetched_at    INTEGER NOT NULL,
    ttl_seconds   INTEGER NOT NULL,
    PRIMARY KEY (cache_key)
);
"""

CREATE_API_BUDGET = """
CREATE TABLE IF NOT EXISTS api_budget (
    date          TEXT    NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (date)
);
"""

CREATE_WATCHLIST = """
CREATE TABLE IF NOT EXISTS watchlist (
    symbol    TEXT    NOT NULL,
    added_at  INTEGER NOT NULL,
    PRIMARY KEY (symbol)
);
"""

CREATE_CACHE_INDEX = """
CREATE INDEX IF NOT EXISTS idx_cache_fetched
ON api_cache (fetched_at);
"""

async def init_db() -> None:
    """Create all tables on startup. Safe to run multiple times."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(CREATE_API_CACHE)
        await db.execute(CREATE_API_BUDGET)
        await db.execute(CREATE_WATCHLIST)
        await db.execute(CREATE_CACHE_INDEX)
        await db.commit()
    print(f"[DB] Database initialised at {DB_PATH}")
```

🧪 **TEST:** After creating this file run:
```bash
python -c "import asyncio; from db.database import init_db; asyncio.run(init_db())"
```
Expected: `[DB] Database initialised at ...stock_cache.db` and a `.db` file appears in `backend/db/`.

#### Step 1.7 — Create the Pydantic models

```
# 📁 CREATE  backend/models/schemas.py

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
    week_52_high:   float
    week_52_low:    float
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
```

---

### Day 1 (continued) — Custom Exceptions

```
# 📁 CREATE  backend/services/exceptions.py

class StockLensError(Exception):
    """Base error for all StockLens exceptions."""
    def __init__(self, message: str, error_code: str, http_status: int = 500):
        self.message    = message
        self.error_code = error_code
        self.http_status = http_status
        super().__init__(message)

class BudgetExhaustedError(StockLensError):
    def __init__(self, msg="Daily API request limit reached."):
        super().__init__(msg, "BUDGET_EXHAUSTED", 429)

class RateLimitError(StockLensError):
    def __init__(self, msg="Alpha Vantage rate limit hit. Retry in 60 seconds."):
        super().__init__(msg, "AV_RATE_LIMITED", 429)

class SymbolNotFoundError(StockLensError):
    def __init__(self, symbol: str):
        super().__init__(f"No data found for symbol '{symbol}'", "SYMBOL_NOT_FOUND", 404)

class AlphaVantageError(StockLensError):
    def __init__(self, msg: str):
        super().__init__(f"Alpha Vantage error: {msg}", "AV_UPSTREAM_ERROR", 502)

class InvalidSymbolError(StockLensError):
    def __init__(self, symbol: str):
        super().__init__(f"Invalid symbol '{symbol}'", "INVALID_SYMBOL", 400)

class AnalyticsError(StockLensError):
    def __init__(self, msg: str):
        super().__init__(msg, "ANALYTICS_ERROR", 500)
```

---

### Day 2 — Cache service, budget service, Alpha Vantage client

#### Step 1.8 — Create the budget service

```
# 📁 CREATE  backend/services/budget.py

import aiosqlite
from datetime import date
from db.database import DB_PATH
from config import settings

def _today() -> str:
    return date.today().isoformat()   # "YYYY-MM-DD"

async def get_request_count() -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT request_count FROM api_budget WHERE date = ?",
            (_today(),)
        ) as cursor:
            row = await cursor.fetchone()
    return row[0] if row else 0

async def can_make_request() -> bool:
    count = await get_request_count()
    return count < settings.daily_request_hard_stop

async def increment_budget() -> int:
    today = _today()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO api_budget (date, request_count) VALUES (?, 1)
               ON CONFLICT(date) DO UPDATE SET
               request_count = request_count + 1""",
            (today,)
        )
        await db.commit()
        async with db.execute(
            "SELECT request_count FROM api_budget WHERE date = ?",
            (today,)
        ) as cursor:
            row = await cursor.fetchone()
    return row[0] if row else 0

async def get_status() -> dict:
    used = await get_request_count()
    return {
        "date":               _today(),
        "requests_used":      used,
        "requests_limit":     settings.daily_request_limit,
        "requests_remaining": max(0, settings.daily_request_limit - used),
        "budget_warning":     used >= 20,
    }
```

#### Step 1.9 — Create the cache service

```
# 📁 CREATE  backend/services/cache.py

import json
import time
import aiosqlite
from db.database import DB_PATH

async def get_cached(cache_key: str) -> dict | None:
    """Return parsed JSON if cache entry exists and is fresh. Else None."""
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT response_data, fetched_at, ttl_seconds FROM api_cache WHERE cache_key = ?",
            (cache_key,)
        ) as cursor:
            row = await cursor.fetchone()

    if row is None:
        return None

    response_data, fetched_at, ttl_seconds = row
    if (time.time() - fetched_at) >= ttl_seconds:
        return None   # expired

    return json.loads(response_data)

async def get_stale(cache_key: str) -> dict | None:
    """Return cached data regardless of TTL (used as fallback on budget exhaustion)."""
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT response_data FROM api_cache WHERE cache_key = ?",
            (cache_key,)
        ) as cursor:
            row = await cursor.fetchone()
    return json.loads(row[0]) if row else None

async def set_cached(cache_key: str, data: dict, ttl_seconds: int) -> None:
    """Write or overwrite a cache entry."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT OR REPLACE INTO api_cache
               (cache_key, response_data, fetched_at, ttl_seconds)
               VALUES (?, ?, ?, ?)""",
            (cache_key, json.dumps(data), int(time.time()), ttl_seconds)
        )
        await db.commit()

async def fetch_with_cache(
    cache_key: str,
    fetch_fn,
    ttl_seconds: int
) -> tuple[dict, bool]:
    """
    Cache-aside pattern.
    Returns (data, is_cached).
    """
    cached = await get_cached(cache_key)
    if cached is not None:
        return cached, True

    fresh_data = await fetch_fn()
    await set_cached(cache_key, fresh_data, ttl_seconds)
    return fresh_data, False

# ── Cache key builders ───────────────────────────────────────────────────────

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

#### Step 1.10 — Create the Alpha Vantage client

```
# 📁 CREATE  backend/services/alpha_vantage.py

import httpx
import re
from config import settings
from services.budget import can_make_request, increment_budget
from services.exceptions import (
    BudgetExhaustedError, RateLimitError, SymbolNotFoundError, AlphaVantageError
)

AV_BASE = "https://www.alphavantage.co/query"

async def _call_av(params: dict) -> dict:
    """Raw HTTP call to Alpha Vantage. Budget-gated."""
    if not await can_make_request():
        raise BudgetExhaustedError()

    params["apikey"] = settings.alpha_vantage_api_key

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(AV_BASE, params=params)
        response.raise_for_status()

    data = response.json()

    if "Error Message" in data:
        raise SymbolNotFoundError(params.get("symbol", "UNKNOWN"))
    if "Note" in data or "Information" in data:
        raise RateLimitError()

    await increment_budget()
    return data

# ── Symbol validation ────────────────────────────────────────────────────────

def sanitise_symbol(symbol: str) -> str:
    clean = re.sub(r"[^A-Z0-9.\-]", "", symbol.upper().strip())
    if not clean or len(clean) > 10:
        from services.exceptions import InvalidSymbolError
        raise InvalidSymbolError(symbol)
    return clean

# ── Normalisation helpers ────────────────────────────────────────────────────

def _safe_float(val: str | None) -> float | None:
    if val is None or val in ("None", "N/A", "-", ""):
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None

def _safe_int(val: str | None) -> int | None:
    f = _safe_float(val)
    return int(f) if f is not None else None

# ── Fetch functions (each returns normalised Python dict) ────────────────────

async def fetch_daily_price(symbol: str) -> dict:
    """Fetches full daily OHLCV time series."""
    raw = await _call_av({
        "function":   "TIME_SERIES_DAILY",
        "symbol":     symbol,
        "outputsize": "full",
    })
    series = raw.get("Time Series (Daily)", {})
    records = []
    for date_str, values in series.items():
        records.append({
            "date":   date_str,
            "open":   float(values["1. open"]),
            "high":   float(values["2. high"]),
            "low":    float(values["3. low"]),
            "close":  float(values["4. close"]),
            "volume": int(values["5. volume"]),
        })
    return {"symbol": symbol, "records": records}

async def fetch_global_quote(symbol: str) -> dict:
    """Fetches real-time price snapshot."""
    raw = await _call_av({"function": "GLOBAL_QUOTE", "symbol": symbol})
    q = raw.get("Global Quote", {})
    if not q:
        raise SymbolNotFoundError(symbol)
    pct = q.get("10. change percent", "0%").replace("%", "")
    return {
        "symbol":         q.get("01. symbol", symbol),
        "price":          float(q.get("05. price", 0)),
        "change":         float(q.get("09. change", 0)),
        "change_percent": float(pct or 0),
        "volume":         int(q.get("06. volume", 0)),
        "latest_day":     q.get("07. latest trading day", ""),
    }

async def fetch_overview(symbol: str) -> dict:
    """Fetches company fundamentals."""
    raw = await _call_av({"function": "OVERVIEW", "symbol": symbol})
    if not raw or "Symbol" not in raw:
        raise SymbolNotFoundError(symbol)
    return {
        "symbol":         raw.get("Symbol", symbol),
        "name":           raw.get("Name", ""),
        "description":    raw.get("Description", ""),
        "sector":         raw.get("Sector", ""),
        "industry":       raw.get("Industry", ""),
        "market_cap":     _safe_int(raw.get("MarketCapitalization")),
        "pe_ratio":       _safe_float(raw.get("PERatio")),
        "forward_pe":     _safe_float(raw.get("ForwardPE")),
        "peg_ratio":      _safe_float(raw.get("PEGRatio")),
        "eps":            _safe_float(raw.get("EPS")),
        "revenue_ttm":    _safe_int(raw.get("RevenueTTM")),
        "profit_margin":  _safe_float(raw.get("ProfitMargin")),
        "dividend_yield": _safe_float(raw.get("DividendYield")),
        "beta":           _safe_float(raw.get("Beta")),
        "week_52_high":   float(raw.get("52WeekHigh", 0)),
        "week_52_low":    float(raw.get("52WeekLow", 0)),
        "analyst_target": _safe_float(raw.get("AnalystTargetPrice")),
    }
```

⚠️ **PITFALL:** Alpha Vantage returns numeric values as strings.
Always cast explicitly. Never assume a value is already a float.

---

### Day 3 — Routers, main app, first test

#### Step 1.11 — Create the stock router (price + quote)

```
# 📁 CREATE  backend/routers/stock.py

from fastapi import APIRouter, HTTPException
from models.schemas import OHLCVResponse, StockQuoteResponse, PERIOD_DAYS
from services.alpha_vantage import (
    sanitise_symbol, fetch_daily_price, fetch_global_quote
)
from services.cache import (
    fetch_with_cache, get_stale, price_key, quote_key
)
from services.exceptions import StockLensError
from services.budget import can_make_request
from datetime import datetime
import pandas as pd

router = APIRouter()

@router.get("/{symbol}/price", response_model=OHLCVResponse)
async def get_price(symbol: str, period: str = "1Y"):
    symbol = sanitise_symbol(symbol)

    if period not in PERIOD_DAYS:
        raise HTTPException(status_code=400, detail=f"Invalid period '{period}'.",
                            headers={"X-Error-Code": "INVALID_PERIOD"})

    cache_k = price_key(symbol)
    days    = PERIOD_DAYS[period]

    try:
        data, is_cached = await fetch_with_cache(
            cache_k,
            lambda: fetch_daily_price(symbol),
            ttl_seconds=86400
        )
    except StockLensError as e:
        # Try stale cache before returning error
        stale = await get_stale(cache_k)
        if stale:
            data, is_cached = stale, True
        else:
            raise HTTPException(status_code=e.http_status, detail=e.message,
                                headers={"X-Error-Code": e.error_code})

    # Slice to requested period
    records = data["records"][:days]

    # Compute 30-day avg volume (used by quote endpoint)
    # Store it back with the data for reuse
    return OHLCVResponse(
        symbol    = symbol,
        period    = period,
        data      = records,
        is_cached = is_cached,
        cached_at = datetime.utcnow() if not is_cached else None,
    )

@router.get("/{symbol}/quote", response_model=StockQuoteResponse)
async def get_quote(symbol: str):
    symbol  = sanitise_symbol(symbol)
    cache_k = quote_key(symbol)

    try:
        data, is_cached = await fetch_with_cache(
            cache_k,
            lambda: fetch_global_quote(symbol),
            ttl_seconds=3600
        )
    except StockLensError as e:
        stale = await get_stale(cache_k)
        if stale:
            data, is_cached = stale, True
        else:
            raise HTTPException(status_code=e.http_status, detail=e.message,
                                headers={"X-Error-Code": e.error_code})

    # Compute avg volume from cached OHLCV if available
    price_data = await get_stale(price_key(symbol))
    avg_vol_30d = 0
    vol_ratio   = 1.0
    if price_data and price_data.get("records"):
        vols = [r["volume"] for r in price_data["records"][:30]]
        avg_vol_30d = int(sum(vols) / len(vols)) if vols else 0
        vol_ratio   = round(data["volume"] / avg_vol_30d, 2) if avg_vol_30d > 0 else 1.0

    return StockQuoteResponse(
        **data,
        avg_volume_30d = avg_vol_30d,
        volume_ratio   = vol_ratio,
        is_cached      = is_cached,
        cached_at      = datetime.utcnow() if not is_cached else None,
    )
```

#### Step 1.12 — Create the status router

```
# 📁 CREATE  backend/routers/status.py

from fastapi import APIRouter
from models.schemas import ApiStatus
from services.budget import get_status

router = APIRouter()

@router.get("/status", response_model=ApiStatus)
async def api_status():
    return await get_status()
```

#### Step 1.13 — Create placeholder routers (complete later)

```
# 📁 CREATE  backend/routers/indicators.py

from fastapi import APIRouter
router = APIRouter()
# TODO: Implement in Milestone 3
```

```
# 📁 CREATE  backend/routers/compare.py

from fastapi import APIRouter
router = APIRouter()
# TODO: Implement in Milestone 5
```

#### Step 1.14 — Create main.py

```
# 📁 CREATE  backend/main.py

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from routers import stock, indicators, compare, status
from db.database import init_db
from config import settings
from services.exceptions import StockLensError

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("[StockLens] Server ready.")
    yield

app = FastAPI(
    title       = "StockLens API",
    version     = "1.0.0",
    description = "Stock Market Analytics Dashboard API",
    lifespan    = lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins  = settings.allowed_origins.split(","),
    allow_methods  = ["GET", "POST", "DELETE"],
    allow_headers  = ["*"],
)

# Global exception handler for StockLens errors
@app.exception_handler(StockLensError)
async def stocklens_error_handler(request: Request, exc: StockLensError):
    return JSONResponse(
        status_code = exc.http_status,
        content     = {
            "detail":     exc.message,
            "error_code": exc.error_code,
            "is_cached":  False,
        }
    )

app.include_router(stock.router,      prefix="/api/stock",  tags=["Stock"])
app.include_router(indicators.router, prefix="/api/stock",  tags=["Indicators"])
app.include_router(compare.router,    prefix="/api/stocks", tags=["Comparison"])
app.include_router(status.router,     prefix="/api",        tags=["Status"])

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
```

#### Step 1.15 — Start the server and verify

```bash
# ▶ RUN  (from backend/)
uvicorn main:app --reload --port 8000
```

Expected output:
```
[DB] Database initialised at .../db/stock_cache.db
[StockLens] Server ready.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

### ✅ Milestone 1 Checkpoint

Run each test manually. All must pass before proceeding.

```bash
# 🧪 TEST 1 — Health check
curl http://localhost:8000/health
# Expected: {"status":"ok","version":"1.0.0"}

# 🧪 TEST 2 — API status (budget)
curl http://localhost:8000/api/status
# Expected: {"date":"...","requests_used":0,"requests_limit":25,...}

# 🧪 TEST 3 — Fetch AAPL price (will use 1 API request)
curl "http://localhost:8000/api/stock/AAPL/price?period=1Y"
# Expected: {"symbol":"AAPL","period":"1Y","data":[...],"is_cached":false}

# 🧪 TEST 4 — Fetch again (should be cached now, 0 new requests)
curl "http://localhost:8000/api/stock/AAPL/price?period=1Y"
# Expected: same response but "is_cached":true

# 🧪 TEST 5 — Budget incremented by 1
curl http://localhost:8000/api/status
# Expected: requests_used: 1

# 🧪 TEST 6 — Invalid symbol
curl http://localhost:8000/api/stock/AAPL\$\$/price
# Expected: 400 {"detail":"Invalid symbol...","error_code":"INVALID_SYMBOL"}

# 🧪 TEST 7 — OpenAPI docs load
# Open browser: http://localhost:8000/docs
# All routes should appear
```

```bash
# ▶ RUN — Commit milestone 1
git add backend/
git commit -m "feat(M1): backend foundation — FastAPI, SQLite cache, price+quote endpoints"
```

---

## 4. Milestone 2 — Core Charts Frontend

**Goal:** React app with a working candlestick chart, volume bars, and market summary bar pulling live data from the backend.

**Estimated time:** 2–3 days
**When done:** Browser shows a functional candlestick chart for AAPL.

---

### Day 4 — React scaffold and project setup

#### Step 2.1 — Scaffold the React project

```bash
# ▶ RUN  (from stocklens/ root)
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

#### Step 2.2 — Install all frontend dependencies

```bash
# ▶ RUN  (from frontend/)
npm install axios lightweight-charts recharts \
            react-query zustand clsx date-fns

npm install -D tailwindcss@3 postcss autoprefixer \
               @types/react @types/react-dom \
               vitest @testing-library/react @testing-library/jest-dom
```

#### Step 2.3 — Initialise Tailwind

```bash
# ▶ RUN  (from frontend/)
npx tailwindcss init -p
```

✏️ **EDIT** `frontend/tailwind.config.js` — replace with full config from DESIGN.md §7.

#### Step 2.4 — Set up CSS entry point

```
# ✏️ EDIT  frontend/src/index.css  — replace ALL content with:

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import CSS variables from design tokens */
@import './styles/tokens.css';

/* Base reset */
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background-color: var(--color-void);
  color: var(--color-text-primary);
  font-family: var(--font-ui);
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar styling */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--color-surface); }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
```

#### Step 2.5 — Create design tokens CSS

```bash
# ▶ RUN
mkdir -p frontend/src/styles
```

```
# 📁 CREATE  frontend/src/styles/tokens.css
# Paste the full :root { ... } block from DESIGN.md §6
```

#### Step 2.6 — Add Google Fonts

```
# ✏️ EDIT  frontend/index.html — add inside <head>:

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<title>StockLens</title>
```

#### Step 2.7 — Create .env file

```
# 📁 CREATE  frontend/.env

VITE_API_BASE_URL=http://localhost:8000
```

```
# 📁 CREATE  frontend/.env.example

VITE_API_BASE_URL=http://localhost:8000
```

---

### Day 4 (continued) — Types, API client, config

#### Step 2.8 — Create directory structure

```bash
# ▶ RUN  (from frontend/src/)
mkdir -p api components/layout components/market components/charts \
         components/analytics components/controls components/shared \
         hooks store types utils styles
```

#### Step 2.9 — Create config.ts

```
# 📁 CREATE  frontend/src/config.ts

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
```

#### Step 2.10 — Create types/stock.ts

```
# 📁 CREATE  frontend/src/types/stock.ts
# Paste the full TypeScript interfaces block from SCHEMA.md §7
```

#### Step 2.11 — Create Axios client

```
# 📁 CREATE  frontend/src/api/client.ts

import axios from "axios";
import { API_BASE_URL } from "../config";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ?? "Network error. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
```

#### Step 2.12 — Create the stockApi module

```
# 📁 CREATE  frontend/src/api/stockApi.ts

import apiClient from "./client";
import type {
  StockQuote, OHLCVResponse, IndicatorsResponse,
  AnalyticsSignals, CompanyOverview, ComparisonResponse,
  DrawdownResponse, DistributionResponse, ApiStatus,
} from "../types/stock";

export const stockApi = {
  getQuote: (symbol: string) =>
    apiClient.get<StockQuote>(`/api/stock/${symbol}/quote`).then(r => r.data),

  getPrice: (symbol: string, period = "1Y") =>
    apiClient.get<OHLCVResponse>(`/api/stock/${symbol}/price`, {
      params: { period },
    }).then(r => r.data),

  getIndicators: (symbol: string) =>
    apiClient.get<IndicatorsResponse>(`/api/stock/${symbol}/indicators`).then(r => r.data),

  getSignals: (symbol: string) =>
    apiClient.get<AnalyticsSignals>(`/api/stock/${symbol}/signals`).then(r => r.data),

  getOverview: (symbol: string) =>
    apiClient.get<CompanyOverview>(`/api/stock/${symbol}/overview`).then(r => r.data),

  getDrawdown: (symbol: string, period = "1Y") =>
    apiClient.get<DrawdownResponse>(`/api/stock/${symbol}/drawdown`, {
      params: { period },
    }).then(r => r.data),

  getDistribution: (symbol: string, period = "1Y") =>
    apiClient.get<DistributionResponse>(`/api/stock/${symbol}/distribution`, {
      params: { period },
    }).then(r => r.data),

  compareStocks: (symbols: string[], period = "1Y") =>
    apiClient.get<ComparisonResponse>(`/api/stocks/compare`, {
      params: { symbols: symbols.join(","), period },
    }).then(r => r.data),

  getStatus: () =>
    apiClient.get<ApiStatus>(`/api/status`).then(r => r.data),
};
```

---

### Day 5 — Zustand store, React Query, hooks, first components

#### Step 2.13 — Create Zustand store

```
# 📁 CREATE  frontend/src/store/dashboardStore.ts

import { create } from "zustand";
import type { Period } from "../types/stock";

interface Overlays {
  ema20: boolean; ema50: boolean; ema200: boolean; bollinger: boolean;
}

interface DashboardState {
  activeSymbol:   string;
  period:         Period;
  overlays:       Overlays;
  compareSymbols: string[];
  setSymbol:      (symbol: string) => void;
  setPeriod:      (period: Period) => void;
  toggleOverlay:  (key: keyof Overlays) => void;
  addCompare:     (symbol: string) => void;
  removeCompare:  (symbol: string) => void;
  resetCompare:   () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeSymbol:   "AAPL",
  period:         "1Y",
  overlays:       { ema20: true, ema50: true, ema200: false, bollinger: false },
  compareSymbols: [],

  setSymbol:    (s) => set({ activeSymbol: s.toUpperCase().trim() }),
  setPeriod:    (p) => set({ period: p }),
  toggleOverlay:(k) => set((st) => ({
    overlays: { ...st.overlays, [k]: !st.overlays[k] }
  })),
  addCompare:   (s) => set((st) => ({
    compareSymbols: [...new Set([...st.compareSymbols, s.toUpperCase()])].slice(0, 5)
  })),
  removeCompare:(s) => set((st) => ({
    compareSymbols: st.compareSymbols.filter(sym => sym !== s)
  })),
  resetCompare: ()  => set({ compareSymbols: [] }),
}));
```

#### Step 2.14 — Create React Query hooks

```
# 📁 CREATE  frontend/src/hooks/useStockData.ts

import { useQuery } from "react-query";
import { stockApi } from "../api/stockApi";
import type { Period } from "../types/stock";

const STALE_1HR = 1000 * 60 * 60;

export function useStockPrice(symbol: string, period: Period) {
  return useQuery(
    ["price", symbol, period],
    () => stockApi.getPrice(symbol, period),
    { staleTime: STALE_1HR, retry: 1, enabled: !!symbol }
  );
}

export function useStockQuote(symbol: string) {
  return useQuery(
    ["quote", symbol],
    () => stockApi.getQuote(symbol),
    { staleTime: STALE_1HR, retry: 1, enabled: !!symbol }
  );
}

export function useApiStatus() {
  return useQuery(
    ["status"],
    () => stockApi.getStatus(),
    { staleTime: 1000 * 60 * 5, refetchInterval: 1000 * 60 * 5 }
  );
}
```

#### Step 2.15 — Create shared components (Skeleton, Error)

```
# 📁 CREATE  frontend/src/components/shared/LoadingSkeleton.tsx

interface SkeletonProps {
  height?: number | string;
  width?: string;
  className?: string;
}

export function LoadingSkeleton({ height = 16, width = "100%", className = "" }: SkeletonProps) {
  return (
    <div
      className={`rounded animate-skeleton-wave ${className}`}
      style={{
        height,
        width,
        background: "linear-gradient(90deg, var(--color-elevated) 25%, var(--color-panel) 50%, var(--color-elevated) 75%)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}
```

```
# 📁 CREATE  frontend/src/components/shared/ErrorBanner.tsx

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-md mb-4"
         style={{
           background: "var(--color-error-subtle)",
           border: "1px solid rgba(239,68,68,0.3)",
           borderLeft: "3px solid var(--color-error)",
         }}>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
          ⚠ {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-4 px-3 py-1 text-xs font-semibold rounded-full transition-all"
          style={{
            color: "var(--color-error)",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
          }}>
          Retry ↻
        </button>
      )}
    </div>
  );
}
```

#### Step 2.16 — Create MetricCard shared component

```
# 📁 CREATE  frontend/src/components/shared/MetricCard.tsx

interface MetricCardProps {
  label: string;
  value: string;
  subvalue?: string;
  valueColor?: string;
}

export function MetricCard({ label, value, subvalue, valueColor }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "var(--color-text-muted)" }}>
        {label}
      </span>
      <span className="font-mono text-sm font-semibold"
            style={{ color: valueColor ?? "var(--color-text-primary)" }}>
        {value}
      </span>
      {subvalue && (
        <span className="font-mono text-[11px]"
              style={{ color: "var(--color-text-secondary)" }}>
          {subvalue}
        </span>
      )}
    </div>
  );
}
```

#### Step 2.17 — Create formatters utility

```
# 📁 CREATE  frontend/src/utils/formatters.ts

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style:    "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, includeSign = true): string {
  const formatted = Math.abs(value).toFixed(2) + "%";
  if (!includeSign) return formatted;
  return value >= 0 ? `+${formatted}` : `−${formatted}`;
}

export function formatVolume(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
  if (value >= 1_000_000)     return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000)         return (value / 1_000).toFixed(1) + "K";
  return value.toString();
}

export function formatMarketCap(value: number | null): string {
  if (!value) return "—";
  if (value >= 1_000_000_000_000) return "$" + (value / 1_000_000_000_000).toFixed(2) + "T";
  if (value >= 1_000_000_000)     return "$" + (value / 1_000_000_000).toFixed(2) + "B";
  if (value >= 1_000_000)         return "$" + (value / 1_000_000).toFixed(2) + "M";
  return "$" + value.toLocaleString();
}

export function formatRatio(value: number | null, decimals = 2): string {
  if (value === null || value === undefined) return "—";
  return value.toFixed(decimals);
}
```

#### Step 2.18 — Create chart helpers

```
# 📁 CREATE  frontend/src/utils/chartHelpers.ts

import type { OHLCVDataPoint } from "../types/stock";

export interface CandlestickBar {
  time: string; open: number; high: number; low: number; close: number;
}

export interface VolumeBar {
  time: string; value: number; color: string;
}

export function toCandlestickData(data: OHLCVDataPoint[]): CandlestickBar[] {
  return [...data]
    .reverse()
    .map(({ date, open, high, low, close }) => ({
      time: date, open, high, low, close,
    }));
}

export function toVolumeData(data: OHLCVDataPoint[]): VolumeBar[] {
  return [...data]
    .reverse()
    .map(({ date, open, close, volume }) => ({
      time:  date,
      value: volume,
      color: close >= open
        ? "rgba(74,222,128,0.5)"
        : "rgba(255,107,107,0.5)",
    }));
}
```

---

### Day 6 — Market Summary Bar, Candlestick Chart, App bootstrap

#### Step 2.19 — Create MarketSummaryBar

```
# 📁 CREATE  frontend/src/components/market/MarketSummaryBar.tsx

import { useStockQuote } from "../../hooks/useStockData";
import { useDashboardStore } from "../../store/dashboardStore";
import { formatPrice, formatPercent, formatVolume } from "../../utils/formatters";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";

export function MarketSummaryBar() {
  const symbol = useDashboardStore((s) => s.activeSymbol);
  const { data: quote, isLoading } = useStockQuote(symbol);

  const isUp      = (quote?.change ?? 0) >= 0;
  const glowColor = isUp
    ? "0 0 32px rgba(74,222,128,0.25)"
    : "0 0 32px rgba(255,107,107,0.25)";
  const changeColor = isUp
    ? "var(--color-bull)"
    : "var(--color-bear)";

  return (
    <div className="flex items-center gap-12 px-6 border-b"
         style={{
           height: "88px",
           background: "var(--color-surface)",
           borderColor: "var(--color-border)",
         }}>
      {/* Symbol + Company name */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold tracking-wider"
              style={{ color: "var(--color-amber)" }}>
          {symbol}
        </span>
        {isLoading
          ? <LoadingSkeleton height={12} width="120px" />
          : <span className="text-xs"
                  style={{ color: "var(--color-text-secondary)" }}>
              {quote?.latest_day ?? "—"}
            </span>
        }
      </div>

      {/* Live price — the hero number */}
      <div className="flex items-baseline gap-4">
        {isLoading
          ? <LoadingSkeleton height={40} width="160px" />
          : (
            <span className="font-mono font-semibold"
                  style={{
                    fontSize: "40px",
                    letterSpacing: "-0.03em",
                    color: "var(--color-text-primary)",
                    textShadow: glowColor,
                    animation: "glowPulse 1800ms ease-in-out infinite alternate",
                  }}>
              {formatPrice(quote?.price ?? 0)}
            </span>
          )
        }
        {!isLoading && quote && (
          <div className="flex flex-col">
            <span className="font-mono text-base"
                  style={{ color: changeColor }}>
              {formatPrice(quote.change)}
            </span>
            <span className="font-mono text-sm"
                  style={{ color: changeColor }}>
              {formatPercent(quote.change_percent)}
            </span>
          </div>
        )}
      </div>

      {/* Volume metric */}
      <div className="flex flex-col gap-1 ml-auto">
        <span className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}>Volume</span>
        {isLoading
          ? <LoadingSkeleton height={14} width="80px" />
          : (
            <span className="font-mono text-sm font-semibold"
                  style={{ color: "var(--color-text-primary)" }}>
              {formatVolume(quote?.volume ?? 0)}
            </span>
          )
        }
        {!isLoading && quote && (
          <span className="font-mono text-[11px]"
                style={{ color: "var(--color-text-secondary)" }}>
            {quote.volume_ratio.toFixed(2)}× avg
          </span>
        )}
      </div>
    </div>
  );
}
```

#### Step 2.20 — Create CandlestickChart component

```
# 📁 CREATE  frontend/src/components/charts/CandlestickChart.tsx

import { useEffect, useRef } from "react";
import { createChart, ColorType, LineStyle } from "lightweight-charts";
import type { IChartApi, ISeriesApi } from "lightweight-charts";
import { useStockPrice } from "../../hooks/useStockData";
import { useDashboardStore } from "../../store/dashboardStore";
import { toCandlestickData, toVolumeData } from "../../utils/chartHelpers";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";
import { ErrorBanner } from "../shared/ErrorBanner";

export function CandlestickChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const symbol  = useDashboardStore((s) => s.activeSymbol);
  const period  = useDashboardStore((s) => s.period);

  const { data, isLoading, isError, error, refetch } = useStockPrice(symbol, period);

  useEffect(() => {
    if (!containerRef.current) return;

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
      height: 320,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor:        "#4ADE80",
      downColor:      "#FF6B6B",
      borderUpColor:  "#4ADE80",
      borderDownColor:"#FF6B6B",
      wickUpColor:    "#4ADE80",
      wickDownColor:  "#FF6B6B",
    });

    const volumeSeries = chart.addHistogramSeries({
      priceScaleId: "volume",
      priceFormat:  { type: "volume" },
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    if (data?.data) {
      candleSeries.setData(toCandlestickData(data.data));
      volumeSeries.setData(toVolumeData(data.data));
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
    };
  }, [data]);

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
```

#### Step 2.21 — Bootstrap App.tsx and main.tsx

```
# ✏️ EDIT  frontend/src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

```
# ✏️ EDIT  frontend/src/App.tsx

import { MarketSummaryBar } from "./components/market/MarketSummaryBar";
import { CandlestickChart } from "./components/charts/CandlestickChart";

export default function App() {
  return (
    <div style={{ background: "var(--color-void)", minHeight: "100vh" }}>
      {/* Header placeholder */}
      <header className="h-14 border-b flex items-center px-6"
              style={{ background: "var(--color-panel)", borderColor: "var(--color-border)" }}>
        <span className="text-base font-semibold">
          <span style={{ color: "var(--color-amber)" }}>◈</span> StockLens
        </span>
      </header>

      <MarketSummaryBar />

      <main className="p-6 flex gap-4">
        <div className="flex-1 flex flex-col gap-4">
          <CandlestickChart />
        </div>
      </main>
    </div>
  );
}
```

#### Step 2.22 — Start the frontend and verify

```bash
# ▶ RUN  (from frontend/)
npm run dev
```

Open `http://localhost:5173` — you should see:
- Dark background
- Header with amber ◈ StockLens
- Market summary bar with AAPL price (loading → then real data)
- Candlestick chart rendering AAPL OHLCV data

---

### ✅ Milestone 2 Checkpoint

```
🧪 Visual checks (in browser):
□  Dark theme renders correctly (void background)
□  Market summary bar shows price, change, volume
□  Price number is large monospace with subtle glow
□  Positive change = green  /  Negative change = red
□  Candlestick chart renders with green/red candles
□  Volume bars appear below the chart
□  Chart is responsive (try resizing browser window)
□  No console errors in browser devtools

🧪 API checks:
□  Network tab shows requests going to localhost:8000
□  Second page load: is_cached: true (no extra API calls)
```

```bash
# ▶ RUN — Commit milestone 2
git add frontend/
git commit -m "feat(M2): React scaffold, candlestick chart, market summary bar"
```

---

## 5. Milestone 3 — Technical Indicators

**Goal:** RSI and MACD charts computing from cached OHLCV data. Backend analytics + frontend sub-charts.

**Estimated time:** 1–2 days

---

### Day 7 — Backend indicators service + router

#### Step 3.1 — Create the indicators analytics module

```
# 📁 CREATE  backend/services/indicators.py

import pandas as pd
import numpy as np

def compute_all_indicators(records: list[dict]) -> dict:
    """
    Input:  OHLCV records (newest → oldest from AV)
    Output: dict with rsi, macd, ema, bollinger lists (all oldest → newest)
    """
    df = pd.DataFrame(records)
    df["date"]  = pd.to_datetime(df["date"])
    df["close"] = df["close"].astype(float)
    df = df.sort_values("date")   # oldest first for computation

    # ── RSI (14-period Wilder smoothing) ─────────────────────────────────────
    delta  = df["close"].diff()
    gain   = delta.clip(lower=0).ewm(alpha=1/14, adjust=False).mean()
    loss   = (-delta.clip(upper=0)).ewm(alpha=1/14, adjust=False).mean()
    rs     = gain / loss.replace(0, np.nan)
    df["rsi"] = (100 - (100 / (1 + rs))).round(4)

    # ── MACD (12, 26, 9) ─────────────────────────────────────────────────────
    ema12       = df["close"].ewm(span=12, adjust=False).mean()
    ema26       = df["close"].ewm(span=26, adjust=False).mean()
    df["macd"]  = (ema12 - ema26).round(4)
    df["signal_line"] = df["macd"].ewm(span=9, adjust=False).mean().round(4)
    df["histogram"]   = (df["macd"] - df["signal_line"]).round(4)

    # ── EMA 20, 50, 200 ──────────────────────────────────────────────────────
    df["ema20"]  = df["close"].ewm(span=20,  adjust=False).mean().round(4)
    df["ema50"]  = df["close"].ewm(span=50,  adjust=False).mean().round(4)
    df["ema200"] = df["close"].ewm(span=200, adjust=False).mean().round(4)

    # ── Bollinger Bands (SMA 20, ±2σ) ────────────────────────────────────────
    df["sma20"]   = df["close"].rolling(20).mean()
    df["std20"]   = df["close"].rolling(20).std()
    df["bb_upper"]  = (df["sma20"] + 2 * df["std20"]).round(4)
    df["bb_middle"] = df["sma20"].round(4)
    df["bb_lower"]  = (df["sma20"] - 2 * df["std20"]).round(4)

    # ── Build output lists (drop NaN rows per indicator) ─────────────────────
    date_str = df["date"].dt.strftime("%Y-%m-%d")

    rsi_data = [
        {"date": d, "rsi": float(r)}
        for d, r in zip(date_str, df["rsi"])
        if pd.notna(r)
    ]

    macd_data = [
        {"date": d, "macd": float(m), "signal": float(s), "histogram": float(h)}
        for d, m, s, h in zip(date_str, df["macd"], df["signal_line"], df["histogram"])
        if pd.notna(m) and pd.notna(s)
    ]

    ema_data = [
        {"date": d, "ema20": float(e20), "ema50": float(e50), "ema200": float(e200)}
        for d, e20, e50, e200 in zip(date_str, df["ema20"], df["ema50"], df["ema200"])
        if pd.notna(e20) and pd.notna(e200)
    ]

    bb_data = [
        {"date": d, "upper": float(u), "middle": float(m), "lower": float(lo)}
        for d, u, m, lo in zip(date_str, df["bb_upper"], df["bb_middle"], df["bb_lower"])
        if pd.notna(u) and pd.notna(lo)
    ]

    return {
        "rsi":       rsi_data,
        "macd":      macd_data,
        "ema":       ema_data,
        "bollinger": bb_data,
    }
```

#### Step 3.2 — Update the indicators router

```
# ✏️ EDIT  backend/routers/indicators.py  — replace placeholder with:

from fastapi import APIRouter, HTTPException
from models.schemas import IndicatorsResponse
from services.alpha_vantage import sanitise_symbol
from services.cache import get_stale, fetch_with_cache, price_key, indicators_key
from services.indicators import compute_all_indicators
from services.exceptions import StockLensError
from datetime import datetime

router = APIRouter()

@router.get("/{symbol}/indicators", response_model=IndicatorsResponse)
async def get_indicators(symbol: str):
    symbol  = sanitise_symbol(symbol)
    cache_k = indicators_key(symbol)

    # Check if we have pre-computed indicators cached
    cached_indicators = await get_stale(cache_k)
    if cached_indicators:
        return IndicatorsResponse(
            symbol    = symbol,
            is_cached = True,
            **cached_indicators
        )

    # Get OHLCV data (should already be cached from /price endpoint)
    ohlcv = await get_stale(price_key(symbol))
    if not ohlcv or not ohlcv.get("records"):
        raise HTTPException(
            status_code = 404,
            detail      = f"No price data cached for {symbol}. Fetch /price first.",
            headers     = {"X-Error-Code": "SYMBOL_NOT_FOUND"}
        )

    # Compute indicators from cached OHLCV — no API calls
    indicators = compute_all_indicators(ohlcv["records"])

    # Cache the computed indicators for 24 hours
    from services.cache import set_cached
    await set_cached(cache_k, indicators, ttl_seconds=86400)

    return IndicatorsResponse(
        symbol    = symbol,
        is_cached = False,
        cached_at = datetime.utcnow(),
        **indicators
    )
```

---

### Day 7 (continued) — Frontend RSI and MACD charts

#### Step 3.3 — Create indicators hook

```
# 📁 CREATE  frontend/src/hooks/useIndicators.ts

import { useQuery } from "react-query";
import { stockApi } from "../api/stockApi";

export function useIndicators(symbol: string) {
  return useQuery(
    ["indicators", symbol],
    () => stockApi.getIndicators(symbol),
    { staleTime: 1000 * 60 * 60, retry: 1, enabled: !!symbol }
  );
}
```

#### Step 3.4 — Create RSI Chart component

```
# 📁 CREATE  frontend/src/components/charts/RSIChart.tsx

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ReferenceLine, Tooltip, ResponsiveContainer
} from "recharts";
import { useIndicators } from "../../hooks/useIndicators";
import { useDashboardStore } from "../../store/dashboardStore";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";

export function RSIChart() {
  const symbol = useDashboardStore((s) => s.activeSymbol);
  const { data, isLoading } = useIndicators(symbol);

  if (isLoading) return <LoadingSkeleton height={160} />;

  const rsiData = (data?.rsi ?? []).slice(-252);   // Last 1Y

  return (
    <div className="rounded-lg border"
         style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <div className="px-6 py-3 border-b flex items-center justify-between"
           style={{ borderColor: "var(--color-border)" }}>
        <span className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}>
          RSI (14)
        </span>
        {data?.rsi && (
          <span className="font-mono text-sm font-semibold"
                style={{
                  color: (data.rsi.at(-1)?.rsi ?? 50) > 70
                    ? "var(--color-bear)"
                    : (data.rsi.at(-1)?.rsi ?? 50) < 30
                    ? "var(--color-bull)"
                    : "var(--color-text-secondary)"
                }}>
            {(data.rsi.at(-1)?.rsi ?? 0).toFixed(2)}
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={rsiData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A2438" />
          <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "#8B99B0", fontSize: 10, fontFamily: "JetBrains Mono" }}
                 axisLine={false} tickLine={false} width={32}
                 ticks={[0, 30, 50, 70, 100]} />
          <Tooltip
            contentStyle={{
              background: "var(--color-panel)", border: "1px solid var(--color-border)",
              borderRadius: "8px", fontFamily: "JetBrains Mono", fontSize: "12px",
            }}
            labelStyle={{ color: "var(--color-amber)" }}
            itemStyle={{ color: "var(--color-text-primary)" }}
          />
          <ReferenceLine y={70} stroke="#FF6B6B" strokeDasharray="4 2" strokeWidth={1} />
          <ReferenceLine y={30} stroke="#4ADE80" strokeDasharray="4 2" strokeWidth={1} />
          <ReferenceLine y={50} stroke="#2E3D54" strokeWidth={1} />
          <Line type="monotone" dataKey="rsi" stroke="#F5A623"
                strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### Step 3.5 — Create MACD Chart component

```
# 📁 CREATE  frontend/src/components/charts/MACDChart.tsx

import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { useIndicators } from "../../hooks/useIndicators";
import { useDashboardStore } from "../../store/dashboardStore";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";

export function MACDChart() {
  const symbol = useDashboardStore((s) => s.activeSymbol);
  const { data, isLoading } = useIndicators(symbol);

  if (isLoading) return <LoadingSkeleton height={160} />;

  const macdData = (data?.macd ?? []).slice(-252);

  return (
    <div className="rounded-lg border"
         style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <div className="px-6 py-3 border-b"
           style={{ borderColor: "var(--color-border)" }}>
        <span className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}>
          MACD (12, 26, 9)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <ComposedChart data={macdData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A2438" />
          <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#8B99B0", fontSize: 10, fontFamily: "JetBrains Mono" }}
                 axisLine={false} tickLine={false} width={48} />
          <Tooltip
            contentStyle={{
              background: "var(--color-panel)", border: "1px solid var(--color-border)",
              borderRadius: "8px", fontFamily: "JetBrains Mono", fontSize: "12px",
            }}
            labelStyle={{ color: "var(--color-amber)" }}
          />
          <ReferenceLine y={0} stroke="#2E3D54" strokeWidth={1} />
          <Bar dataKey="histogram" name="Histogram"
               fill="#64B5F6"
               radius={[1, 1, 0, 0]}
               // Color each bar based on positive/negative
               isAnimationActive={false}
          />
          <Line type="monotone" dataKey="macd"        name="MACD"
                stroke="#F5A623" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="signal"      name="Signal"
                stroke="#64B5F6" strokeWidth={1}   dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### Step 3.6 — Add Indicators Panel + update App.tsx

```
# 📁 CREATE  frontend/src/components/charts/IndicatorsPanel.tsx

import { RSIChart } from "./RSIChart";
import { MACDChart } from "./MACDChart";

export function IndicatorsPanel() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <RSIChart />
      <MACDChart />
    </div>
  );
}
```

✏️ **EDIT** `frontend/src/App.tsx` — add `<IndicatorsPanel />` below `<CandlestickChart />`.

---

### ✅ Milestone 3 Checkpoint

```
🧪 TEST — Backend
curl http://localhost:8000/api/stock/AAPL/indicators
# Expected: JSON with rsi[], macd[], ema[], bollinger[] arrays

🧪 TEST — Verify zero additional API calls
curl http://localhost:8000/api/status
# request_count should be same as after M1 (indicators use cached OHLCV)

🧪 Visual checks:
□  RSI chart renders below candlestick
□  70 and 30 reference lines visible (dashed red/green)
□  MACD chart renders with MACD + Signal lines + histogram bars
□  Current RSI value badge in card header
□  Charts are side-by-side (2-column grid)
```

```bash
git commit -am "feat(M3): RSI + MACD charts, indicators computed from cache"
```

---

## 6. Milestone 4 — Analytics Engine

**Goal:** The server-side signals computation engine + the Analytics Insights sidebar panel.

**Estimated time:** 2–3 days

---

### Day 8 — Analytics engine backend

#### Step 4.1 — Create the full analytics service

```
# 📁 CREATE  backend/services/analytics.py

import pandas as pd
import numpy as np

def compute_signals(records: list[dict]) -> dict:
    """
    Compute all analytics signals from cached OHLCV records.
    records: list of dicts with date, open, high, low, close, volume
             (newest → oldest from AV — we reverse inside)
    """
    if len(records) < 30:
        return _insufficient_data_signals()

    df = pd.DataFrame(records)
    df["date"]   = pd.to_datetime(df["date"])
    df["close"]  = df["close"].astype(float)
    df["volume"] = df["volume"].astype(float)
    df = df.sort_values("date").reset_index(drop=True)   # oldest first

    # Daily returns
    df["ret"] = df["close"].pct_change()

    # EMA crossover
    df["ema50"]  = df["close"].ewm(span=50,  adjust=False).mean()
    df["ema200"] = df["close"].ewm(span=200, adjust=False).mean()
    prev_diff = float(df["ema50"].iloc[-2] - df["ema200"].iloc[-2])
    curr_diff = float(df["ema50"].iloc[-1] - df["ema200"].iloc[-1])

    if prev_diff < 0 and curr_diff >= 0:
        crossover_type = "golden"
        trend_signal   = "bullish"
    elif prev_diff > 0 and curr_diff <= 0:
        crossover_type = "death"
        trend_signal   = "bearish"
    else:
        crossover_type = "none"
        trend_signal   = "bullish" if curr_diff > 0 else "bearish"

    # RSI
    delta   = df["close"].diff()
    gain    = delta.clip(lower=0).ewm(alpha=1/14, adjust=False).mean()
    loss    = (-delta.clip(upper=0)).ewm(alpha=1/14, adjust=False).mean()
    rs      = gain / loss.replace(0, np.nan)
    rsi_val = float(100 - (100 / (1 + rs.iloc[-1])))
    rsi_state = ("overbought" if rsi_val > 70
                 else "oversold" if rsi_val < 30
                 else "neutral")

    # Volatility
    vol_20d       = float(df["ret"].rolling(20).std().iloc[-1]) * np.sqrt(252) * 100
    vol_level     = ("low" if vol_20d < 20 else "high" if vol_20d > 40 else "medium")

    # Volume anomaly
    avg_vol_30d   = float(df["volume"].rolling(30).mean().iloc[-1])
    today_vol     = float(df["volume"].iloc[-1])
    vol_ratio     = round(today_vol / avg_vol_30d, 2) if avg_vol_30d > 0 else 1.0

    # Bollinger squeeze
    df["sma20"]    = df["close"].rolling(20).mean()
    df["std20"]    = df["close"].rolling(20).std()
    df["bb_width"] = (df["std20"] * 4) / df["sma20"]
    bb_percentile  = float(df["bb_width"].rank(pct=True).iloc[-1])
    squeeze        = bb_percentile < 0.20

    summary = _build_summary(
        trend_signal, crossover_type, rsi_state, rsi_val,
        vol_level, vol_ratio, squeeze
    )

    return {
        "trend_signal":      trend_signal,
        "crossover_type":    crossover_type,
        "rsi_state":         rsi_state,
        "rsi_value":         round(rsi_val, 2),
        "volatility_level":  vol_level,
        "volatility_value":  round(vol_20d, 2),
        "volume_anomaly":    vol_ratio,
        "bollinger_squeeze": squeeze,
        "summary":           summary,
    }


def compute_drawdown(records: list[dict]) -> list[dict]:
    df = pd.DataFrame(records)[["date", "close"]].copy()
    df["close"] = df["close"].astype(float)
    df = df.sort_values("date")
    df["peak"]     = df["close"].cummax()
    df["drawdown"] = ((df["close"] - df["peak"]) / df["peak"] * 100).round(4)
    return df[["date", "drawdown"]].to_dict(orient="records")


def compute_return_distribution(records: list[dict]) -> list[dict]:
    df = pd.DataFrame(records)[["date", "close"]].copy()
    df["close"]        = df["close"].astype(float)
    df                 = df.sort_values("date")
    df["daily_return"] = (df["close"].pct_change() * 100).round(4)
    return df.dropna()[["date", "daily_return"]].to_dict(orient="records")


def compute_normalised_comparison(ohlcv_map: dict) -> tuple[list, dict]:
    """
    ohlcv_map: { "AAPL": [records...], "MSFT": [records...] }
    Returns (normalised_data, total_returns)
    """
    dfs = {}
    for sym, records in ohlcv_map.items():
        df = pd.DataFrame(records)[["date", "close"]].copy()
        df["close"] = df["close"].astype(float)
        df = df.sort_values("date").set_index("date")
        dfs[sym] = df["close"]

    combined   = pd.DataFrame(dfs).dropna()
    normalised = (combined / combined.iloc[0]) * 100

    data_out = []
    for date_idx, row in normalised.iterrows():
        data_out.append({
            "date":   str(date_idx)[:10],
            "values": {sym: round(float(val), 4) for sym, val in row.items()}
        })

    total_returns = {
        sym: round(float(normalised[sym].iloc[-1] - 100), 2)
        for sym in normalised.columns
    }

    return data_out, total_returns


def _build_summary(trend, crossover, rsi_state, rsi_val,
                   vol_level, vol_ratio, squeeze) -> str:
    parts = []
    if crossover == "golden":
        parts.append("A golden cross just formed — a bullish trend signal.")
    elif crossover == "death":
        parts.append("A death cross just formed — a bearish trend signal.")
    else:
        direction = "above" if trend == "bullish" else "below"
        parts.append(f"Trend is {trend} (EMA 50 {direction} EMA 200).")
    if rsi_state == "overbought":
        parts.append(f"RSI at {rsi_val:.0f} — stock may be overbought.")
    elif rsi_state == "oversold":
        parts.append(f"RSI at {rsi_val:.0f} — stock may be oversold.")
    if vol_ratio >= 2.0:
        parts.append(f"Volume is {vol_ratio}× the 30-day average.")
    if squeeze:
        parts.append("Bollinger Bands in squeeze — a large move may be approaching.")
    return " ".join(parts)


def _insufficient_data_signals() -> dict:
    return {
        "trend_signal": "neutral", "crossover_type": "none",
        "rsi_state": "neutral", "rsi_value": 50.0,
        "volatility_level": "medium", "volatility_value": 0.0,
        "volume_anomaly": 1.0, "bollinger_squeeze": False,
        "summary": "Insufficient data to compute signals.",
    }
```

#### Step 4.2 — Add signals + drawdown + distribution endpoints to indicators router

```
# ✏️ EDIT  backend/routers/indicators.py — add these routes:

@router.get("/{symbol}/signals", response_model=AnalyticsSignals)
async def get_signals(symbol: str):
    from services.analytics import compute_signals
    from models.schemas import AnalyticsSignals
    symbol = sanitise_symbol(symbol)
    ohlcv  = await get_stale(price_key(symbol))
    if not ohlcv:
        raise HTTPException(status_code=404, detail=f"No data for {symbol}.")
    signals = compute_signals(ohlcv["records"])
    return AnalyticsSignals(symbol=symbol, **signals)

@router.get("/{symbol}/drawdown", response_model=DrawdownResponse)
async def get_drawdown(symbol: str, period: str = "1Y"):
    from services.analytics import compute_drawdown
    from models.schemas import DrawdownResponse, PERIOD_DAYS
    symbol = sanitise_symbol(symbol)
    ohlcv  = await get_stale(price_key(symbol))
    if not ohlcv:
        raise HTTPException(status_code=404, detail=f"No data for {symbol}.")
    records = ohlcv["records"][:PERIOD_DAYS.get(period, 252)]
    data    = compute_drawdown(records)
    return DrawdownResponse(symbol=symbol, data=data)

@router.get("/{symbol}/distribution", response_model=DistributionResponse)
async def get_distribution(symbol: str, period: str = "1Y"):
    from services.analytics import compute_return_distribution
    from models.schemas import DistributionResponse, PERIOD_DAYS
    symbol = sanitise_symbol(symbol)
    ohlcv  = await get_stale(price_key(symbol))
    if not ohlcv:
        raise HTTPException(status_code=404, detail=f"No data for {symbol}.")
    records = ohlcv["records"][:PERIOD_DAYS.get(period, 252)]
    data    = compute_return_distribution(records)
    return DistributionResponse(symbol=symbol, data=data)
```

---

### Day 9 — Analytics Insights sidebar frontend

#### Step 4.3 — Create signals hook

```
# 📁 CREATE  frontend/src/hooks/useSignals.ts

import { useQuery } from "react-query";
import { stockApi } from "../api/stockApi";

export function useSignals(symbol: string) {
  return useQuery(
    ["signals", symbol],
    () => stockApi.getSignals(symbol),
    { staleTime: 1000 * 60 * 60, retry: 1, enabled: !!symbol }
  );
}
```

#### Step 4.4 — Create SignalBadge component

```
# 📁 CREATE  frontend/src/components/analytics/SignalBadge.tsx

type Variant = "bullish" | "bearish" | "neutral" |
               "overbought" | "oversold" | "high" | "low" | "medium" | "squeeze";

const CONFIG: Record<Variant, { label: string; icon: string; color: string; bg: string; border: string }> = {
  bullish:    { label: "Bullish",    icon: "▲", color: "var(--color-bull)",    bg: "var(--color-bull-subtle)",    border: "rgba(74,222,128,0.25)" },
  bearish:    { label: "Bearish",    icon: "▼", color: "var(--color-bear)",    bg: "var(--color-bear-subtle)",    border: "rgba(255,107,107,0.25)" },
  neutral:    { label: "Neutral",    icon: "●", color: "var(--color-neutral)", bg: "var(--color-neutral-subtle)", border: "rgba(100,181,246,0.25)" },
  overbought: { label: "Overbought", icon: "⚠", color: "var(--color-bear)",    bg: "var(--color-bear-subtle)",    border: "rgba(255,107,107,0.25)" },
  oversold:   { label: "Oversold",   icon: "↓", color: "var(--color-bull)",    bg: "var(--color-bull-subtle)",    border: "rgba(74,222,128,0.25)" },
  high:       { label: "High",       icon: "↑", color: "var(--color-bear)",    bg: "var(--color-bear-subtle)",    border: "rgba(255,107,107,0.25)" },
  low:        { label: "Low",        icon: "↓", color: "var(--color-bull)",    bg: "var(--color-bull-subtle)",    border: "rgba(74,222,128,0.25)" },
  medium:     { label: "Medium",     icon: "─", color: "var(--color-neutral)", bg: "var(--color-neutral-subtle)", border: "rgba(100,181,246,0.25)" },
  squeeze:    { label: "Squeeze",    icon: "⚡", color: "var(--color-amber)",   bg: "var(--color-amber-subtle)",   border: "rgba(245,166,35,0.3)" },
};

export function SignalBadge({ variant }: { variant: Variant }) {
  const cfg = CONFIG[variant] ?? CONFIG.neutral;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
          style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </span>
  );
}
```

#### Step 4.5 — Create AnalyticsInsights panel

```
# 📁 CREATE  frontend/src/components/analytics/AnalyticsInsights.tsx

import { useSignals } from "../../hooks/useSignals";
import { useDashboardStore } from "../../store/dashboardStore";
import { SignalBadge } from "./SignalBadge";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";
import type { VolatilityLevel, RSIState, TrendSignal } from "../../types/stock";

export function AnalyticsInsights() {
  const symbol = useDashboardStore((s) => s.activeSymbol);
  const { data: signals, isLoading } = useSignals(symbol);

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="px-4 py-3 border-b"
           style={{ borderColor: "var(--color-border)" }}>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"
           style={{ color: "var(--color-text-muted)" }}>
          Analytics Insights
        </p>
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          {symbol} · signals from cached data
        </p>
      </div>

      <div className="px-4 flex flex-col gap-3">

        {/* Trend */}
        <SignalCard title="Trend" icon="◈">
          {isLoading ? <LoadingSkeleton height={20} /> : (
            <div className="flex items-center justify-between">
              <SignalBadge variant={signals?.trend_signal as TrendSignal ?? "neutral"} />
              <span className="font-mono text-xs" style={{ color: "var(--color-text-secondary)" }}>
                EMA 50 vs 200
              </span>
            </div>
          )}
        </SignalCard>

        {/* RSI */}
        <SignalCard title="RSI (14)" icon="◈">
          {isLoading ? <LoadingSkeleton height={20} /> : (
            <>
              <div className="flex items-center justify-between mb-2">
                <SignalBadge variant={signals?.rsi_state as RSIState ?? "neutral"} />
                <span className="font-mono text-sm font-semibold"
                      style={{ color: "var(--color-text-primary)" }}>
                  {signals?.rsi_value.toFixed(2)}
                </span>
              </div>
              {/* Gradient RSI track */}
              <div className="relative h-1.5 rounded-full overflow-hidden"
                   style={{ background: "linear-gradient(to right, #4ADE80 0%, #F5A623 50%, #FF6B6B 100%)" }}>
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-sm"
                     style={{ left: `${Math.max(0, Math.min(100, signals?.rsi_value ?? 50))}%`,
                              transform: "translate(-50%, -50%)" }} />
              </div>
            </>
          )}
        </SignalCard>

        {/* Volatility */}
        <SignalCard title="Volatility (20d)" icon="◈">
          {isLoading ? <LoadingSkeleton height={20} /> : (
            <div className="flex items-center justify-between">
              <SignalBadge variant={signals?.volatility_level as VolatilityLevel ?? "medium"} />
              <span className="font-mono text-sm font-semibold"
                    style={{ color: "var(--color-text-primary)" }}>
                {signals?.volatility_value.toFixed(1)}%
              </span>
            </div>
          )}
        </SignalCard>

        {/* Volume */}
        <SignalCard title="Volume Activity" icon="◈">
          {isLoading ? <LoadingSkeleton height={20} /> : (
            <>
              <p className="font-mono text-xl font-semibold mb-1"
                 style={{ color: (signals?.volume_anomaly ?? 1) >= 2
                   ? "var(--color-amber)"
                   : "var(--color-text-secondary)" }}>
                {signals?.volume_anomaly.toFixed(2)}×
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                vs 30-day average
              </p>
            </>
          )}
        </SignalCard>

        {/* Bollinger Squeeze */}
        <SignalCard title="Bollinger Squeeze" icon="◈">
          {isLoading ? <LoadingSkeleton height={20} /> : (
            <div className="flex items-center gap-2">
              {signals?.bollinger_squeeze
                ? <SignalBadge variant="squeeze" />
                : <span className="text-sm font-medium"
                         style={{ color: "var(--color-bull)" }}>◉ No Squeeze</span>
              }
            </div>
          )}
        </SignalCard>

        {/* Summary */}
        {!isLoading && signals?.summary && (
          <div className="p-3 rounded-md mt-1"
               style={{ background: "var(--color-elevated)", border: "1px solid var(--color-border-subtle)" }}>
            <p className="text-sm leading-relaxed"
               style={{
                 fontFamily: "var(--font-display)",
                 fontStyle: "italic",
                 color: "var(--color-text-secondary)",
               }}>
              "{signals.summary}"
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

// Internal signal card wrapper
function SignalCard({ title, icon, children }: {
  title: string; icon: string; children: React.ReactNode
}) {
  return (
    <div className="p-3 rounded-md border"
         style={{
           background: "var(--color-surface)",
           borderColor: "var(--color-border-subtle)",
         }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
         style={{ color: "var(--color-text-muted)" }}>
        <span style={{ color: "var(--color-amber)", marginRight: "4px" }}>{icon}</span>
        {title}
      </p>
      {children}
    </div>
  );
}
```

#### Step 4.6 — Update App.tsx with sidebar layout

✏️ **EDIT** `frontend/src/App.tsx` — wrap content in a two-column layout:
main content + 320px sidebar with `<AnalyticsInsights />`.

---

### ✅ Milestone 4 Checkpoint

```
🧪 Backend tests:
curl http://localhost:8000/api/stock/AAPL/signals
# Expected: JSON with trend_signal, rsi_state, bollinger_squeeze, summary

curl http://localhost:8000/api/stock/AAPL/drawdown?period=1Y
# Expected: list of {date, drawdown} pairs, drawdown values ≤ 0

🧪 Visual checks:
□  Analytics sidebar shows 5 signal cards
□  Trend badge is bullish (green) or bearish (red)
□  RSI gradient track renders with marker at correct position
□  Volume anomaly shows ×value in amber if >= 2.0
□  Summary paragraph in italic serif font
□  All 5 cards animate in with stagger on symbol change
```

```bash
git commit -am "feat(M4): analytics engine signals, drawdown, distribution, sidebar panel"
```

---

## 7. Milestone 5 — Fundamentals & Comparison

**Goal:** Company overview panel and multi-stock normalised comparison chart.

**Estimated time:** 2 days

---

### Day 10 — Backend overview + compare endpoints

#### Step 5.1 — Add overview endpoint to stock router

```
# ✏️ EDIT  backend/routers/stock.py — add:

@router.get("/{symbol}/overview", response_model=CompanyOverview)
async def get_overview(symbol: str):
    from services.alpha_vantage import fetch_overview
    from services.cache import fetch_with_cache, overview_key
    from models.schemas import CompanyOverview
    symbol  = sanitise_symbol(symbol)
    cache_k = overview_key(symbol)
    try:
        data, is_cached = await fetch_with_cache(
            cache_k,
            lambda: fetch_overview(symbol),
            ttl_seconds=86400
        )
    except StockLensError as e:
        raise HTTPException(status_code=e.http_status, detail=e.message)
    return CompanyOverview(is_cached=is_cached, **data)
```

#### Step 5.2 — Create the compare router

```
# ✏️ EDIT  backend/routers/compare.py — replace placeholder:

from fastapi import APIRouter, HTTPException
from models.schemas import ComparisonResponse, PERIOD_DAYS
from services.cache import get_stale, price_key
from services.analytics import compute_normalised_comparison
from services.alpha_vantage import sanitise_symbol

router = APIRouter()

@router.get("/compare", response_model=ComparisonResponse)
async def compare_stocks(symbols: str, period: str = "1Y"):
    sym_list = [sanitise_symbol(s.strip()) for s in symbols.split(",")]
    if len(sym_list) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 symbols.",
                            headers={"X-Error-Code": "TOO_MANY_SYMBOLS"})
    if len(sym_list) < 2:
        raise HTTPException(status_code=400, detail="Minimum 2 symbols.")

    days = PERIOD_DAYS.get(period, 252)
    ohlcv_map = {}
    missing   = []

    for sym in sym_list:
        cached = await get_stale(price_key(sym))
        if not cached or not cached.get("records"):
            missing.append(sym)
        else:
            ohlcv_map[sym] = cached["records"][:days]

    if missing:
        raise HTTPException(
            status_code = 404,
            detail      = f"No cached data for: {', '.join(missing)}. Fetch /price first."
        )

    data, total_returns = compute_normalised_comparison(ohlcv_map)
    base_date = data[0]["date"] if data else ""

    return ComparisonResponse(
        symbols       = sym_list,
        period        = period,
        base_date     = base_date,
        data          = data,
        total_returns = total_returns,
        is_cached     = False,
    )
```

---

### Day 11 — Frontend comparison + fundamentals

#### Step 5.3 — Create ComparisonChart

```
# 📁 CREATE  frontend/src/components/charts/ComparisonChart.tsx

import { LineChart, Line, XAxis, YAxis, CartesianGrid,
         Tooltip, Legend, ReferenceLine, ResponsiveContainer } from "recharts";
import { useQuery } from "react-query";
import { stockApi } from "../../api/stockApi";
import { useDashboardStore } from "../../store/dashboardStore";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";

const CHART_COLORS = ["#F5A623", "#64B5F6", "#A78BFA", "#34D399", "#F97316"];

export function ComparisonChart() {
  const { compareSymbols, activeSymbol, period } = useDashboardStore();
  const allSymbols = [...new Set([activeSymbol, ...compareSymbols])];

  const { data, isLoading } = useQuery(
    ["compare", allSymbols.sort().join(","), period],
    () => stockApi.compareStocks(allSymbols, period),
    { staleTime: 1000 * 60 * 60, enabled: allSymbols.length >= 1 }
  );

  const chartData = data?.data.map(point => ({
    date: point.date,
    ...point.values,
  })) ?? [];

  return (
    <div className="rounded-lg border"
         style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <div className="px-6 py-4 border-b flex items-center justify-between"
           style={{ borderColor: "var(--color-border)" }}>
        <span className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}>
          Performance Comparison · Normalised to 100
        </span>
      </div>

      {isLoading
        ? <LoadingSkeleton height={280} />
        : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2438" />
              <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8B99B0", fontSize: 10, fontFamily: "JetBrains Mono" }}
                     axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-panel)", border: "1px solid var(--color-border)",
                  borderRadius: "8px", fontFamily: "JetBrains Mono", fontSize: "12px",
                }}
              />
              <ReferenceLine y={100} stroke="#2E3D54" strokeDasharray="4 2" />
              {allSymbols.map((sym, i) => (
                <Line key={sym} type="monotone" dataKey={sym} name={sym}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )
      }

      {/* Total returns legend */}
      {data?.total_returns && (
        <div className="px-6 pb-4 flex gap-6 flex-wrap">
          {Object.entries(data.total_returns).map(([sym, ret], i) => (
            <div key={sym} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full"
                   style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="font-mono text-xs font-semibold"
                    style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                {sym}
              </span>
              <span className="font-mono text-xs"
                    style={{ color: ret >= 0 ? "var(--color-bull)" : "var(--color-bear)" }}>
                {ret >= 0 ? "+" : ""}{ret.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Step 5.4 — Create FundamentalsPanel

```
# 📁 CREATE  frontend/src/components/market/FundamentalsPanel.tsx

import { useQuery } from "react-query";
import { stockApi } from "../../api/stockApi";
import { useDashboardStore } from "../../store/dashboardStore";
import { formatMarketCap, formatRatio } from "../../utils/formatters";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";

export function FundamentalsPanel() {
  const symbol = useDashboardStore((s) => s.activeSymbol);
  const { data, isLoading } = useQuery(
    ["overview", symbol],
    () => stockApi.getOverview(symbol),
    { staleTime: 1000 * 60 * 60, retry: 1, enabled: !!symbol }
  );

  const rows = data ? [
    { label: "Market Cap",     value: formatMarketCap(data.market_cap) },
    { label: "P/E Ratio",      value: formatRatio(data.pe_ratio) },
    { label: "Forward P/E",    value: formatRatio(data.forward_pe) },
    { label: "EPS (TTM)",      value: data.eps ? `$${data.eps.toFixed(2)}` : "—" },
    { label: "Profit Margin",  value: data.profit_margin ? `${(data.profit_margin*100).toFixed(1)}%` : "—" },
    { label: "Dividend Yield", value: data.dividend_yield ? `${(data.dividend_yield*100).toFixed(2)}%` : "—" },
    { label: "Beta",           value: formatRatio(data.beta) },
    { label: "Analyst Target", value: data.analyst_target ? `$${data.analyst_target.toFixed(2)}` : "—" },
  ] : [];

  return (
    <div className="border-t mt-2" style={{ borderColor: "var(--color-border)" }}>
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3"
           style={{ color: "var(--color-text-muted)" }}>
          <span style={{ color: "var(--color-amber)" }}>◈</span> Fundamentals
        </p>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between py-2 border-b"
                   style={{ borderColor: "var(--color-border-subtle)" }}>
                <LoadingSkeleton height={12} width="80px" />
                <LoadingSkeleton height={12} width="60px" />
              </div>
            ))
          : rows.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b"
                   style={{ borderColor: "var(--color-border-subtle)" }}>
                <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {label}
                </span>
                <span className="font-mono text-xs font-semibold"
                      style={{ color: "var(--color-text-primary)" }}>
                  {value}
                </span>
              </div>
            ))
        }
      </div>
    </div>
  );
}
```

---

### ✅ Milestone 5 Checkpoint

```
🧪 Backend tests:
curl http://localhost:8000/api/stock/AAPL/overview
# Expected: JSON with pe_ratio, eps, market_cap, etc.

# Fetch a second stock first, then test compare
curl "http://localhost:8000/api/stock/MSFT/price?period=1Y"
curl "http://localhost:8000/api/stocks/compare?symbols=AAPL,MSFT&period=1Y"
# Expected: normalised data starting at 100.0 + total_returns

🧪 Visual checks:
□  Fundamentals table in sidebar with formatted values
□  Null fields show "—"
□  Comparison chart renders with 2+ colored lines
□  Total returns legend below chart (green/red per performance)
□  Reference line at 100 (base)
```

```bash
git commit -am "feat(M5): company overview, fundamentals panel, multi-stock comparison chart"
```

---

## 8. Milestone 6 — Polish & Deployment

**Goal:** Header search, period selector, overlay toggles, budget badge, error states, loading polish, deploy.

**Estimated time:** 1–2 days

---

### Day 12 — Header, controls, BudgetBadge, DrawdownChart, DistributionChart

#### Step 6.1 — Create SymbolSearch

```
# 📁 CREATE  frontend/src/components/controls/SymbolSearch.tsx

import { useState } from "react";
import { useDashboardStore } from "../../store/dashboardStore";

export function SymbolSearch() {
  const [input, setInput] = useState("");
  const setSymbol = useDashboardStore((s) => s.setSymbol);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = input.trim().toUpperCase();
    if (clean) { setSymbol(clean); setInput(""); }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "var(--color-text-muted)" }}>🔍</span>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value.toUpperCase())}
        placeholder="Search symbol, e.g. AAPL"
        maxLength={10}
        className="pl-8 pr-4 py-2 text-sm outline-none transition-all"
        style={{
          width: "320px", height: "36px",
          background: "var(--color-elevated)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-pill)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-ui)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--color-amber)")}
        onBlur={(e)  => (e.target.style.borderColor = "var(--color-border)")}
      />
    </form>
  );
}
```

#### Step 6.2 — Create BudgetBadge

```
# 📁 CREATE  frontend/src/components/shared/BudgetBadge.tsx

import { useApiStatus } from "../../hooks/useStockData";

export function BudgetBadge() {
  const { data: status } = useApiStatus();
  if (!status) return null;

  const isCritical = status.requests_used >= 24;
  const isWarning  = status.requests_used >= 20;

  const style = isCritical
    ? { color: "var(--color-error)",   bg: "var(--color-error-subtle)",   border: "rgba(239,68,68,0.3)" }
    : isWarning
    ? { color: "var(--color-warning)", bg: "var(--color-warning-subtle)", border: "rgba(251,191,36,0.3)" }
    : { color: "var(--color-text-secondary)", bg: "var(--color-elevated)", border: "var(--color-border)" };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs"
         style={{ color: style.color, background: style.bg, border: `1px solid ${style.border}` }}>
      <span>⬡</span>
      <span>{status.requests_used}/{status.requests_limit}</span>
      {isCritical && <span className="font-bold">CACHE ONLY</span>}
    </div>
  );
}
```

#### Step 6.3 — Create PeriodSelector + OverlayToggles

```
# 📁 CREATE  frontend/src/components/controls/PeriodSelector.tsx

import { useDashboardStore } from "../../store/dashboardStore";
import type { Period } from "../../types/stock";
import clsx from "clsx";

const PERIODS: Period[] = ["1M", "3M", "6M", "1Y", "5Y"];

export function PeriodSelector() {
  const { period, setPeriod } = useDashboardStore();
  return (
    <div className="flex items-center gap-1">
      {PERIODS.map((p) => (
        <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-1.5 text-xs font-medium rounded-full transition-all"
                style={p === period ? {
                  color: "var(--color-amber)", background: "var(--color-amber-subtle)",
                  border: "1px solid rgba(245,166,35,0.3)", fontWeight: 600,
                } : {
                  color: "var(--color-text-secondary)", background: "transparent",
                  border: "1px solid transparent",
                }}>
          {p}
        </button>
      ))}
    </div>
  );
}
```

#### Step 6.4 — Assemble the final App.tsx layout

✏️ **EDIT** `frontend/src/App.tsx` — assemble all components into the final layout
from DESIGN.md §8.1 — Header, MarketSummaryBar, Toolbar (PeriodSelector + OverlayToggles),
main content area, sidebar (AnalyticsInsights + FundamentalsPanel).

#### Step 6.5 — Create Drawdown and Distribution charts (follow patterns from RSI/MACD)

```
# 📁 CREATE  frontend/src/components/charts/DrawdownChart.tsx
# 📁 CREATE  frontend/src/components/charts/DistributionChart.tsx
# (Follow recharts AreaChart / BarChart patterns from §10.2 and §10.3 of DESIGN.md)
```

---

### Day 13 — Deployment

#### Step 6.6 — Prepare backend for deployment

```
# 📁 CREATE  backend/Procfile

web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

```
# ✏️ EDIT  backend/config.py — ensure ALLOWED_ORIGINS reads from env
# (already done in Step 1.5 — verify it includes prod URL)
```

#### Step 6.7 — Deploy backend to Railway

```
▶ Steps:
1. Push backend/ to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Select the repository, set root directory to "backend/"
4. Add environment variables in Railway dashboard:
   ALPHA_VANTAGE_API_KEY = your_key
   ALLOWED_ORIGINS       = https://your-app.vercel.app
   ENVIRONMENT           = production
5. Copy the deployment URL: https://stocklens-api.railway.app
```

#### Step 6.8 — Deploy frontend to Vercel

```
▶ Steps:
1. Go to https://vercel.com → New Project → Import from GitHub
2. Set root directory to "frontend/"
3. Framework preset: Vite
4. Add environment variable:
   VITE_API_BASE_URL = https://stocklens-api.railway.app
5. Deploy → copy Vercel URL
6. Go back to Railway → update ALLOWED_ORIGINS to Vercel URL
7. Redeploy Railway backend (so CORS picks up the new origin)
```

#### Step 6.9 — Verify production deployment

```bash
# 🧪 TEST — Production smoke tests
curl https://stocklens-api.railway.app/health
# Expected: {"status":"ok"}

curl "https://stocklens-api.railway.app/api/stock/AAPL/price?period=1Y"
# Expected: OHLCV JSON

# Open https://your-app.vercel.app in browser
# Verify: dashboard loads, AAPL data shown, charts render
```

---

### ✅ Milestone 6 Checkpoint — Final

```
□  Header search changes the symbol and all charts update
□  Period tabs change the chart time range
□  Analytics sidebar updates on every symbol change
□  Budget badge shows correct count in header
□  At 20+ requests: yellow warning badge shown
□  Error banner shows + retry button works
□  Stale cache: yellow banner, charts still render
□  Drawdown chart renders (area chart, red fill, negative Y)
□  Return distribution histogram renders
□  Fundamentals panel shows company data
□  Comparison chart shows 2+ stocks normalised to 100
□  Production URL loads and works (Vercel + Railway)
□  Network tab: all API calls go to Railway, not localhost
□  No CORS errors in production
```

```bash
git tag -a v1.0.0 -m "StockLens v1.0.0 — initial release"
git push origin main --tags
```

---

## 9. Git Workflow

### Branch naming

```
main              Production-ready code only
feature/M1-...    Milestone 1 features
feature/M2-...    Milestone 2 features
fix/...           Bug fixes
chore/...         Config, deps, tooling changes
```

### Commit message convention

```
feat(M1):  add SQLite cache manager
feat(M2):  render candlestick chart with lightweight-charts
feat(M3):  RSI chart with 30/70 reference bands
feat(M4):  analytics engine — RSI, volatility, squeeze signals
feat(M5):  company overview endpoint and fundamentals panel
feat(M6):  deploy to Railway + Vercel
fix:       handle AV rate limit gracefully in cache fallback
chore:     add requirements.txt and .env.example
```

### Recommended commit points (one per major step)

After every `✅ Milestone Checkpoint` and after major individual steps
(e.g., after each new router, each new chart component).

---

## 10. Environment Variable Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `ALPHA_VANTAGE_API_KEY` | Yes | — | Your AV free API key |
| `CACHE_TTL_DAILY` | No | `86400` | Daily data cache TTL (seconds) |
| `CACHE_TTL_QUOTE` | No | `3600` | Quote cache TTL (seconds) |
| `DAILY_REQUEST_LIMIT` | No | `25` | AV free tier limit |
| `DAILY_REQUEST_HARD_STOP` | No | `24` | Block API at this count |
| `ENVIRONMENT` | No | `development` | `development` or `production` |
| `ALLOWED_ORIGINS` | Yes | `http://localhost:5173` | Comma-separated CORS origins |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | `http://localhost:8000` | Backend API base URL |

---

## 11. Dependency Version Lock

### Backend

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
httpx==0.27.0
pandas==2.2.2
numpy==1.26.4
python-dotenv==1.0.1
pydantic==2.7.1
pydantic-settings==2.2.1
aiosqlite==0.20.0
```

### Frontend

```json
{
  "axios":              "^1.7.2",
  "lightweight-charts": "^4.1.3",
  "react-query":        "^3.39.3",
  "recharts":           "^2.12.7",
  "zustand":            "^4.5.2",
  "clsx":               "^2.1.1",
  "date-fns":           "^3.6.0",
  "react":              "^18.3.1",
  "react-dom":          "^18.3.1"
}
```

---

## 12. Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `"Note": "Thank you for using..."` from AV | Per-minute rate limit (5 req/min on free tier) | Wait 60 seconds. Cache protects you from this after warmup |
| `{"Error Message": "Invalid API call"}` | Wrong symbol or wrong function param | Check symbol exists on NASDAQ/NYSE. Test in browser first |
| `pydantic_settings.env_file not found` | Running Python from wrong directory | Always `cd backend` before `uvicorn main:app` |
| CORS error in browser | ALLOWED_ORIGINS mismatch | Add `http://localhost:5173` to `.env` ALLOWED_ORIGINS |
| `ModuleNotFoundError: pandas` | Venv not activated | Run `source venv/bin/activate` first |
| `lightweight-charts` chart blank | Data not sorted ascending | Call `toCandlestickData()` which reverses the array |
| `react-query` stale data showing | staleTime too high | Clear with `queryClient.invalidateQueries()` in dev |
| SQLite `database is locked` | Two processes writing simultaneously | Use a single Uvicorn worker in dev (`--workers 1`) |
| Railway deploy fails | Missing `Procfile` or wrong port | Ensure `--port $PORT` in Procfile, not hardcoded 8000 |
| Vercel build fails | Missing env var | Set `VITE_API_BASE_URL` in Vercel project settings |
| `404` on `/api/stocks/compare` | OHLCV not cached for all symbols | Fetch `/api/stock/{symbol}/price` for each symbol first |

---

## 13. Full File Tree — Final State

```
stocklens/
├── .gitignore
├── README.md
│
├── backend/
│   ├── .env                    (gitignored)
│   ├── .env.example
│   ├── Procfile
│   ├── requirements.txt
│   ├── main.py
│   ├── config.py
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── stock.py            (price, quote, overview, drawdown, distribution)
│   │   ├── indicators.py       (indicators, signals)
│   │   ├── compare.py          (compare)
│   │   └── status.py           (status)
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── alpha_vantage.py    (AV client + normalisation)
│   │   ├── cache.py            (SQLite cache manager)
│   │   ├── budget.py           (daily request counter)
│   │   ├── indicators.py       (Pandas indicator computations)
│   │   ├── analytics.py        (signals, drawdown, comparison)
│   │   └── exceptions.py       (custom exception classes)
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py          (all Pydantic models)
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── database.py         (init_db, table DDL)
│   │   └── stock_cache.db      (gitignored, created at runtime)
│   │
│   └── tests/
│       ├── __init__.py
│       ├── test_cache.py
│       ├── test_budget.py
│       └── test_analytics.py
│
└── frontend/
    ├── .env                    (gitignored)
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.ts
    │
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── config.ts
        │
        ├── styles/
        │   └── tokens.css      (CSS custom properties / design tokens)
        │
        ├── api/
        │   ├── client.ts       (Axios instance + interceptors)
        │   └── stockApi.ts     (all API call functions)
        │
        ├── types/
        │   └── stock.ts        (all TypeScript interfaces)
        │
        ├── store/
        │   └── dashboardStore.ts  (Zustand — symbol, period, overlays)
        │
        ├── hooks/
        │   ├── useStockData.ts    (price, quote, status)
        │   ├── useIndicators.ts   (RSI, MACD, EMA, Bollinger)
        │   └── useSignals.ts      (analytics signals)
        │
        ├── utils/
        │   ├── formatters.ts      (price, %, volume, market cap)
        │   └── chartHelpers.ts    (OHLCV → chart library format)
        │
        └── components/
            ├── layout/
            │   ├── DashboardLayout.tsx
            │   ├── Header.tsx
            │   └── Sidebar.tsx
            ├── market/
            │   ├── MarketSummaryBar.tsx
            │   └── FundamentalsPanel.tsx
            ├── charts/
            │   ├── CandlestickChart.tsx
            │   ├── RSIChart.tsx
            │   ├── MACDChart.tsx
            │   ├── ComparisonChart.tsx
            │   ├── DrawdownChart.tsx
            │   └── DistributionChart.tsx
            ├── analytics/
            │   ├── AnalyticsInsights.tsx
            │   └── SignalBadge.tsx
            ├── controls/
            │   ├── SymbolSearch.tsx
            │   ├── PeriodSelector.tsx
            │   ├── OverlayToggles.tsx
            │   └── CompareInput.tsx
            └── shared/
                ├── MetricCard.tsx
                ├── LoadingSkeleton.tsx
                ├── ErrorBanner.tsx
                └── BudgetBadge.tsx
```

---

*End of IMPLEMENTATION_PLAN.md v1.0*
