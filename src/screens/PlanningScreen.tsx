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
  getFixedExpenses,
  getFixedIncomes,
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
import { FixedExpense, FixedIncome } from '../types/api';
import { formatMoney } from '../utils/currency';
import { getErrorMessage } from '../utils/errors';
import { parseAmount, parseOptionalDay } from '../utils/forms';
import { getCategoryIcon } from '../utils/icons';

type PlanningTab = 'expenses' | 'incomes';
type RecurringItem = FixedExpense | FixedIncome;

export function PlanningScreen({
  onChanged,
  token,
}: {
  onChanged: () => void;
  token: string;
}) {
  const [activeTab, setActiveTab] = useState<PlanningTab>('expenses');
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [incomes, setIncomes] = useState<FixedIncome[]>([]);
  const [editingItem, setEditingItem] = useState<RecurringItem | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  }, [token]);

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

        <View style={styles.sectionHeader}>
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
      <View style={styles.row}>
        <View style={styles.transactionIcon}>
          <Icon
            color={colors.muted}
            name={getCategoryIcon(item.name, isExpense ? 'expense' : 'income')}
          />
        </View>
        <Pressable onPress={onEdit} style={styles.listText}>
          <AppText size="large" weight="bold">
            {item.name}
          </AppText>
          <AppText mono muted size="caption">
            {isExpense ? 'Vence' : 'Recebe'} {day ? `dia ${day}` : 'sem dia fixo'}
          </AppText>
        </Pressable>
        <View style={{ alignItems: 'flex-end', gap: 10 }}>
          <AppText
            style={isExpense ? styles.valueDanger : styles.valuePrimary}
            weight="bold"
          >
            {isExpense ? '-' : '+'} {formatMoney(Number(item.amount))}
          </AppText>
          <View style={styles.row}>
            <IconButton
              color={colors.muted}
              name="create-outline"
              onPress={onEdit}
              size={17}
              style={{ height: 30, width: 30 }}
            />
            <IconButton
              color={colors.danger}
              name="trash-outline"
              onPress={onDelete}
              size={17}
              style={{ height: 30, width: 30 }}
            />
            <Toggle isActive={item.isActive} onToggle={onToggle} />
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

          <View style={{ gap: 22, paddingTop: 22 }}>
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
