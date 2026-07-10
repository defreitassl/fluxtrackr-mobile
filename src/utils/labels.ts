import { AccountType, CategoryType, PaymentMethod } from '../types/api';

export function categoryTypeLabel(type: CategoryType) {
  if (type === 'income') {
    return 'Receita';
  }

  if (type === 'expense') {
    return 'Gasto';
  }

  return 'Ambos';
}

export function accountTypeLabel(type: AccountType) {
  const labels: Record<AccountType, string> = {
    cash: 'Dinheiro',
    checking: 'Conta corrente',
    investment: 'Investimento',
    other: 'Outro',
    savings: 'Poupança',
    wallet: 'Carteira',
  };

  return labels[type];
}

export function paymentMethodLabel(method: PaymentMethod) {
  const labels: Record<PaymentMethod, string> = {
    cash: 'Dinheiro',
    credit: 'Crédito',
    debit: 'Débito',
    pix: 'Pix',
    transfer: 'Transferência',
  };

  return labels[method];
}
