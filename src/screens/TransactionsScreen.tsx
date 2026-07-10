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
  createAccount,
  createTransaction,
  deleteTransaction,
  getAccounts,
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
import {
  Account,
  AccountType,
  Category,
  PaymentMethod,
  Transaction,
  TransactionType,
} from '../types/api';
import { formatMoney } from '../utils/currency';
import {
  dateInputToIso,
  formatDateGroup,
  toDateInputValue,
} from '../utils/dates';
import { getErrorMessage } from '../utils/errors';
import { parseAmount } from '../utils/forms';
import { getTransactionIcon } from '../utils/icons';
import { accountTypeLabel, paymentMethodLabel } from '../utils/labels';

type TypeFilter = 'all' | TransactionType;

const paymentMethods: PaymentMethod[] = [
  'pix',
  'debit',
  'credit',
  'cash',
  'transfer',
];

const quickAccounts: Array<{
  bank: string | null;
  color: string;
  icon: string;
  name: string;
  type: AccountType;
}> = [
  {
    bank: 'Nubank',
    color: '#820AD1',
    icon: 'bank',
    name: 'Nubank',
    type: 'checking',
  },
  {
    bank: 'Inter',
    color: '#ff7a00',
    icon: 'bank',
    name: 'Inter',
    type: 'checking',
  },
  {
    bank: null,
    color: '#22c55e',
    icon: 'wallet',
    name: 'Dinheiro',
    type: 'cash',
  },
];

