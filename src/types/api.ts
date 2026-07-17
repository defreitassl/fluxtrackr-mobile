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

export type DashboardMovement = {
  id: string;
  sourceType: 'transaction' | 'account_transfer' | 'account_balance_adjustment';
  type: TransactionType | 'transfer' | 'adjustment';
  title: string;
  amount: string;
  date: string;
  accountId: string | null;
  sourceAccountId: string | null;
  destinationAccountId: string | null;
};

export type UpcomingCommitment = {
  id: string;
  sourceType: string;
  sourceId: string;
  type: TransactionType;
  title: string;
  amount: string;
  date: string;
  status: string;
  categoryId: string | null;
  accountId: string | null;
};

export type BudgetSummary = {
  totalLimit: string;
  totalSpent: string;
  totalRemaining: string;
  nearLimitCount: number;
  exceededCount: number;
};

export type DashboardOverview = {
  asOf: string;
  balance: { total: string; committed: string; availableToSpend: string };
  dailySpending: { recommended: string; spentToday: string; remainingToday: string; daysRemainingInMonth: number; status: 'within_plan' | 'over_plan' | 'no_available_balance' };
  forecast30Days: { projectedFinalBalance: string; minimumProjectedBalance: string; firstNegativeDate: string | null };
  budgetSummary: BudgetSummary;
  nextInvoice: { id: string; creditCardId: string; creditCardName: string; dueDate: string; status: string; amount: string; installmentsCount: number } | null;
  upcomingCommitments: UpcomingCommitment[];
  latestTransactions: Array<Transaction & { amount: string }>;
  latestMovements: DashboardMovement[];
};

export type SubscriptionSummary = {
  asOf: string;
  activeSubscriptions: number;
  monthlyEquivalent: string;
  pendingThisMonth: string;
  nextCharge: { subscriptionId: string; subscriptionChargeId: string; name: string; amount: string; chargeDate: string; accountId: string | null; creditCardId: string | null } | null;
};

export type CategoryBudgetOverview = {
  year: number;
  month: number;
  asOf: string;
  summary: BudgetSummary & { usagePercentage: string; budgetsCount: number; withinBudgetCount: number };
  budgets: Array<{ id: string; category: { id: string; name: string; type: CategoryType }; limitAmount: string; warningPercentage: number; transactionSpent: string; creditCardSpent: string; spentAmount: string; remainingAmount: string; usagePercentage: string; status: 'within_budget' | 'near_limit' | 'exceeded' }>;
};

export type FinancialGoalsOverview = {
  asOf: string;
  summary: { activeGoals: number; completedGoals: number; canceledGoals: number; totalTargetAmount: string; totalCurrentAmount: string; totalRemainingAmount: string; averageProgressPercentage: string; overdueGoals: number };
  nextDeadline: { id: string; name: string; targetDate: string; currentAmount: string; remainingAmount: string } | null;
  goals: Array<{ id: string; name: string; description: string | null; targetAmount: string; currentAmount: string; remainingAmount: string; progressPercentage: string; targetDate: string | null; status: 'active' | 'completed' | 'canceled'; isOverdue: boolean; daysRemaining: number | null }>;
};

export type Notification = {
  id: string; category: 'invoices' | 'events' | 'subscriptions' | 'budgets' | 'goals'; type: string; severity: 'info' | 'warning' | 'critical'; title: string; message: string; sourceType: string; sourceId: string; scheduledFor: string | null; readAt: string | null; dismissedAt: string | null; resolvedAt: string | null; createdAt: string; updatedAt: string;
};

export type NotificationPreference = { category: Notification['category']; enabled: boolean; leadDays: number | null };
export type Activity = { id: string; type: string; entityType: string; entityId: string; title: string; description: string | null; metadata: Record<string, unknown> | null; occurredAt: string; createdAt: string };
export type PaginatedResponse<T> = { items: T[]; nextCursor: string | null };
