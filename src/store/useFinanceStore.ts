import { create } from "zustand";
import { Transaction, CurrencyCode } from "../types";
import {
  getAllTransactions,
  insertTransaction,
  updateTransaction,
  deleteTransaction,
  getExchangeRate,
} from "../db/queries/transactions";
import uuid from "react-native-uuid";

interface FinanceState {
  transactions: Transaction[];
  usdToNgnRate: number;
  displayCurrency: CurrencyCode;
  loading: boolean;

  // Actions
  loadTransactions: () => Promise<void>;
  addTransaction: (
    data: Omit<Transaction, "id" | "created_at" | "updated_at">,
  ) => Promise<void>;
  editTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  setDisplayCurrency: (currency: CurrencyCode) => void;
  loadExchangeRate: () => Promise<void>;

  // Derived helpers
  toDisplayAmount: (amount: number, currency: CurrencyCode) => number;
  getTotals: () => { income: number; expenses: number; balance: number };
  getMonthlyTotals: (
    year: number,
    month: number,
  ) => { income: number; expenses: number };
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  usdToNgnRate: 1600,
  displayCurrency: "NGN",
  loading: false,

  loadTransactions: async () => {
    set({ loading: true });
    const txns = await getAllTransactions();
    set({ transactions: txns, loading: false });
  },

  addTransaction: async (data) => {
    const now = new Date().toISOString();
    const t: Transaction = {
      ...data,
      id: uuid.v4() as string,
      created_at: now,
      updated_at: now,
    };
    await insertTransaction(t);
    set((s) => ({ transactions: [t, ...s.transactions] }));
  },

  editTransaction: async (id, data) => {
    const now = new Date().toISOString();
    const txns = get().transactions;
    const existing = txns.find((t) => t.id === id);
    if (!existing) return;
    const updated: Transaction = { ...existing, ...data, updated_at: now };
    await updateTransaction(updated);
    set({ transactions: txns.map((t) => (t.id === id ? updated : t)) });
  },

  removeTransaction: async (id) => {
    await deleteTransaction(id);
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
  },

  setDisplayCurrency: (currency) => set({ displayCurrency: currency }),

  loadExchangeRate: async () => {
    const rate = await getExchangeRate("USD", "NGN");
    set({ usdToNgnRate: rate });
  },

  toDisplayAmount: (amount, currency) => {
    const { displayCurrency, usdToNgnRate } = get();
    if (currency === displayCurrency) return amount;
    if (currency === "USD" && displayCurrency === "NGN")
      return amount * usdToNgnRate;
    if (currency === "NGN" && displayCurrency === "USD")
      return amount / usdToNgnRate;
    return amount;
  },

  getTotals: () => {
    const { transactions, toDisplayAmount } = get();
    let income = 0;
    let expenses = 0;
    for (const t of transactions) {
      const amt = toDisplayAmount(t.amount, t.currency_code);
      if (t.type === "income") income += amt;
      else expenses += amt;
    }
    return { income, expenses, balance: income - expenses };
  },

  getMonthlyTotals: (year, month) => {
    const { transactions, toDisplayAmount } = get();
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;
    const monthly = transactions.filter((t) =>
      t.transaction_date.startsWith(monthStr),
    );
    let income = 0;
    let expenses = 0;
    for (const t of monthly) {
      const amt = toDisplayAmount(t.amount, t.currency_code);
      if (t.type === "income") income += amt;
      else expenses += amt;
    }
    return { income, expenses };
  },
}));
