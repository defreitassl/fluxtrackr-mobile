import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { getDashboardOverview } from '../api/client';
import { Icon } from '../components/Icon';
import { AppText, Card, EmptyState, IconButton, PrimaryButton, SectionHeader } from '../components/ui';
import { styles } from '../styles/styles';
import { colors } from '../styles/theme';
import { DashboardOverview } from '../types/api';
import { Screen } from '../types/navigation';
import { formatMoney } from '../utils/currency';
import { addMonth, formatMonthYear, getCurrentYearMonth } from '../utils/dates';
import { getErrorMessage } from '../utils/errors';
import { getDashboardAsOf } from '../utils/dashboard';

export function DashboardScreen({ onNavigate, refreshKey, token }: { onNavigate: (screen: Screen) => void; refreshKey: number; token: string }) {
  const initialMonth = useMemo(getCurrentYearMonth, []);
  const [year, setYear] = useState(initialMonth.year);
  const [month, setMonth] = useState(initialMonth.month);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const asOf = useMemo(() => getDashboardAsOf(year, month, new Date()), [year, month]);

  async function load(refresh = false) {
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    setError(null);
    try { setOverview(await getDashboardOverview(token, asOf)); }
    catch (cause) { setError(getErrorMessage(cause)); }
    finally { setIsLoading(false); setIsRefreshing(false); }
  }

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true); setError(null);
    getDashboardOverview(token, asOf).then((result) => { if (!cancelled) setOverview(result); })
      .catch((cause) => { if (!cancelled) setError(getErrorMessage(cause)); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [asOf, refreshKey, token]);

  const changeMonth = (delta: number) => { const next = addMonth(year, month, delta); setYear(next.year); setMonth(next.month); };
  if (isLoading && !overview) return <View style={styles.centered}><ActivityIndicator color={colors.primary} /></View>;
  if (error && !overview) return <View style={styles.content}><EmptyState icon="cloud-offline-outline" title="Não foi possível carregar" message={error} /><PrimaryButton label="Tentar novamente" onPress={() => load()} /></View>;

  return <View style={styles.screen}>
    <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}>
      <View style={[styles.sectionHeader, styles.sectionHeaderStacked]}>
        <AppText size="title" weight="bold">Visão geral</AppText>
        <View style={styles.monthSelector}>
          <IconButton name="chevron-back" size={18} onPress={() => changeMonth(-1)} />
          <AppText mono size="caption">{formatMonthYear(year, month)}</AppText>
          <IconButton name="chevron-forward" size={18} onPress={() => changeMonth(1)} />
        </View>
      </View>
      {overview ? <DashboardContent overview={overview} onNavigate={onNavigate} /> : <EmptyState icon="wallet-outline" title="Sem dados" message="Ainda não há dados financeiros para este mês." />}
      {error ? <AppText muted size="caption">Atualização indisponível: {error}</AppText> : null}
    </ScrollView>
  </View>;
}

function DashboardContent({ overview, onNavigate }: { overview: DashboardOverview; onNavigate: (screen: Screen) => void }) {
  return <>
    <Card glow style={styles.heroCard}>
      <AppText muted>Disponível para gastar</AppText>
      <AppText size="display" weight="bold" style={Number(overview.balance.availableToSpend) < 0 ? styles.valueDanger : styles.valuePrimary}>{formatMoney(Number(overview.balance.availableToSpend))}</AppText>
      <AppText mono muted size="caption">Orçamento diário recomendado: {formatMoney(Number(overview.dailySpending.recommended))}</AppText>
    </Card>
    <View style={styles.compactCardGrid}>
      <Metric label="Saldo total" value={overview.balance.total} />
      <Metric label="Comprometido" value={overview.balance.committed} danger />
      <Metric label="Gasto hoje" value={overview.dailySpending.spentToday} danger />
      <Metric label="Restante hoje" value={overview.dailySpending.remainingToday} />
    </View>
    <Card><SectionHeader>Orçamentos</SectionHeader><AppText>Usado {formatMoney(Number(overview.budgetSummary.totalSpent))} de {formatMoney(Number(overview.budgetSummary.totalLimit))}</AppText><AppText mono muted size="caption">{overview.budgetSummary.nearLimitCount} próximos do limite · {overview.budgetSummary.exceededCount} excedidos</AppText></Card>
    {overview.nextInvoice ? <Card><AppText muted>Próxima fatura</AppText><AppText weight="bold">{overview.nextInvoice.creditCardName} · {formatMoney(Number(overview.nextInvoice.amount))}</AppText><AppText mono muted size="caption">Vence em {new Date(overview.nextInvoice.dueDate).toLocaleDateString('pt-BR')}</AppText></Card> : null}
    <SectionHeader>Próximos compromissos</SectionHeader>
    {overview.upcomingCommitments.length ? overview.upcomingCommitments.map((item) => <Card key={item.id}><AppText weight="semibold">{item.title}</AppText><AppText mono muted size="caption">{new Date(item.date).toLocaleDateString('pt-BR')} · {formatMoney(Number(item.amount))}</AppText></Card>) : <EmptyState icon="calendar-outline" title="Sem compromissos" message="Nenhum compromisso projetado no período." />}
    <SectionHeader actionLabel="Ver movimentações" onAction={() => onNavigate('transactions')}>Movimentações recentes</SectionHeader>
    {overview.latestMovements.length ? overview.latestMovements.map((item) => <Pressable key={`${item.sourceType}-${item.id}`} onPress={() => onNavigate('transactions')} style={styles.listItem}><View style={styles.transactionIcon}><Icon name="swap-horizontal-outline" color={colors.primary} /></View><View style={styles.listText}><AppText weight="semibold">{item.title}</AppText><AppText mono muted size="caption">{new Date(item.date).toLocaleDateString('pt-BR')}</AppText></View><AppText weight="bold" style={item.type === 'expense' ? styles.valueDanger : styles.valuePrimary}>{formatMoney(Number(item.amount))}</AppText></Pressable>) : <EmptyState icon="receipt-outline" title="Sem movimentações" message="Nenhuma movimentação recente disponível." />}
  </>;
}

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) { return <Card style={styles.statCard}><AppText mono muted size="caption">{label}</AppText><AppText weight="bold" style={danger ? styles.valueDanger : styles.valuePrimary}>{formatMoney(Number(value))}</AppText></Card>; }
