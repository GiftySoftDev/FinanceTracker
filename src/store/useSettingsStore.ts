import { create } from "zustand";
import { CurrencyCode } from "../types";

interface SettingsState {
  displayCurrency: CurrencyCode;
  notificationsEnabled: boolean;
  usdToNgnRate: number;
  theme: "light" | "dark";

  setDisplayCurrency: (c: CurrencyCode) => void;
  setNotificationsEnabled: (v: boolean) => void;
  setUsdToNgnRate: (rate: number) => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  displayCurrency: "NGN",
  notificationsEnabled: true,
  usdToNgnRate: 1600,
  theme: "dark",

  setDisplayCurrency: (displayCurrency) => set({ displayCurrency }),
  setNotificationsEnabled: (notificationsEnabled) =>
    set({ notificationsEnabled }),
  setUsdToNgnRate: (usdToNgnRate) => set({ usdToNgnRate }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),
}));
