const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
});

const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
});

export function getCurrentYearMonth() {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export function addMonth(year: number, month: number, delta: number) {
  const date = new Date(year, month - 1 + delta, 1);

  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function formatMonthYear(year: number, month: number) {
  const label = monthFormatter.format(new Date(year, month - 1, 1));

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDateGroup(isoDate: string) {
  const date = new Date(isoDate);
  const today = startOfDay(new Date()).getTime();
  const target = startOfDay(date).getTime();
  const diffInDays = Math.round((today - target) / 86_400_000);

  if (diffInDays === 0) {
    return `Hoje, ${dayFormatter.format(date)}`;
  }

  if (diffInDays === 1) {
    return `Ontem, ${dayFormatter.format(date)}`;
  }

  return dayFormatter.format(date);
}

export function formatShortDateTime(isoDate: string) {
  const date = new Date(isoDate);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(date);
}

export function toDateInputValue(isoDate?: string) {
  const date = isoDate ? new Date(isoDate) : new Date();

  return date.toISOString().slice(0, 10);
}

export function dateInputToIso(value: string) {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T12:00:00.000Z`).toISOString();
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
