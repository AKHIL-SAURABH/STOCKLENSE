import pandas as pd
import numpy as np


def compute_signals(records: list[dict]) -> dict:
    """
    Compute all analytics signals from cached OHLCV records.
    records: list of dicts with date, open, high, low, close, volume
             (newest → oldest from AV — we reverse inside)
    """
    if len(records) < 30:
        return _insufficient_data_signals()

    df = pd.DataFrame(records)
    df["date"]   = pd.to_datetime(df["date"])
    df["close"]  = df["close"].astype(float)
    df["volume"] = df["volume"].astype(float)
    df = df.sort_values("date").reset_index(drop=True)   # oldest first

    # Daily returns
    df["ret"] = df["close"].pct_change()

    # EMA crossover
    df["ema50"]  = df["close"].ewm(span=50,  adjust=False).mean()
    df["ema200"] = df["close"].ewm(span=200, adjust=False).mean()

    if len(df) < 201:
        # Not enough data for EMA 200 — return neutral
        trend_signal = "neutral"
        crossover_type = "none"
    else:
        prev_diff = float(df["ema50"].iloc[-2] - df["ema200"].iloc[-2])
        curr_diff = float(df["ema50"].iloc[-1] - df["ema200"].iloc[-1])

        if prev_diff < 0 and curr_diff >= 0:
            crossover_type = "golden"
            trend_signal   = "bullish"
        elif prev_diff > 0 and curr_diff <= 0:
            crossover_type = "death"
            trend_signal   = "bearish"
        else:
            crossover_type = "none"
            trend_signal   = "bullish" if curr_diff > 0 else "bearish"

    # RSI
    delta   = df["close"].diff()
    gain    = delta.clip(lower=0).ewm(alpha=1/14, adjust=False).mean()
    loss    = (-delta.clip(upper=0)).ewm(alpha=1/14, adjust=False).mean()
    rs      = gain / loss.replace(0, np.nan)
    rsi_series = 100 - (100 / (1 + rs))
    rsi_val = float(rsi_series.iloc[-1]) if pd.notna(rsi_series.iloc[-1]) else 50.0
    rsi_state = ("overbought" if rsi_val > 70
                 else "oversold" if rsi_val < 30
                 else "neutral")

    # Volatility
    rolling_std = df["ret"].rolling(20).std()
    vol_20d = float(rolling_std.iloc[-1]) * np.sqrt(252) * 100 if pd.notna(rolling_std.iloc[-1]) else 0.0
    vol_level = ("low" if vol_20d < 20 else "high" if vol_20d > 40 else "medium")

    # Volume anomaly
    avg_vol_30d_series = df["volume"].rolling(30).mean()
    avg_vol_30d = float(avg_vol_30d_series.iloc[-1]) if pd.notna(avg_vol_30d_series.iloc[-1]) else 1.0
    today_vol   = float(df["volume"].iloc[-1])
    vol_ratio   = round(today_vol / avg_vol_30d, 2) if avg_vol_30d > 0 else 1.0

    # Bollinger squeeze
    df["sma20"]    = df["close"].rolling(20).mean()
    df["std20"]    = df["close"].rolling(20).std()
    df["bb_width"] = (df["std20"] * 4) / df["sma20"]
    bb_rank = df["bb_width"].rank(pct=True)
    squeeze = bool(bb_rank.iloc[-1] < 0.20) if pd.notna(bb_rank.iloc[-1]) else False

    summary = _build_summary(
        trend_signal, crossover_type, rsi_state, rsi_val,
        vol_level, vol_ratio, squeeze
    )

    return {
        "trend_signal":      trend_signal,
        "crossover_type":    crossover_type,
        "rsi_state":         rsi_state,
        "rsi_value":         round(rsi_val, 2),
        "volatility_level":  vol_level,
        "volatility_value":  round(vol_20d, 2),
        "volume_anomaly":    vol_ratio,
        "bollinger_squeeze": squeeze,
        "summary":           summary,
    }


def compute_drawdown(records: list[dict]) -> list[dict]:
    df = pd.DataFrame(records)[["date", "close"]].copy()
    df["close"] = df["close"].astype(float)
    df = df.sort_values("date")
    df["peak"]     = df["close"].cummax()
    df["drawdown"] = ((df["close"] - df["peak"]) / df["peak"] * 100).round(4)
    return df[["date", "drawdown"]].to_dict(orient="records")


def compute_return_distribution(records: list[dict]) -> list[dict]:
    df = pd.DataFrame(records)[["date", "close"]].copy()
    df["close"]        = df["close"].astype(float)
    df                 = df.sort_values("date")
    df["daily_return"] = (df["close"].pct_change() * 100).round(4)
    return df.dropna()[["date", "daily_return"]].to_dict(orient="records")


def compute_normalised_comparison(ohlcv_map: dict) -> tuple[list, dict]:
    """
    ohlcv_map: { "AAPL": [records...], "MSFT": [records...] }
    Returns (normalised_data, total_returns)
    """
    dfs = {}
    for sym, records in ohlcv_map.items():
        df = pd.DataFrame(records)[["date", "close"]].copy()
        df["close"] = df["close"].astype(float)
        df = df.sort_values("date").set_index("date")
        dfs[sym] = df["close"]

    combined   = pd.DataFrame(dfs).dropna()
    if combined.empty or len(combined) < 2:
        return [], {}

    normalised = (combined / combined.iloc[0]) * 100

    data_out = []
    for date_idx, row in normalised.iterrows():
        data_out.append({
            "date":   str(date_idx)[:10],
            "values": {sym: round(float(val), 4) for sym, val in row.items()}
        })

    total_returns = {
        sym: round(float(normalised[sym].iloc[-1] - 100), 2)
        for sym in normalised.columns
    }

    return data_out, total_returns


def _build_summary(trend, crossover, rsi_state, rsi_val,
                   vol_level, vol_ratio, squeeze) -> str:
    parts = []
    if crossover == "golden":
        parts.append("A golden cross just formed — a bullish trend signal.")
    elif crossover == "death":
        parts.append("A death cross just formed — a bearish trend signal.")
    else:
        direction = "above" if trend == "bullish" else "below"
        parts.append(f"Trend is {trend} (EMA 50 {direction} EMA 200).")
    if rsi_state == "overbought":
        parts.append(f"RSI at {rsi_val:.0f} — stock may be overbought.")
    elif rsi_state == "oversold":
        parts.append(f"RSI at {rsi_val:.0f} — stock may be oversold.")
    else:
        parts.append(f"RSI at {rsi_val:.0f} — neutral range.")
    if vol_ratio >= 2.0:
        parts.append(f"Volume is {vol_ratio}× the 30-day average.")
    if squeeze:
        parts.append("Bollinger Bands in squeeze — a large move may be approaching.")
    return " ".join(parts)


def _insufficient_data_signals() -> dict:
    return {
        "trend_signal": "neutral", "crossover_type": "none",
        "rsi_state": "neutral", "rsi_value": 50.0,
        "volatility_level": "medium", "volatility_value": 0.0,
        "volume_anomaly": 1.0, "bollinger_squeeze": False,
        "summary": "Insufficient data to compute signals.",
    }
