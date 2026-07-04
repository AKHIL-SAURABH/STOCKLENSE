class StockLensError(Exception):
    """Base error for all StockLens exceptions."""
    def __init__(self, message: str, error_code: str, http_status: int = 500):
        self.message    = message
        self.error_code = error_code
        self.http_status = http_status
        super().__init__(message)


class BudgetExhaustedError(StockLensError):
    def __init__(self, msg="Daily API request limit reached (24/25). Using cached data only."):
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
