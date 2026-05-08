import { z } from "zod";

export const transactionSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0,
      "Amount must be a positive number",
    ),
  type: z.enum(["income", "expense"]),
  category_id: z.string().min(1, "Please select a category"),
  currency_code: z.enum(["NGN", "USD"]),
  note: z.string().optional(),
  transaction_date: z.string(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
