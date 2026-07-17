import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  createFixedExpense,
  createFixedIncome,
  deleteFixedExpense,
  deleteFixedIncome,
  getCategoryBudgetsOverview,
  getFixedExpenses,
  getFixedIncomes,
  getFinancialGoalsOverview,
  getSubscriptionsSummary,
  updateFixedExpense,
  updateFixedIncome,
} from '../api/client';
import { Icon } from '../components/Icon';
import {
  AppText,
  Card,
  EmptyState,
  FormField,
  IconButton,
  PrimaryButton,
  Toggle,
} from '../components/ui';
import { styles } from '../styles/styles';
import { colors } from '../styles/theme';
import { CategoryBudgetOverview, FinancialGoalsOverview, FixedExpense, FixedIncome, SubscriptionSummary } from '../types/api';
import { formatMoney } from '../utils/currency';
import { getErrorMessage } from '../utils/errors';
import { parseAmount, parseOptionalDay } from '../utils/forms';
import { getCategoryIcon } from '../utils/icons';

type PlanningTab = 'expenses' | 'incomes';
type PlanningArea = 'overview' | 'recurrences';
type RecurringItem = FixedExpense | FixedIncome;

export function PlanningScreen({
  onChanged,
  token,
}: {
  onChanged: () => void;
  token: string;
}) {
  const [activeTab, setActiveTab] = useState<PlanningTab>('expenses');
  const [area, setArea] = useState<PlanningArea>('overview');
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [incomes, setIncomes] = useState<FixedIncome[]>([]);
  const [editingItem, setEditingItem] = useState<RecurringItem | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionSummary | null>(null);
  const [budgets, setBudgets] = useState<CategoryBudgetOverview | null>(null);
  const [goals, setGoals] = useState<FinancialGoalsOverview | null>(null);

  async function loadItems() {
    setIsLoading(true);

    try {
      const [loadedExpenses, loadedIncomes] = await Promise.all([
        getFixedExpenses(token),
        getFixedIncomes(token),
      ]);
      setExpenses(loadedExpenses);
      setIncomes(loadedIncomes);
    } catch (error) {
      Alert.alert('Erro ao carregar planejamento', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
    loadOverview();
  }, [token]);

  async function loadOverview() {
    const now = new Date();
    setOverviewLoading(true); setOverviewError(null);
    try {
      const [loadedSubscriptions, loadedBudgets, loadedGoals] = await Promise.all([
        getSubscriptionsSummary(token, now),
        getCategoryBudgetsOverview(token, now.getUTCFullYear(), now.getUTCMonth() + 1, now),
        getFinancialGoalsOverview(token, now),
      ]);
      setSubscriptions(loadedSubscriptions); setBudgets(loadedBudgets); setGoals(loadedGoals);
    } catch (error) { setOverviewError(getErrorMessage(error)); }
    finally { setOverviewLoading(false); }
  }

  const items = activeTab === 'expenses' ? expenses : incomes;
  const total = useMemo(
    () =>
      items
        .filter((item) => item.isActive)
        .reduce((sum, item) => sum + Number(item.amount), 0),
    [items],
  );

  function openCreateForm() {
    setEditingItem(null);
    setIsFormVisible(true);
  }

  function openEditForm(item: RecurringItem) {
    setEditingItem(item);
    setIsFormVisible(true);
  }

  async function handleToggle(item: RecurringItem) {
    try {
      if (activeTab === 'expenses') {
        await updateFixedExpense(token, item.id, { isActive: !item.isActive });
      } else {
        await updateFixedIncome(token, item.id, { isActive: !item.isActive });
      }

      onChanged();
      await loadItems();
    } catch (error) {
      Alert.alert('Erro ao atualizar recorrência', getErrorMessage(error));
    }
  }

  function handleDelete(item: RecurringItem) {
    Alert.alert('Excluir recorrência', `Remover "${item.name}"?`, [
      { style: 'cancel', text: 'Cancelar' },
      {
        onPress: async () => {
          try {
            if (activeTab === 'expenses') {
              await deleteFixedExpense(token, item.id);
            } else {
              await deleteFixedIncome(token, item.id);
            }

            onChanged();
            await loadItems();
          } catch (error) {
            Alert.alert('Erro ao remover recorrência', getErrorMessage(error));
          }
        },
        style: 'destructive',
        text: 'Excluir',
      },
    ]);
  }

  async function handleSaved() {
    setIsFormVisible(false);
    setEditingItem(null);
    onChanged();
    await loadItems();
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ gap: 8 }}>
          <AppText size="title" weight="bold">
            Planejamento
          </AppText>
          <Text style={styles.sectionSubtitle}>
            Gestão de despesas e receitas recorrentes.
          </Text>
        </View>

        <View style={styles.segmentedControl}>
          <PlanningTabButton active={area === 'overview'} label="Visão geral" onPress={() => setArea('overview')} />
          <PlanningTabButton active={area === 'recurrences'} label="Recorrências" onPress={() => setArea('recurrences')} />
        </View>

        {area === 'overview' ? <PlanningOverview budgets={budgets} error={overviewError} goals={goals} isLoading={overviewLoading} onRetry={loadOverview} subscriptions={subscriptions} /> : <>

        <View style={styles.segmentedControl}>
          <PlanningTabButton
            active={activeTab === 'expenses'}
            label="Gastos Fixos"
            onPress={() => setActiveTab('expenses')}
          />
          <PlanningTabButton
            active={activeTab === 'incomes'}
            label="Ganhos Fixos"
            onPress={() => setActiveTab('incomes')}
          />
        </View>

        <Card
          glow
          style={[
            styles.heroCard,
            {
              minHeight: 122,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <AppText mono muted size="caption">
              TOTAL MENSAL
            </AppText>
            <Icon
              color={activeTab === 'expenses' ? colors.danger : colors.primary}
              name={activeTab === 'expenses' ? 'trending-down' : 'trending-up'}
            />
          </View>
          <AppText
            size="display"
            style={activeTab === 'expenses' ? styles.valueDanger : styles.valuePrimary}
            weight="bold"
          >
            {formatMoney(total)}
          </AppText>
        </Card>

        <View style={[styles.sectionHeader, styles.sectionHeaderStacked]}>
          <AppText size="title" weight="bold">
            {activeTab === 'expenses'
              ? 'Despesas Recorrentes'
              : 'Receitas Recorrentes'}
          </AppText>
          <Pressable onPress={openCreateForm} style={styles.inlineAction}>
            <Text style={styles.inlineActionText}>+ Adicionar</Text>
          </Pressable>
        </View>

        {isLoading ? <ActivityIndicator color={colors.primary} /> : null}

        {items.length > 0 ? (
          <View style={{ gap: 10 }}>
            {items.map((item) => (
              <RecurringRow
                item={item}
                key={item.id}
                tab={activeTab}
                onDelete={() => handleDelete(item)}
                onEdit={() => openEditForm(item)}
                onToggle={() => handleToggle(item)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon={activeTab === 'expenses' ? 'calendar-outline' : 'cash-outline'}
            message="Adicione valores recorrentes para o resumo mensal ficar mais preciso."
            title="Nenhuma recorrência"
          />
        )}
        </>}
      </ScrollView>

      <RecurringFormModal
        initialItem={editingItem}
        isVisible={isFormVisible}
        tab={activeTab}
        token={token}
        onClose={() => setIsFormVisible(false)}
        onSaved={handleSaved}
      />
    </View>
  );
}

function PlanningOverview({ budgets, error, goals, isLoading, onRetry, subscriptions }: { budgets: CategoryBudgetOverview | null; error: string | null; goals: FinancialGoalsOverview | null; isLoading: boolean; onRetry: () => void; subscriptions: SubscriptionSummary | null }) {
  if (isLoading && !subscriptions) return <ActivityIndicator color={colors.primary} />;
  if (error && !subscriptions) return <><EmptyState icon="cloud-offline-outline" title="Visão indisponível" message={error} /><PrimaryButton label="Tentar novamente" onPress={onRetry} /></>;
  return <View style={{ gap: 12 }}>
    <Card><AppText size="title" weight="bold">Assinaturas</AppText><AppText>Ativas: {subscriptions?.activeSubscriptions ?? 0}</AppText><AppText>Equivalente mensal: {formatMoney(Number(subscriptions?.monthlyEquivalent ?? 0))}</AppText><AppText>Pendente no mês: {formatMoney(Number(subscriptions?.pendingThisMonth ?? 0))}</AppText>{subscriptions?.nextCharge ? <AppText mono muted size="caption">Próxima: {subscriptions.nextCharge.name} em {new Date(subscriptions.nextCharge.chargeDate).toLocaleDateString('pt-BR')}</AppText> : null}</Card>
    <Card><AppText size="title" weight="bold">Orçamentos</AppText><AppText>Limite: {formatMoney(Number(budgets?.summary.totalLimit ?? 0))}</AppText><AppText>Gasto: {formatMoney(Number(budgets?.summary.totalSpent ?? 0))}</AppText><AppText>Restante: {formatMoney(Number(budgets?.summary.totalRemaining ?? 0))}</AppText><AppText mono muted size="caption">{budgets?.summary.withinBudgetCount ?? 0} dentro · {budgets?.summary.nearLimitCount ?? 0} próximos · {budgets?.summary.exceededCount ?? 0} excedidos</AppText>{budgets?.budgets.slice(0, 4).map((budget) => <AppText key={budget.id} muted size="caption">{budget.category.name}: {formatMoney(Number(budget.spentAmount))} / {formatMoney(Number(budget.limitAmount))}</AppText>)}</Card>
    <Card><AppText size="title" weight="bold">Metas</AppText><AppText>Ativas: {goals?.summary.activeGoals ?? 0} · concluídas: {goals?.summary.completedGoals ?? 0}</AppText><AppText>Alvo total: {formatMoney(Number(goals?.summary.totalTargetAmount ?? 0))}</AppText><AppText>Atual: {formatMoney(Number(goals?.summary.totalCurrentAmount ?? 0))}</AppText><AppText>Restante: {formatMoney(Number(goals?.summary.totalRemainingAmount ?? 0))}</AppText><AppText mono muted size="caption">Progresso médio: {goals?.summary.averageProgressPercentage ?? '0.00'}%</AppText>{goals?.nextDeadline ? <AppText mono muted size="caption">Próximo prazo: {goals.nextDeadline.name} em {new Date(goals.nextDeadline.targetDate).toLocaleDateString('pt-BR')}</AppText> : null}</Card>
  </View>;
}

function PlanningTabButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.segmentedItem, active && styles.segmentedItemActive]}
    >
      <Text
        style={[
          styles.segmentedText,
          active && { color: colors.primary, fontFamily: 'Inter_700Bold' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function RecurringRow({
  item,
  onDelete,
  onEdit,
  onToggle,
  tab,
}: {
  item: RecurringItem;
  onDelete: () => void;
  onEdit: () => void;
  onToggle: () => void;
  tab: PlanningTab;
}) {
  const isExpense = tab === 'expenses';
  const day = isExpense
    ? (item as FixedExpense).dueDay
    : (item as FixedIncome).receiveDay;

  return (
    <Card>
      <View style={{ gap: 14 }}>
        <View style={styles.sectionHeader}>
          <View style={styles.listItemContent}>
            <View style={styles.transactionIcon}>
              <Icon
                color={colors.muted}
                name={getCategoryIcon(item.name, isExpense ? 'expense' : 'income')}
              />
            </View>
            <Pressable onPress={onEdit} style={styles.listText}>
              <AppText numberOfLines={1} size="large" weight="bold">
                {item.name}
              </AppText>
              <AppText mono muted numberOfLines={1} size="caption">
                {isExpense ? 'Vence' : 'Recebe'}{' '}
                {day ? `dia ${day}` : 'sem dia fixo'}
              </AppText>
            </Pressable>
          </View>
          <Toggle isActive={item.isActive} onToggle={onToggle} />
        </View>

        <View style={styles.sectionHeader}>
          <AppText
            numberOfLines={1}
            style={isExpense ? styles.valueDanger : styles.valuePrimary}
            weight="bold"
          >
            {isExpense ? '-' : '+'} {formatMoney(Number(item.amount))}
          </AppText>
          <View style={styles.itemActions}>
            <IconButton
              color={colors.muted}
              name="create-outline"
              onPress={onEdit}
              size={18}
              style={{ height: 34, width: 34 }}
            />
            <IconButton
              color={colors.danger}
              name="trash-outline"
              onPress={onDelete}
              size={18}
              style={{ height: 34, width: 34 }}
            />
          </View>
        </View>
      </View>
    </Card>
  );
}

function RecurringFormModal({
  initialItem,
  isVisible,
  onClose,
  onSaved,
  tab,
  token,
}: {
  initialItem: RecurringItem | null;
  isVisible: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
  tab: PlanningTab;
  token: string;
}) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isExpense = tab === 'expenses';

  useEffect(() => {
    setName(initialItem?.name ?? '');
    setAmount(initialItem ? String(initialItem.amount) : '');
    setIsActive(initialItem?.isActive ?? true);
    setDay(
      initialItem
        ? String(
            isExpense
              ? ((initialItem as FixedExpense).dueDay ?? '')
              : ((initialItem as FixedIncome).receiveDay ?? ''),
          )
        : '',
    );
  }, [initialItem, isExpense, isVisible]);

  async function handleSubmit() {
    const numericAmount = parseAmount(amount);
    const parsedDay = parseOptionalDay(day);

    if (!name.trim() || numericAmount === null || parsedDay === null) {
      Alert.alert('Dados inválidos', 'Informe nome, valor positivo e dia válido.');
      return;
    }

    setIsSaving(true);

    try {
      if (isExpense) {
        const payload = {
          amount: numericAmount,
          dueDay: parsedDay,
          isActive,
          name: name.trim(),
        };

        if (initialItem) {
          await updateFixedExpense(token, initialItem.id, payload);
        } else {
          await createFixedExpense(token, payload);
        }
      } else {
        const payload = {
          amount: numericAmount,
          isActive,
          name: name.trim(),
          receiveDay: parsedDay,
        };

        if (initialItem) {
          await updateFixedIncome(token, initialItem.id, payload);
        } else {
          await createFixedIncome(token, payload);
        }
      }

      await onSaved();
    } catch (error) {
      Alert.alert('Erro ao salvar recorrência', getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={isVisible}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalPanel}>
          <View style={styles.modalHandle} />
          <View style={styles.sectionHeader}>
            <AppText size="title" weight="bold">
              {initialItem ? 'Editar' : 'Adicionar'}{' '}
              {isExpense ? 'Gasto Fixo' : 'Ganho Fixo'}
            </AppText>
            <IconButton name="close" onPress={onClose} />
          </View>

          <View style={styles.formSection}>
            <FormField
              icon={isExpense ? 'calendar-outline' : 'cash-outline'}
              label="Nome"
              onChangeText={setName}
              placeholder={isExpense ? 'Ex: Internet' : 'Ex: Salário'}
              value={name}
            />
            <FormField
              icon="wallet-outline"
              keyboardType="decimal-pad"
              label="Valor"
              onChangeText={setAmount}
              placeholder="0,00"
              value={amount}
            />
            <FormField
              icon="today-outline"
              keyboardType="number-pad"
              label={isExpense ? 'Dia de vencimento' : 'Dia de recebimento'}
              onChangeText={setDay}
              placeholder="Ex: 10"
              value={day}
            />
            <Pressable
              onPress={() => setIsActive((current) => !current)}
              style={[styles.listItem, { justifyContent: 'space-between' }]}
            >
              <View style={styles.listText}>
                <AppText weight="semibold">Status</AppText>
                <AppText mono muted size="caption">
                  {isActive ? 'Ativo no mês' : 'Ignorado no mês'}
                </AppText>
              </View>
              <Toggle
                isActive={isActive}
                onToggle={() => setIsActive((current) => !current)}
              />
            </Pressable>
            <PrimaryButton
              icon="checkmark-circle-outline"
              isLoading={isSaving}
              label={initialItem ? 'Salvar alterações' : 'Criar recorrência'}
              onPress={handleSubmit}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
