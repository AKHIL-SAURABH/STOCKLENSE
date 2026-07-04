from fastapi import APIRouter, HTTPException
from models.schemas import (
    IndicatorsResponse, AnalyticsSignals,
    DrawdownResponse, DistributionResponse, PERIOD_DAYS
)
from services.alpha_vantage import sanitise_symbol
from services.cache import get_stale, set_cached, price_key, indicators_key
from services.indicators import compute_all_indicators
from services.analytics import compute_signals, compute_drawdown, compute_return_distribution
from datetime import datetime, timezone

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
        )

    # Compute indicators from cached OHLCV — no API calls
    indicators = compute_all_indicators(ohlcv["records"])

    # Cache the computed indicators for 24 hours
    await set_cached(cache_k, indicators, ttl_seconds=86400)

    return IndicatorsResponse(
        symbol    = symbol,
        is_cached = False,
        cached_at = datetime.now(timezone.utc),
        **indicators
    )


@router.get("/{symbol}/signals", response_model=AnalyticsSignals)
async def get_signals(symbol: str):
    symbol = sanitise_symbol(symbol)
    ohlcv  = await get_stale(price_key(symbol))
    if not ohlcv or not ohlcv.get("records"):
        raise HTTPException(status_code=404, detail=f"No data for {symbol}. Fetch /price first.")
    signals = compute_signals(ohlcv["records"])
    return AnalyticsSignals(symbol=symbol, **signals)


@router.get("/{symbol}/drawdown", response_model=DrawdownResponse)
async def get_drawdown(symbol: str, period: str = "1Y"):
    symbol = sanitise_symbol(symbol)
    if period not in PERIOD_DAYS:
        raise HTTPException(status_code=400, detail=f"Invalid period '{period}'.")
    ohlcv = await get_stale(price_key(symbol))
    if not ohlcv or not ohlcv.get("records"):
        raise HTTPException(status_code=404, detail=f"No data for {symbol}.")
    days = PERIOD_DAYS[period]
    records = ohlcv["records"][:days]
    dd = compute_drawdown(records)
    return DrawdownResponse(symbol=symbol, data=dd)


@router.get("/{symbol}/distribution", response_model=DistributionResponse)
async def get_distribution(symbol: str, period: str = "1Y"):
    symbol = sanitise_symbol(symbol)
    if period not in PERIOD_DAYS:
        raise HTTPException(status_code=400, detail=f"Invalid period '{period}'.")
    ohlcv = await get_stale(price_key(symbol))
    if not ohlcv or not ohlcv.get("records"):
        raise HTTPException(status_code=404, detail=f"No data for {symbol}.")
    days = PERIOD_DAYS[period]
    records = ohlcv["records"][:days]
    dist = compute_return_distribution(records)
    return DistributionResponse(symbol=symbol, data=dist)
