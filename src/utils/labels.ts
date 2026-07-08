import { CategoryType } from '../types/api';

export function categoryTypeLabel(type: CategoryType) {
  if (type === 'income') {
    return 'Receita';
  }

  if (type === 'expense') {
    return 'Gasto';
  }

  return 'Ambos';
}
