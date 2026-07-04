from fastapi import APIRouter, HTTPException
from models.schemas import ComparisonResponse, PERIOD_DAYS
from services.alpha_vantage import sanitise_symbol
from services.cache import get_stale, price_key
from services.analytics import compute_normalised_comparison
from datetime import datetime, timezone

router = APIRouter()


@router.get("/compare", response_model=ComparisonResponse)
async def compare_stocks(symbols: str, period: str = "1Y"):
    """Compare normalised price series for multiple tickers."""
    if period not in PERIOD_DAYS:
        raise HTTPException(status_code=400, detail=f"Invalid period '{period}'.")

    sym_list = [sanitise_symbol(s.strip()) for s in symbols.split(",") if s.strip()]
    if len(sym_list) < 2:
        raise HTTPException(status_code=400, detail="At least 2 symbols required.")
    if len(sym_list) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 symbols allowed.")

    days = PERIOD_DAYS[period]

    # Gather OHLCV data for all symbols from cache
    ohlcv_map = {}
    missing = []
    for sym in sym_list:
        cached = await get_stale(price_key(sym))
        if cached and cached.get("records"):
            ohlcv_map[sym] = cached["records"][:days]
        else:
            missing.append(sym)

    if missing:
        raise HTTPException(
            status_code=404,
            detail=f"No cached data for: {', '.join(missing)}. Fetch /price for each first."
        )

    data_out, total_returns = compute_normalised_comparison(ohlcv_map)

    if not data_out:
        raise HTTPException(status_code=400, detail="Insufficient overlapping data for comparison.")

    return ComparisonResponse(
        symbols       = sym_list,
        period        = period,
        base_date     = data_out[0]["date"] if data_out else "",
        data          = data_out,
        total_returns = total_returns,
        is_cached     = False,
        cached_at     = datetime.now(timezone.utc),
    )
