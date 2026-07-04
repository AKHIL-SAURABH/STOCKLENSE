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
