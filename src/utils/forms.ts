export function parseAmount(value: string) {
  const amount = Number(value.replace(',', '.'));

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return amount;
}

export function parseOptionalDay(value: string) {
  if (!value) {
    return undefined;
  }

  const day = Number(value);

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    return null;
  }

  return day;
}
