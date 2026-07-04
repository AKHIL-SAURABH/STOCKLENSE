import { useQuery } from "react-query";
import { stockApi } from "../api/stockApi";
import type { Period } from "../types/stock";

const STALE_1HR = 1000 * 60 * 60;

export function useStockPrice(symbol: string, period: Period) {
  return useQuery(
    ["price", symbol, period],
    () => stockApi.getPrice(symbol, period),
    { staleTime: STALE_1HR, retry: 1, enabled: !!symbol }
  );
}

export function useStockQuote(symbol: string) {
  return useQuery(
    ["quote", symbol],
    () => stockApi.getQuote(symbol),
    { staleTime: STALE_1HR, retry: 1, enabled: !!symbol }
  );
}

export function useApiStatus() {
  return useQuery(
    ["status"],
    () => stockApi.getStatus(),
    { staleTime: 1000 * 60 * 5, refetchInterval: 1000 * 60 * 5 }
  );
}

export function useIndicators(symbol: string) {
  return useQuery(
    ["indicators", symbol],
    () => stockApi.getIndicators(symbol),
    { staleTime: STALE_1HR, retry: 1, enabled: !!symbol }
  );
}

export function useSignals(symbol: string) {
  return useQuery(
    ["signals", symbol],
    () => stockApi.getSignals(symbol),
    { staleTime: STALE_1HR, retry: 1, enabled: !!symbol }
  );
}

export function useOverview(symbol: string) {
  return useQuery(
    ["overview", symbol],
    () => stockApi.getOverview(symbol),
    { staleTime: STALE_1HR, retry: 1, enabled: !!symbol }
  );
}

export function useDrawdown(symbol: string, period: Period) {
  return useQuery(
    ["drawdown", symbol, period],
    () => stockApi.getDrawdown(symbol, period),
    { staleTime: STALE_1HR, retry: 1, enabled: !!symbol }
  );
}

export function useDistribution(symbol: string, period: Period) {
  return useQuery(
    ["distribution", symbol, period],
    () => stockApi.getDistribution(symbol, period),
    { staleTime: STALE_1HR, retry: 1, enabled: !!symbol }
  );
}

export function useComparison(symbols: string[], period: Period) {
  return useQuery(
    ["compare", ...symbols, period],
    () => stockApi.compareStocks(symbols, period),
    { staleTime: STALE_1HR, retry: 1, enabled: symbols.length >= 2 }
  );
}
