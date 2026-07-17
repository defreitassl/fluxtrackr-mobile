export function getDashboardAsOf(year: number, month: number, now: Date): Date {
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;
  if (year === currentYear && month === currentMonth) return now;
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  }
  return new Date(Date.UTC(year, month - 1, 1));
}
