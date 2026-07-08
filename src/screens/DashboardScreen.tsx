import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import {
  getCategories,
  getMonthlySummaryByMonth,
  getTransactions,
} from '../api/client';
import { Icon } from '../components/Icon';
import { AppText, Card, Chip, IconButton, SectionHeader } from '../components/ui';
import { styles } from '../styles/styles';
import { colors } from '../styles/theme';
import { Category, MonthlySummary, Transaction } from '../types/api';
import { Screen } from '../types/navigation';
import { formatMoney } from '../utils/currency';
import {
  addMonth,
  formatMonthYear,
  formatShortDateTime,
  getCurrentYearMonth,
} from '../utils/dates';
import { getErrorMessage } from '../utils/errors';
import { getTransactionIcon } from '../utils/icons';

export function DashboardScreen({
  onNavigate,
  refreshKey,
  token,
}: {
  onNavigate: (screen: Screen) => void;
  refreshKey: number;
  token: string;
}) {
  const initialMonth = useMemo(getCurrentYearMonth, []);
  const [year, setYear] = useState(initialMonth.year);
  const [month, setMonth] = useState(initialMonth.month);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function loadDashboard() {
    setIsLoading(true);

    try {
      const [loadedSummary, loadedTransactions, loadedCategories] =
        await Promise.all([
          getMonthlySummaryByMonth(token, year, month),
          getTransactions(token),
          getCategories(token),
        ]);

      setSummary(loadedSummary);
      setTransactions(loadedTransactions);
      setCategories(loadedCategories);
    } catch (error) {
      Alert.alert('Erro ao carregar resumo', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [month, refreshKey, token, year]);

  function handleChangeMonth(delta: number) {
    const next = addMonth(year, month, delta);

    setMonth(next.month);
    setYear(next.year);
  }

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const recentTransactions = transactions.slice(0, 3);
  const progress =
    summary && summary.daysInMonth > 0
      ? Math.min(100, Math.round((summary.currentDay / summary.daysInMonth) * 100))
      : 0;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeader}>
          <AppText size="title" weight="bold">
            Visão Geral
          </AppText>
          <View style={styles.monthSelector}>
            <IconButton
              color={colors.muted}
              name="chevron-back"
              onPress={() => handleChangeMonth(-1)}
              size={18}
              style={{ height: 32, width: 32 }}
            />
            <AppText mono size="caption">
              {formatMonthYear(year, month)}
            </AppText>
            <IconButton
              color={colors.muted}
              name="chevron-forward"
              onPress={() => handleChangeMonth(1)}
              size={18}
              style={{ height: 32, width: 32 }}
            />
          </View>
        </View>

        {isLoading && !summary ? (
          <ActivityIndicator color={colors.primary} />
        ) : null}

        <Card glow style={styles.heroCard}>
          <View>
            <AppText muted>Saldo Disponível</AppText>
            <Text
              style={[
                styles.text,
                styles.text_display,
                styles.text_bold,
                (summary?.availableBalance ?? 0) < 0
                  ? styles.valueDanger
                  : styles.valuePrimary,
              ]}
            >
              {formatMoney(summary?.availableBalance ?? 0)}
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            <View style={styles.sectionHeader}>
              <AppText mono muted size="caption">
                Progresso do Mês
              </AppText>
              <AppText mono size="caption">
                {progress}% concluído
              </AppText>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          <View style={styles.watermark}>
            <Icon color={colors.primary} name="wallet" size={128} />
          </View>
        </Card>

        <Card style={{ gap: 12, minHeight: 150 }}>
          <View style={styles.row}>
            <Icon color={colors.tertiary} name="bulb-outline" size={22} />
            <AppText muted>Orçamento Diário</AppText>
          </View>
          <AppText size="title" weight="bold">
            {formatMoney(summary?.suggestedDailyBudget ?? 0)}
          </AppText>
          <AppText mono muted size="caption">
            Restam {summary?.remainingDays ?? 0} dias no mês.
          </AppText>
        </Card>

        <View style={styles.compactCardGrid}>
          <SummaryTile
            icon="arrow-up"
            label="Ganhos Fixos"
            tone="primary"
            value={summary?.fixedIncomeTotal ?? 0}
          />
          <SummaryTile
            icon="arrow-down"
            label="Gastos Fixos"
            tone="danger"
            value={summary?.fixedExpenseTotal ?? 0}
          />
          <SummaryTile
            icon="trending-up"
            label="Rec. Variáveis"
            tone="tertiary"
            value={summary?.transactionIncomeTotal ?? 0}
          />
          <SummaryTile
            icon="trending-down"
            label="Gast. Variáveis"
            tone="danger"
            value={summary?.transactionExpenseTotal ?? 0}
          />
        </View>

        <SectionHeader actionLabel="Ver todas" onAction={() => onNavigate('transactions')}>
          Últimas Transações
        </SectionHeader>

        {recentTransactions.length > 0 ? (
          <View style={{ gap: 10 }}>
            {recentTransactions.map((transaction) => {
              const category = transaction.categoryId
                ? categoryById.get(transaction.categoryId)
                : undefined;

              return (
                <Pressable
                  key={transaction.id}
                  onPress={() => onNavigate('transactions')}
                  style={styles.listItem}
                >
                  <View style={styles.transactionIcon}>
                    <Icon
                      color={
                        transaction.type === 'income'
                          ? colors.primary
                          : colors.muted
                      }
                      name={getTransactionIcon(
                        transaction.description,
                        category?.name,
                        transaction.type,
                      )}
                      size={24}
                    />
                  </View>
                  <View style={styles.listText}>
                    <AppText numberOfLines={1} weight="semibold">
                      {transaction.description}
                    </AppText>
                    <View style={styles.row}>
                      <AppText mono muted size="caption">
                        {category?.name ?? 'Sem categoria'}
                      </AppText>
                      <Chip
                        label={transaction.source === 'telegram' ? 'Telegram' : 'App'}
                        tone={transaction.source === 'telegram' ? 'telegram' : 'neutral'}
                      />
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <AppText
                      style={
                        transaction.type === 'income'
                          ? styles.valuePrimary
                          : styles.valueDanger
                      }
                      weight="bold"
                    >
                      {transaction.type === 'income' ? '+' : '-'}{' '}
                      {formatMoney(Number(transaction.amount))}
                    </AppText>
                    <AppText mono muted size="caption">
                      {formatShortDateTime(transaction.occurredAt)}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Card>
            <AppText muted>Nenhuma transação recente.</AppText>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

function SummaryTile({
  icon,
  label,
  tone,
  value,
}: {
  icon: 'arrow-down' | 'arrow-up' | 'trending-down' | 'trending-up';
  label: string;
  tone: 'danger' | 'primary' | 'tertiary';
  value: number;
}) {
  const color =
    tone === 'primary'
      ? colors.primary
      : tone === 'tertiary'
        ? colors.tertiary
        : colors.danger;

  return (
    <Card style={styles.statCard}>
      <View style={styles.row}>
        <Icon color={color} name={icon} size={16} />
        <AppText mono muted size="caption">
          {label}
        </AppText>
      </View>
      <AppText style={{ color }} weight="bold">
        {formatMoney(value)}
      </AppText>
    </Card>
  );
}
