import apiClient from "./client";
import type {
  StockQuote, OHLCVResponse, IndicatorsResponse,
  AnalyticsSignals, CompanyOverview, ComparisonResponse,
  DrawdownResponse, DistributionResponse, ApiStatus,
} from "../types/stock";

export const stockApi = {
  getQuote: (symbol: string) =>
    apiClient.get<StockQuote>(`/api/stock/${symbol}/quote`).then(r => r.data),

  getPrice: (symbol: string, period = "1Y") =>
    apiClient.get<OHLCVResponse>(`/api/stock/${symbol}/price`, {
      params: { period },
    }).then(r => r.data),

  getIndicators: (symbol: string) =>
    apiClient.get<IndicatorsResponse>(`/api/stock/${symbol}/indicators`).then(r => r.data),

  getSignals: (symbol: string) =>
    apiClient.get<AnalyticsSignals>(`/api/stock/${symbol}/signals`).then(r => r.data),

  getOverview: (symbol: string) =>
    apiClient.get<CompanyOverview>(`/api/stock/${symbol}/overview`).then(r => r.data),

  getDrawdown: (symbol: string, period = "1Y") =>
    apiClient.get<DrawdownResponse>(`/api/stock/${symbol}/drawdown`, {
      params: { period },
    }).then(r => r.data),

  getDistribution: (symbol: string, period = "1Y") =>
    apiClient.get<DistributionResponse>(`/api/stock/${symbol}/distribution`, {
      params: { period },
    }).then(r => r.data),

  compareStocks: (symbols: string[], period = "1Y") =>
    apiClient.get<ComparisonResponse>(`/api/stocks/compare`, {
      params: { symbols: symbols.join(","), period },
    }).then(r => r.data),

  getStatus: () =>
    apiClient.get<ApiStatus>(`/api/status`).then(r => r.data),
};
