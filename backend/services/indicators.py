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