export function TransactionsScreen({
  onChanged,
  token,
}: {
  onChanged: () => void;
  token: string;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filter, setFilter] = useState<TypeFilter>('all');
  const [query, setQuery] = useState('');
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function loadData() {
    setIsLoading(true);

    try {
      const [loadedTransactions, loadedCategories, loadedAccounts] =
        await Promise.all([
          getTransactions(token),
          getCategories(token),
          getAccounts(token),
        ]);
      setTransactions(loadedTransactions);
      setCategories(loadedCategories);
      setAccounts(loadedAccounts);
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

  const accountById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts],
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

        const account = transaction.accountId
          ? accountById.get(transaction.accountId)
          : undefined;

        return `${transaction.description} ${category?.name ?? ''} ${
          account?.name ?? ''
        } ${transaction.paymentMethod ?? ''}`
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort(
        (first, second) =>
          new Date(second.occurredAt).getTime() -
          new Date(first.occurredAt).getTime(),
      );
  }, [accountById, categoryById, filter, query, transactions]);

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

  async function handleCreateQuickAccount(
    account: (typeof quickAccounts)[number],
  ) {
    try {
      await createAccount(token, {
        bank: account.bank,
        color: account.color,
        icon: account.icon,
        initialBalance: 0,
        isActive: true,
        name: account.name,
        type: account.type,
      });
      await loadData();
    } catch (error) {
      Alert.alert('Erro ao criar conta', getErrorMessage(error));
    }
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

        <Card style={{ gap: 12 }}>
          <View style={styles.sectionHeader}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText size="large" weight="bold">
                Contas
              </AppText>
              <AppText muted size="caption">
                Crie contas rápidas para testar transações por origem.
              </AppText>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.row}>
              {accounts.map((account) => (
                <Chip
                  key={account.id}
                  label={`${account.name} · ${accountTypeLabel(account.type)}`}
                />
              ))}
              {accounts.length === 0 ? (
                <Chip label="Nenhuma conta" />
              ) : null}
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.row}>
              {quickAccounts.map((account) => {
                const alreadyExists = accounts.some(
                  (item) =>
                    item.name.trim().toLowerCase() ===
                    account.name.trim().toLowerCase(),
                );

                return (
                  <Chip
                    key={account.name}
                    active={alreadyExists}
                    label={
                      alreadyExists
                        ? `${account.name} criada`
                        : `Criar ${account.name}`
                    }
                    onPress={
                      alreadyExists
                        ? undefined
                        : () => handleCreateQuickAccount(account)
                    }
                    tone={alreadyExists ? 'primary' : 'neutral'}
                  />
                );
              })}
            </View>
          </ScrollView>
        </Card>

        {isLoading ? <ActivityIndicator color={colors.primary} /> : null}

        {filteredTransactions.length > 0 ? (
          <View style={{ gap: 10 }}>
            {renderGroupedTransactions({
              accountById,
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
        accounts={accounts}
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
  accountById,
  categoryById,
  onDelete,
  onEdit,
  transactions,
}: {
  accountById: Map<string, Account>;
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
    const account = transaction.accountId
      ? accountById.get(transaction.accountId)
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
        account={account}
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
  account,
  category,
  onDelete,
  onEdit,
  transaction,
}: {
  account?: Account;
  category?: Category;
  onDelete: () => void;
  onEdit: () => void;
  transaction: Transaction;
}) {
  const isIncome = transaction.type === 'income';

  return (
    <Pressable onPress={onEdit} style={styles.listItem}>
      <View style={styles.listItemContent}>
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
          <View style={styles.transactionMetaRow}>
            <AppText mono muted numberOfLines={1} size="caption">
              {[
                category?.name ?? 'Sem categoria',
                account?.name,
                transaction.paymentMethod
                  ? paymentMethodLabel(transaction.paymentMethod)
                  : undefined,
              ]
                .filter(Boolean)
                .join(' · ')}
            </AppText>
            <Chip
              label={transaction.source === 'telegram' ? 'Telegram' : 'App'}
              tone={transaction.source === 'telegram' ? 'telegram' : 'neutral'}
            />
          </View>
        </View>
      </View>

      <View style={styles.listValueColumn}>
        <AppText
          numberOfLines={1}
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
  accounts,
  categories,
  initialTransaction,
  isVisible,
  onClose,
  onSaved,
  token,
}: {
  accounts: Account[];
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
  const [accountId, setAccountId] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<
    PaymentMethod | undefined
  >();
  const [date, setDate] = useState(toDateInputValue());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(String(initialTransaction.amount));
      setDescription(initialTransaction.description);
      setCategoryId(initialTransaction.categoryId ?? undefined);
      setAccountId(initialTransaction.accountId ?? undefined);
      setPaymentMethod(initialTransaction.paymentMethod ?? undefined);
      setDate(toDateInputValue(initialTransaction.occurredAt));
      return;
    }

    setType('expense');
    setAmount('');
    setDescription('');
    setCategoryId(undefined);
    setAccountId(undefined);
    setPaymentMethod(undefined);
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
        accountId: accountId ?? null,
        categoryId: categoryId ?? null,
        description: description.trim(),
        occurredAt: dateInputToIso(date),
        paymentMethod: paymentMethod ?? null,
        type,
      };

      if (initialTransaction) {
        await updateTransaction(token, initialTransaction.id, payload);
      } else {
        await createTransaction(token, {
          ...payload,
          accountId: accountId ?? undefined,
          categoryId: categoryId ?? undefined,
          paymentMethod,
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
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={isVisible}
    >
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
            contentContainerStyle={styles.modalScrollContent}
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

            <View style={{ alignItems: 'center', gap: 8 }}>
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
                      minWidth: 160,
                      maxWidth: 240,
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

            <View style={{ gap: 10 }}>
              <View style={styles.sectionHeader}>
                <AppText mono muted size="caption">
                  Conta
                </AppText>
                <AppText mono style={styles.valuePrimary} size="caption">
                  {accounts.length} opções
                </AppText>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.row}>
                  <Chip
                    active={!accountId}
                    label="Sem conta"
                    onPress={() => setAccountId(undefined)}
                  />
                  {accounts.map((account) => (
                    <Chip
                      key={account.id}
                      active={accountId === account.id}
                      label={account.name}
                      onPress={() => setAccountId(account.id)}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={{ gap: 10 }}>
              <View style={styles.sectionHeader}>
                <AppText mono muted size="caption">
                  Método de pagamento
                </AppText>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.row}>
                  <Chip
                    active={!paymentMethod}
                    label="Sem método"
                    onPress={() => setPaymentMethod(undefined)}
                  />
                  {paymentMethods.map((method) => (
                    <Chip
                      key={method}
                      active={paymentMethod === method}
                      label={paymentMethodLabel(method)}
                      onPress={() => setPaymentMethod(method)}
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
