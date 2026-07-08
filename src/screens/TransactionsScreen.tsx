import { useEffect, useMemo, useState } from 'react';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  createTransaction,
  deleteTransaction,
  getCategories,
  getTransactions,
  updateTransaction,
} from '../api/client';
import { Icon } from '../components/Icon';
import {
  AppText,
  Card,
  Chip,
  EmptyState,
  FormField,
  IconButton,
  PrimaryButton,
} from '../components/ui';
import { styles } from '../styles/styles';
import { colors } from '../styles/theme';
import { Category, Transaction, TransactionType } from '../types/api';
import { formatMoney } from '../utils/currency';
import {
  dateInputToIso,
  formatDateGroup,
  toDateInputValue,
} from '../utils/dates';
import { getErrorMessage } from '../utils/errors';
import { parseAmount } from '../utils/forms';
import { getTransactionIcon } from '../utils/icons';

type TypeFilter = 'all' | TransactionType;

export function TransactionsScreen({
  onChanged,
  token,
}: {
  onChanged: () => void;
  token: string;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<TypeFilter>('all');
  const [query, setQuery] = useState('');
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function loadData() {
    setIsLoading(true);

    try {
      const [loadedTransactions, loadedCategories] = await Promise.all([
        getTransactions(token),
        getCategories(token),
      ]);
      setTransactions(loadedTransactions);
      setCategories(loadedCategories);
    } catch (error) {
      Alert.alert('Erro ao carregar transações', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return transactions
      .filter((transaction) => filter === 'all' || transaction.type === filter)
      .filter((transaction) => {
        if (!normalizedQuery) {
          return true;
        }

        const category = transaction.categoryId
          ? categoryById.get(transaction.categoryId)
          : undefined;

        return `${transaction.description} ${category?.name ?? ''}`
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort(
        (first, second) =>
          new Date(second.occurredAt).getTime() -
          new Date(first.occurredAt).getTime(),
      );
  }, [categoryById, filter, query, transactions]);

  function openCreateForm() {
    setEditingTransaction(null);
    setIsFormVisible(true);
  }

  function openEditForm(transaction: Transaction) {
    setEditingTransaction(transaction);
    setIsFormVisible(true);
  }

  async function handleDelete(transaction: Transaction) {
    Alert.alert(
      'Excluir transação',
      `Remover "${transaction.description}"?`,
      [
        { style: 'cancel', text: 'Cancelar' },
        {
          onPress: async () => {
            try {
              await deleteTransaction(token, transaction.id);
              onChanged();
              await loadData();
            } catch (error) {
              Alert.alert('Erro ao remover transação', getErrorMessage(error));
            }
          },
          style: 'destructive',
          text: 'Excluir',
        },
      ],
    );
  }

  async function handleSaved() {
    setIsFormVisible(false);
    setEditingTransaction(null);
    onChanged();
    await loadData();
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ gap: 14 }}>
          <AppText size="title" weight="bold">
            Transações
          </AppText>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.row}>
              <Chip
                active={filter === 'all'}
                label="Todas"
                onPress={() => setFilter('all')}
              />
              <Chip
                active={filter === 'expense'}
                label="Gastos"
                onPress={() => setFilter('expense')}
              />
              <Chip
                active={filter === 'income'}
                label="Receitas"
                onPress={() => setFilter('income')}
              />
            </View>
          </ScrollView>

          <View style={styles.searchShell}>
            <Icon color={colors.muted} name="search" size={20} />
            <TextInput
              onChangeText={setQuery}
              placeholder="Buscar..."
              placeholderTextColor="#7b869b"
              selectionColor={colors.primary}
              style={styles.input}
              value={query}
            />
          </View>
        </View>

        {isLoading ? <ActivityIndicator color={colors.primary} /> : null}

        {filteredTransactions.length > 0 ? (
          <View style={{ gap: 10 }}>
            {renderGroupedTransactions({
              categoryById,
              onDelete: handleDelete,
              onEdit: openEditForm,
              transactions: filteredTransactions,
            })}
          </View>
        ) : (
          <EmptyState
            icon="receipt-outline"
            message="Cadastre gastos e receitas pelo app ou pelo Telegram para acompanhar o fluxo."
            title="Nenhuma transação"
          />
        )}
      </ScrollView>

      <Pressable onPress={openCreateForm} style={styles.fab}>
        <Icon color={colors.onPrimary} name="add" size={30} />
      </Pressable>

      <TransactionFormModal
        categories={categories}
        initialTransaction={editingTransaction}
        isVisible={isFormVisible}
        token={token}
        onClose={() => setIsFormVisible(false)}
        onSaved={handleSaved}
      />
    </View>
  );
}

function renderGroupedTransactions({
  categoryById,
  onDelete,
  onEdit,
  transactions,
}: {
  categoryById: Map<string, Category>;
  onDelete: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  transactions: Transaction[];
}) {
  let currentGroup = '';
  const nodes: ReactNode[] = [];

  transactions.forEach((transaction) => {
    const group = formatDateGroup(transaction.occurredAt);
    const category = transaction.categoryId
      ? categoryById.get(transaction.categoryId)
      : undefined;

    if (group !== currentGroup) {
      currentGroup = group;
      nodes.push(
        <Text key={group} style={styles.dateGroup}>
          {group}
        </Text>,
      );
    }

    nodes.push(
      <TransactionRow
        key={transaction.id}
        category={category}
        transaction={transaction}
        onDelete={() => onDelete(transaction)}
        onEdit={() => onEdit(transaction)}
      />,
    );
  });

  return nodes;
}

function TransactionRow({
  category,
  onDelete,
  onEdit,
  transaction,
}: {
  category?: Category;
  onDelete: () => void;
  onEdit: () => void;
  transaction: Transaction;
}) {
  const isIncome = transaction.type === 'income';

  return (
    <Pressable onPress={onEdit} style={styles.listItem}>
      <View
        style={[
          styles.transactionIcon,
          isIncome && {
            backgroundColor: colors.primaryMuted,
            borderColor: colors.primary,
            borderWidth: 1,
          },
        ]}
      >
        <Icon
          color={isIncome ? colors.primary : colors.muted}
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

      <View style={{ alignItems: 'flex-end', gap: 8 }}>
        <AppText
          style={isIncome ? styles.valuePrimary : styles.valueDanger}
          weight="bold"
        >
          {isIncome ? '+' : '-'} {formatMoney(Number(transaction.amount))}
        </AppText>
        <View style={styles.itemActions}>
          <IconButton
            color={colors.muted}
            name="create-outline"
            onPress={onEdit}
            size={18}
            style={{ height: 32, width: 32 }}
          />
          <IconButton
            color={colors.danger}
            name="trash-outline"
            onPress={onDelete}
            size={18}
            style={{ height: 32, width: 32 }}
          />
        </View>
      </View>
    </Pressable>
  );
}

function TransactionFormModal({
  categories,
  initialTransaction,
  isVisible,
  onClose,
  onSaved,
  token,
}: {
  categories: Category[];
  initialTransaction: Transaction | null;
  isVisible: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
  token: string;
}) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [date, setDate] = useState(toDateInputValue());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(String(initialTransaction.amount));
      setDescription(initialTransaction.description);
      setCategoryId(initialTransaction.categoryId ?? undefined);
      setDate(toDateInputValue(initialTransaction.occurredAt));
      return;
    }

    setType('expense');
    setAmount('');
    setDescription('');
    setCategoryId(undefined);
    setDate(toDateInputValue());
  }, [initialTransaction, isVisible]);

  const selectableCategories = categories.filter(
    (category) => category.type === 'both' || category.type === type,
  );

  async function handleSubmit() {
    const numericAmount = parseAmount(amount);

    if (!description.trim() || numericAmount === null) {
      Alert.alert('Dados inválidos', 'Informe descrição e valor positivo.');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        amount: numericAmount,
        categoryId: categoryId ?? null,
        description: description.trim(),
        occurredAt: dateInputToIso(date),
        type,
      };

      if (initialTransaction) {
        await updateTransaction(token, initialTransaction.id, payload);
      } else {
        await createTransaction(token, {
          ...payload,
          categoryId: categoryId ?? undefined,
          source: 'app',
        });
      }

      await onSaved();
    } catch (error) {
      Alert.alert('Erro ao salvar transação', getErrorMessage(error));
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
              {initialTransaction ? 'Editar Transação' : 'Nova Transação'}
            </AppText>
            <IconButton name="close" onPress={onClose} />
          </View>

          <ScrollView
            contentContainerStyle={{ gap: 22, paddingTop: 22 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.segmentedControl}>
              <Pressable
                onPress={() => setType('expense')}
                style={[
                  styles.segmentedItem,
                  type === 'expense' && styles.segmentedItemDanger,
                ]}
              >
                <Icon
                  color={type === 'expense' ? colors.danger : colors.muted}
                  name="arrow-down"
                  size={18}
                />
                <Text
                  style={[
                    styles.segmentedText,
                    type === 'expense' && { color: colors.danger },
                  ]}
                >
                  Gasto
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setType('income')}
                style={[
                  styles.segmentedItem,
                  type === 'income' && styles.segmentedItemActive,
                ]}
              >
                <Icon
                  color={type === 'income' ? colors.primary : colors.muted}
                  name="arrow-up"
                  size={18}
                />
                <Text
                  style={[
                    styles.segmentedText,
                    type === 'income' && { color: colors.primary },
                  ]}
                >
                  Receita
                </Text>
              </Pressable>
            </View>

            <View style={{ alignItems: 'center', gap: 6 }}>
              <AppText mono muted size="caption">
                Valor
              </AppText>
              <View style={styles.row}>
                <Text
                  style={[
                    styles.text,
                    styles.text_title,
                    type === 'income' ? styles.valuePrimary : styles.valueDanger,
                  ]}
                >
                  R$
                </Text>
                <TextInput
                  keyboardType="decimal-pad"
                  onChangeText={setAmount}
                  placeholder="0,00"
                  placeholderTextColor="#354056"
                  selectionColor={colors.primary}
                  style={[
                    styles.text,
                    styles.text_display,
                    styles.text_bold,
                    {
                      minWidth: 180,
                      textAlign: 'center',
                    },
                    type === 'income' ? styles.valuePrimary : styles.valueDanger,
                  ]}
                  value={amount}
                />
              </View>
              <View style={[styles.progressBar, { height: 1, width: 220 }]} />
            </View>

            <FormField
              icon="create-outline"
              label="Descrição"
              onChangeText={setDescription}
              placeholder="Ex: Almoço, Supermercado..."
              value={description}
            />

            <View style={{ gap: 10 }}>
              <View style={styles.sectionHeader}>
                <AppText mono muted size="caption">
                  Categoria
                </AppText>
                <AppText mono style={styles.valuePrimary} size="caption">
                  {selectableCategories.length} opções
                </AppText>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.row}>
                  <Chip
                    active={!categoryId}
                    label="Sem categoria"
                    onPress={() => setCategoryId(undefined)}
                  />
                  {selectableCategories.map((category) => (
                    <Chip
                      key={category.id}
                      active={categoryId === category.id}
                      label={category.name}
                      onPress={() => setCategoryId(category.id)}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>

            <FormField
              icon="calendar-outline"
              label="Data"
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              value={date}
            />

            <PrimaryButton
              icon="checkmark-circle-outline"
              isLoading={isSaving}
              label={initialTransaction ? 'Salvar alterações' : 'Salvar transação'}
              onPress={handleSubmit}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
