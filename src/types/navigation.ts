export type Screen =
  | 'dashboard'
  | 'transactions'
  | 'categories'
  | 'fixedExpenses'
  | 'fixedIncomes';

export type ScreenOption = {
  key: Screen;
  label: string;
};
