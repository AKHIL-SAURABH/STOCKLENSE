import type { OHLCVDataPoint } from "../types/stock";

export interface CandlestickBar {
  time: string; open: number; high: number; low: number; close: number;
}

export interface VolumeBar {
  time: string; value: number; color: string;
}

export function toCandlestickData(data: OHLCVDataPoint[]): CandlestickBar[] {
  return [...data]
    .reverse()
    .map(({ date, open, high, low, close }) => ({
      time: date, open, high, low, close,
    }));
}

export function toVolumeData(data: OHLCVDataPoint[]): VolumeBar[] {
  return [...data]
    .reverse()
    .map(({ date, open, close, volume }) => ({
      time:  date,
      value: volume,
      color: close >= open
        ? "rgba(74,222,128,0.5)"
        : "rgba(255,107,107,0.5)",
    }));
}
