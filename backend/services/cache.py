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
