import { create } from "zustand";
import type { Period } from "../types/stock";

interface Overlays {
  ema20: boolean; ema50: boolean; ema200: boolean; bollinger: boolean;
}

interface DashboardState {
  activeSymbol:   string;
  period:         Period;
  overlays:       Overlays;
  compareSymbols: string[];
  setSymbol:      (symbol: string) => void;
  setPeriod:      (period: Period) => void;
  toggleOverlay:  (key: keyof Overlays) => void;
  addCompare:     (symbol: string) => void;
  removeCompare:  (symbol: string) => void;
  resetCompare:   () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeSymbol:   "AAPL",
  period:         "1Y",
  overlays:       { ema20: true, ema50: true, ema200: false, bollinger: false },
  compareSymbols: [],

  setSymbol:    (s) => set({ activeSymbol: s.toUpperCase().trim() }),
  setPeriod:    (p) => set({ period: p }),
  toggleOverlay:(k) => set((st) => ({
    overlays: { ...st.overlays, [k]: !st.overlays[k] }
  })),
  addCompare:   (s) => set((st) => ({
    compareSymbols: [...new Set([...st.compareSymbols, s.toUpperCase()])].slice(0, 5)
  })),
  removeCompare:(s) => set((st) => ({
    compareSymbols: st.compareSymbols.filter(sym => sym !== s)
  })),
  resetCompare: ()  => set({ compareSymbols: [] }),
}));
