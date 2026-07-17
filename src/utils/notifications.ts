import { Notification } from '../types/api';

export function formatRelativeDate(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'agora';
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `há ${days}d`;
  return new Date(value).toLocaleDateString('pt-BR');
}

export function notificationSeverityColor(notification: Notification) {
  return notification.severity === 'critical' ? '#ffb4ab' : notification.severity === 'warning' ? '#ffd166' : '#7bd0ff';
}

export function activityTypeLabel(type: string) {
  const labels: Record<string, string> = { invoice_paid: 'Fatura paga', financial_event_realized: 'Evento realizado', subscription_charge_realized: 'Cobrança realizada', financial_goal_completed: 'Meta concluída', category_budget_updated: 'Orçamento atualizado' };
  return labels[type] ?? type.replaceAll('_', ' ');
}
