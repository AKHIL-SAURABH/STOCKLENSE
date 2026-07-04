import httpx
import re
import asyncio
from config import settings
from services.budget import can_make_request, increment_budget
from services.exceptions import (
    BudgetExhaustedError, RateLimitError, SymbolNotFoundError, AlphaVantageError
)

AV_BASE = "https://www.alphavantage.co/query"

# Simple lock to serialise all AV calls (free tier: 5 calls/min)
_av_lock = asyncio.Lock()


async def _call_av(params: dict) -> dict:
    """Raw HTTP call to Alpha Vantage. Budget-gated + rate-limited."""
    if not await can_make_request():
        raise BudgetExhaustedError()

    async with _av_lock:
        params["apikey"] = settings.alpha_vantage_api_key

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(AV_BASE, params=params)
            response.raise_for_status()

        data = response.json()

        # Alpha Vantage returns 200 even for errors — check for error keys
        if "Error Message" in data:
            raise SymbolNotFoundError(params.get("symbol", "UNKNOWN"))
        if "Note" in data or "Information" in data:
            msg = data.get("Note") or data.get("Information", "")
            print(f"[AV] Rate limited: {msg[:120]}")
            raise RateLimitError()

        await increment_budget()

        # Wait 12s after a successful call to stay under 5/min
        await asyncio.sleep(12)

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
    """Convert AV string to float. Returns None for 'None', 'N/A', '-', empty."""
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
    # Strip % suffix from change_percent (R-23)
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
    """Fetches company fundamentals. Converts AV 'None' strings to Python None (R-22)."""
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
