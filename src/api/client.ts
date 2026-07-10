import {
  Account,
  Category,
  CreateAccountInput,
  CreateCategoryInput,
  CreateFixedExpenseInput,
  CreateFixedIncomeInput,
  CreateTransactionInput,
  FixedExpense,
  FixedIncome,
  MonthlySummary,
  Transaction,
  UpdateAccountInput,
  UpdateCategoryInput,
  UpdateFixedExpenseInput,
  UpdateFixedIncomeInput,
  UpdateTransactionInput,
} from '../types/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

type RequestOptions = {
  method?: string;
  token?: string;
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data?.message ?? `Request failed with status ${response.status}`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return data as T;
}

export function login(email: string, password: string) {
  return request<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function getMonthlySummary(token: string) {
  const now = new Date();

  return getMonthlySummaryByMonth(
    token,
    now.getFullYear(),
    now.getMonth() + 1,
  );
}

export function getMonthlySummaryByMonth(
  token: string,
  year: number,
  month: number,
) {
  return request<MonthlySummary>(`/monthly-summary?year=${year}&month=${month}`, {
    token,
  });
}

export function getHealth() {
  return request<{ database: string; status: string }>('/health');
}

export function getTransactions(token: string) {
  return request<Transaction[]>('/transactions', { token });
}

export function getAccounts(token: string) {
  return request<Account[]>('/accounts', { token });
}

export function createAccount(token: string, input: CreateAccountInput) {
  return request<Account>('/accounts', {
    method: 'POST',
    token,
    body: input,
  });
}

export function updateAccount(
  token: string,
  id: string,
  input: UpdateAccountInput,
) {
  return request<Account>(`/accounts/${id}`, {
    method: 'PATCH',
    token,
    body: input,
  });
}

export function createTransaction(
  token: string,
  input: CreateTransactionInput,
) {
  return request<Transaction>('/transactions', {
    method: 'POST',
    token,
    body: input,
  });
}

export function updateTransaction(
  token: string,
  id: string,
  input: UpdateTransactionInput,
) {
  return request<Transaction>(`/transactions/${id}`, {
    method: 'PATCH',
    token,
    body: input,
  });
}

export function deleteTransaction(token: string, id: string) {
  return request<{ deleted: true }>(`/transactions/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function getCategories(token: string) {
  return request<Category[]>('/categories', { token });
}

export function createCategory(token: string, input: CreateCategoryInput) {
  return request<Category>('/categories', {
    method: 'POST',
    token,
    body: input,
  });
}

export function updateCategory(
  token: string,
  id: string,
  input: UpdateCategoryInput,
) {
  return request<Category>(`/categories/${id}`, {
    method: 'PATCH',
    token,
    body: input,
  });
}

export function deleteCategory(token: string, id: string) {
  return request<{ deleted: true }>(`/categories/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function getFixedExpenses(token: string) {
  return request<FixedExpense[]>('/fixed-expenses', { token });
}

export function createFixedExpense(
  token: string,
  input: CreateFixedExpenseInput,
) {
  return request<FixedExpense>('/fixed-expenses', {
    method: 'POST',
    token,
    body: input,
  });
}

export function updateFixedExpense(
  token: string,
  id: string,
  input: UpdateFixedExpenseInput,
) {
  return request<FixedExpense>(`/fixed-expenses/${id}`, {
    method: 'PATCH',
    token,
    body: input,
  });
}

export function deleteFixedExpense(token: string, id: string) {
  return request<{ deleted: true }>(`/fixed-expenses/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function getFixedIncomes(token: string) {
  return request<FixedIncome[]>('/fixed-incomes', { token });
}

export function createFixedIncome(token: string, input: CreateFixedIncomeInput) {
  return request<FixedIncome>('/fixed-incomes', {
    method: 'POST',
    token,
    body: input,
  });
}

export function updateFixedIncome(
  token: string,
  id: string,
  input: UpdateFixedIncomeInput,
) {
  return request<FixedIncome>(`/fixed-incomes/${id}`, {
    method: 'PATCH',
    token,
    body: input,
  });
}

export function deleteFixedIncome(token: string, id: string) {
  return request<{ deleted: true }>(`/fixed-incomes/${id}`, {
    method: 'DELETE',
    token,
  });
}
