import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync("financetracker.db");
  await runMigrations(db);
  return db;
};

const runMigrations = async (database: SQLite.SQLiteDatabase) => {
  // Run each statement individually — execAsync does NOT support multiple
  // semicolon-separated statements reliably in expo-sqlite v14+
  await database.runAsync("PRAGMA journal_mode = WAL");
  await database.runAsync("PRAGMA foreign_keys = ON");

  await database.runAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category_id TEXT NOT NULL,
      currency_code TEXT NOT NULL DEFAULT 'NGN',
      exchange_rate REAL DEFAULT 1,
      note TEXT,
      transaction_date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.runAsync(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY NOT NULL,
      category_id TEXT NOT NULL,
      amount REAL NOT NULL,
      currency_code TEXT NOT NULL DEFAULT 'NGN',
      month TEXT NOT NULL,
      year INTEGER NOT NULL
    )
  `);

  await database.runAsync(`
    CREATE TABLE IF NOT EXISTS exchange_rates (
      id TEXT PRIMARY KEY NOT NULL,
      base_currency TEXT NOT NULL,
      target_currency TEXT NOT NULL,
      rate REAL NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await database.runAsync(
    `CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date)`,
  );
  await database.runAsync(
    `CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)`,
  );
  await database.runAsync(
    `CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id)`,
  );

  // Seed default exchange rate
  const existing = await database.getFirstAsync<{ id: string }>(
    `SELECT id FROM exchange_rates WHERE base_currency = ? AND target_currency = ?`,
    "USD",
    "NGN",
  );
  if (!existing) {
    await database.runAsync(
      `INSERT INTO exchange_rates (id, base_currency, target_currency, rate, updated_at)
   VALUES (?, ?, ?, ?, ?)`,
      "usd_ngn_default",
      "USD",
      "NGN",
      1600,
      new Date().toISOString(),
    );
  }
};
