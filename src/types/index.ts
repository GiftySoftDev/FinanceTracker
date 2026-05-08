export type TransactionType = "income" | "expense";
export type CurrencyCode = "NGN" | "USD";
export type ThemeMode = "dark" | "light";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  currency_code: CurrencyCode;
  exchange_rate: number;
  note?: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType | "both";
}

export interface Budget {
  id: string;
  category_id: string;
  amount: number;
  currency_code: CurrencyCode;
  month: string;
  year: number;
}

export interface ExchangeRate {
  id: string;
  base_currency: CurrencyCode;
  target_currency: CurrencyCode;
  rate: number;
  updated_at: string;
}

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  byCategory: { category_id: string; total: number }[];
  monthlyTrend: { month: string; income: number; expenses: number }[];
}
