import { getDatabase } from "../database";
import { Budget } from "../../types";

export const getBudgetsByMonth = async (
  year: number,
  month: number,
): Promise<Budget[]> => {
  const db = await getDatabase();
  const monthStr = String(month).padStart(2, "0");
  return await db.getAllAsync<Budget>(
    `SELECT * FROM budgets WHERE year = ? AND month = ?`,
    [year, monthStr],
  );
};

export const upsertBudget = async (b: Budget): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO budgets (id, category_id, amount, currency_code, month, year)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET amount=excluded.amount, currency_code=excluded.currency_code`,
    b.id,
    b.category_id,
    b.amount,
    b.currency_code,
    b.month,
    b.year,
  );
};

export const deleteBudget = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM budgets WHERE id=?`, id);
};
