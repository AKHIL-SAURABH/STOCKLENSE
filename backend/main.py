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
