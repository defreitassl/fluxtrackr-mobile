export type Screen =
  | 'dashboard'
  | 'transactions'
  | 'categories'
  | 'planning'
  | 'profile';

export type ScreenOption = {
  key: Screen;
  label: string;
};
