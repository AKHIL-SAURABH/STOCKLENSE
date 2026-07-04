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
