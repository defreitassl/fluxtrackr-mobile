import { CategoryType, TransactionType } from '../types/api';
import { IconName } from '../components/Icon';

const categoryIconMap: Array<[RegExp, IconName]> = [
  [/aliment|restaur|comida|almoco|jantar|lanche/i, 'restaurant'],
  [/transporte|uber|carro|bus|metro|combust/i, 'car'],
  [/mercado|supermerc|compras/i, 'cart'],
  [/salario|pagamento|receita/i, 'cash'],
  [/freela|trabalho|job/i, 'briefcase'],
  [/stream|assinatura|netflix|spotify/i, 'play-circle'],
  [/saude|medic|farm/i, 'medical'],
  [/educ|curso|faculdade|escola/i, 'school'],
  [/lazer|game|cinema/i, 'game-controller'],
  [/internet|wifi/i, 'wifi'],
  [/academia|fitness/i, 'barbell'],
  [/moradia|casa|aluguel/i, 'home'],
];

export function getCategoryIcon(name: string, type?: CategoryType): IconName {
  const match = categoryIconMap.find(([pattern]) => pattern.test(name));

  if (match) {
    return match[1];
  }

  if (type === 'income') {
    return 'cash';
  }

  if (type === 'both') {
    return 'shapes';
  }

  return 'pricetag';
}

export function getTransactionIcon(
  description: string,
  categoryName?: string,
  type?: TransactionType,
): IconName {
  const source = `${description} ${categoryName ?? ''}`;
  const match = categoryIconMap.find(([pattern]) => pattern.test(source));

  if (match) {
    return match[1];
  }

  return type === 'income' ? 'briefcase' : 'card';
}
