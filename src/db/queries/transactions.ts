import { getDatabase } from "../database";
import { Transaction } from "../../types";

export const getAllTransactions = async (): Promise<Transaction[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Transaction>(
    `SELECT * FROM transactions ORDER BY transaction_date DESC, created_at DESC`,
  );
  return rows;
};

export const getTransactionsByMonth = async (
  year: number,
  month: number,
): Promise<Transaction[]> => {
  const db = await getDatabase();
  const monthStr = String(month).padStart(2, "0");
  const rows = await db.getAllAsync<Transaction>(
    `SELECT * FROM transactions
   WHERE strftime('%Y-%m', transaction_date) = ?
   ORDER BY transaction_date DESC`,
    [`${year}-${monthStr}`],
  );
  return rows;
};

export const insertTransaction = async (t: Transaction): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO transactions
       (id, title, amount, type, category_id, currency_code, exchange_rate, note, transaction_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    t.id,
    t.title,
    t.amount,
    t.type,
    t.category_id,
    t.currency_code,
    t.exchange_rate,
    t.note ?? null,
    t.transaction_date,
    t.created_at,
    t.updated_at,
  );
};

export const updateTransaction = async (t: Transaction): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE transactions
     SET title=?, amount=?, type=?, category_id=?, currency_code=?, exchange_rate=?, note=?, transaction_date=?, updated_at=?
     WHERE id=?`,
    t.title,
    t.amount,
    t.type,
    t.category_id,
    t.currency_code,
    t.exchange_rate,
    t.note ?? null,
    t.transaction_date,
    t.updated_at,
    t.id,
  );
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM transactions WHERE id = ?`, id);
};

export const getExchangeRate = async (
  base: string,
  target: string,
): Promise<number> => {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ rate: number }>(
    `SELECT rate FROM exchange_rates WHERE base_currency=? AND target_currency=?`,
    [base, target],
  );
  return row?.rate ?? 1600;
};

export const updateExchangeRate = async (
  base: string,
  target: string,
  rate: number,
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE exchange_rates SET rate=?, updated_at=? WHERE base_currency=? AND target_currency=?`,
    rate,
    new Date().toISOString(),
    base,
    target,
  );
};
