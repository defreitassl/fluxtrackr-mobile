export type TransactionType = 'income' | 'expense';
export type TransactionSource = 'app' | 'telegram';
export type CategoryType = 'income' | 'expense' | 'both';
export type AccountType =
  | 'checking'
  | 'savings'
  | 'wallet'
  | 'cash'
  | 'investment'
  | 'other';
export type PaymentMethod = 'pix' | 'debit' | 'credit' | 'cash' | 'transfer';

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  createdAt: string;
  updatedAt: string;
};

export type FixedExpense = {
  id: string;
  name: string;
  amount: number;
  dueDay: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FixedIncome = {
  id: string;
  name: string;
  amount: number;
  receiveDay: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Account = {
  id: string;
  name: string;
  bank: string | null;
  type: AccountType;
  color: string | null;
  icon: string | null;
  initialBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string | null;
  accountId: string | null;
  paymentMethod: PaymentMethod | null;
  occurredAt: string;
  source: TransactionSource;
  createdAt: string;
  updatedAt: string;
};

export type MonthlySummary = {
  year: number;
  month: number;
  fixedIncomeTotal: number;
  fixedExpenseTotal: number;
  transactionIncomeTotal: number;
  transactionExpenseTotal: number;
  availableBalance: number;
  daysInMonth: number;
  currentDay: number;
  remainingDays: number;
  suggestedDailyBudget: number;
  expensesByCategory: Array<{
    categoryId: string | null;
    categoryName: string;
    total: number;
  }>;
};

export type CreateTransactionInput = {
  type: TransactionType;
  amount: number;
  description: string;
  categoryId?: string | null;
  accountId?: string | null;
  paymentMethod?: PaymentMethod | null;
  occurredAt?: string;
  source: TransactionSource;
};

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export type CreateAccountInput = {
  name: string;
  bank?: string | null;
  type: AccountType;
  color?: string | null;
  icon?: string | null;
  initialBalance: number;
  isActive?: boolean;
};

export type UpdateAccountInput = Partial<CreateAccountInput>;

export type CreateCategoryInput = {
  name: string;
  type: CategoryType;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export type CreateFixedExpenseInput = {
  name: string;
  amount: number;
  dueDay?: number;
  isActive?: boolean;
};

export type UpdateFixedExpenseInput = Partial<CreateFixedExpenseInput>;

export type CreateFixedIncomeInput = {
  name: string;
  amount: number;
  receiveDay?: number;
  isActive?: boolean;
};

export type UpdateFixedIncomeInput = Partial<CreateFixedIncomeInput>;
