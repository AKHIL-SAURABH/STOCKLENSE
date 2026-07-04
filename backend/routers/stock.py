from fastapi import APIRouter, HTTPException
from models.schemas import OHLCVResponse, StockQuoteResponse, CompanyOverview, PERIOD_DAYS
from services.alpha_vantage import (
    sanitise_symbol, fetch_daily_price, fetch_global_quote, fetch_overview
)
from services.cache import (
    fetch_with_cache, get_stale, price_key, quote_key, overview_key
)
from services.exceptions import StockLensError
from datetime import datetime, timezone

router = APIRouter()


@router.get("/{symbol}/price", response_model=OHLCVResponse)
async def get_price(symbol: str, period: str = "1Y"):
    symbol = sanitise_symbol(symbol)

    if period not in PERIOD_DAYS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid period '{period}'. Must be one of: 1M, 3M, 6M, 1Y, 5Y",
        )

    cache_k = price_key(symbol)
    days    = PERIOD_DAYS[period]

    try:
        data, is_cached = await fetch_with_cache(
            cache_k,
            lambda: fetch_daily_price(symbol),
            ttl_seconds=86400
        )
    except StockLensError as e:
        # Try stale cache before returning error (R-07, R-25)
        stale = await get_stale(cache_k)
        if stale:
            data, is_cached = stale, True
        else:
            raise HTTPException(status_code=e.http_status, detail=e.message)

    # Slice to requested period
    records = data["records"][:days]

    return OHLCVResponse(
        symbol    = symbol,
        period    = period,
        data      = records,
        is_cached = is_cached,
        cached_at = datetime.now(timezone.utc) if not is_cached else None,
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
            raise HTTPException(status_code=e.http_status, detail=e.message)

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
        cached_at      = datetime.now(timezone.utc) if not is_cached else None,
    )


@router.get("/{symbol}/overview", response_model=CompanyOverview)
async def get_overview(symbol: str):
    symbol  = sanitise_symbol(symbol)
    cache_k = overview_key(symbol)

    try:
        data, is_cached = await fetch_with_cache(
            cache_k,
            lambda: fetch_overview(symbol),
            ttl_seconds=86400
        )
    except StockLensError as e:
        stale = await get_stale(cache_k)
        if stale:
            data, is_cached = stale, True
        else:
            raise HTTPException(status_code=e.http_status, detail=e.message)

    return CompanyOverview(
        **data,
        is_cached = is_cached,
        cached_at = datetime.now(timezone.utc) if not is_cached else None,
    )

