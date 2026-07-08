const moneyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

export function formatMoney(value: number) {
  return moneyFormatter.format(value);
}
