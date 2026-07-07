import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  createCategory,
  createFixedExpense,
  createFixedIncome,
  createTransaction,
  deleteCategory,
  deleteFixedExpense,
  deleteFixedIncome,
  deleteTransaction,
  getCategories,
  getFixedExpenses,
  getFixedIncomes,
  getMonthlySummary,
  getTransactions,
  login,
  updateCategory,
  updateFixedExpense,
  updateFixedIncome,
  updateTransaction,
} from './src/api/client';
import {
  clearStoredToken,
  getStoredToken,
  storeToken,
} from './src/storage/tokenStorage';
import {
  Category,
  CategoryType,
  FixedExpense,
  FixedIncome,
  MonthlySummary,
  Transaction,
  TransactionType,
} from './src/types/api';

type Screen =
  | 'dashboard'
  | 'transactions'
  | 'categories'
  | 'fixedExpenses'
  | 'fixedIncomes';

type ScreenOption = {
  key: Screen;
  label: string;
};

const screens: ScreenOption[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'transactions', label: 'Transacoes' },
  { key: 'categories', label: 'Categorias' },
  { key: 'fixedExpenses', label: 'Gastos fixos' },
  { key: 'fixedIncomes', label: 'Ganhos fixos' },
];

const moneyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [financialVersion, setFinancialVersion] = useState(0);

  useEffect(() => {
    getStoredToken()
      .then(setToken)
      .finally(() => setIsBooting(false));
  }, []);

  async function handleAuthenticated(accessToken: string) {
    await storeToken(accessToken);
    setToken(accessToken);
    setScreen('dashboard');
  }

  async function handleLogout() {
    await clearStoredToken();
    setToken(null);
  }

  function handleFinancialDataChanged() {
    setFinancialVersion((current) => current + 1);
  }

  if (isBooting) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!token) {
    return <LoginScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FluxTrackr</Text>
        <Button title="Sair" onPress={handleLogout} />
      </View>

      <ScrollView
        contentContainerStyle={styles.tabs}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {screens.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.tab, screen === item.key && styles.activeTab]}
            onPress={() => setScreen(item.key)}
          >
            <Text style={styles.tabText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {screen === 'dashboard' ? (
        <DashboardScreen refreshKey={financialVersion} token={token} />
      ) : null}
      {screen === 'transactions' ? (
        <TransactionsScreen
          onChanged={handleFinancialDataChanged}
          token={token}
        />
      ) : null}
      {screen === 'categories' ? (
        <CategoriesScreen onChanged={handleFinancialDataChanged} token={token} />
      ) : null}
      {screen === 'fixedExpenses' ? (
        <FixedExpensesScreen
          onChanged={handleFinancialDataChanged}
          token={token}
        />
      ) : null}
      {screen === 'fixedIncomes' ? (
        <FixedIncomesScreen onChanged={handleFinancialDataChanged} token={token} />
      ) : null}
    </SafeAreaView>
  );
}

function LoginScreen({
  onAuthenticated,
}: {
  onAuthenticated: (token: string) => Promise<void>;
}) {
  const [email, setEmail] = useState('dev@fluxtrackr.local');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setIsLoading(true);

    try {
      const response = await login(email, password);
      await onAuthenticated(response.accessToken);
    } catch (error) {
      Alert.alert('Erro no login', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.form}
      >
        <Text style={styles.title}>FluxTrackr</Text>
        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          style={styles.input}
          value={email}
        />
        <Text style={styles.label}>Senha</Text>
        <TextInput
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        <Button
          disabled={isLoading}
          onPress={handleLogin}
          title={isLoading ? 'Entrando...' : 'Entrar'}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DashboardScreen({
  refreshKey,
  token,
}: {
  refreshKey: number;
  token: string;
}) {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadSummary() {
    setIsLoading(true);

    try {
      setSummary(await getMonthlySummary(token));
    } catch (error) {
      Alert.alert('Erro ao carregar resumo', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, [refreshKey, token]);

  if (isLoading && !summary) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Resumo mensal</Text>
        <Button title="Atualizar" onPress={loadSummary} />
      </View>
      {summary ? (
        <View style={styles.card}>
          <Metric label="Saldo disponivel" value={summary.availableBalance} />
          <Metric label="Receitas fixas" value={summary.fixedIncomeTotal} />
          <Metric label="Gastos fixos" value={summary.fixedExpenseTotal} />
          <Metric
            label="Receitas do mes"
            value={summary.transactionIncomeTotal}
          />
          <Metric
            label="Gastos do mes"
            value={summary.transactionExpenseTotal}
          />
          <Metric
            label="Orcamento diario"
            value={summary.suggestedDailyBudget}
          />
          <Text style={styles.muted}>
            {summary.remainingDays} dias restantes em {summary.month}/
            {summary.year}
          </Text>
        </View>
      ) : (
        <Text style={styles.muted}>Nenhum resumo carregado.</Text>
      )}
    </View>
  );
}

function TransactionsScreen({
  onChanged,
  token,
}: {
  onChanged: () => void;
  token: string;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submitTitle = useMemo(
    () => (editingId ? 'Atualizar transacao' : 'Criar transacao'),
    [editingId],
  );

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
      Alert.alert('Erro ao carregar transacoes', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  function resetForm() {
    setDescription('');
    setAmount('');
    setType('expense');
    setCategoryId(undefined);
    setEditingId(null);
  }

  async function handleSubmit() {
    const numericAmount = parseAmount(amount);

    if (!description || numericAmount === null) {
      Alert.alert('Dados invalidos', 'Informe descricao e valor positivo.');
      return;
    }

    try {
      const payload = {
        amount: numericAmount,
        description,
        type,
      };

      if (editingId) {
        await updateTransaction(token, editingId, {
          ...payload,
          categoryId: categoryId ?? null,
        });
      } else {
        await createTransaction(token, {
          ...payload,
          categoryId,
          source: 'app',
        });
      }

      resetForm();
      onChanged();
      await loadData();
    } catch (error) {
      Alert.alert('Erro ao salvar transacao', getErrorMessage(error));
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTransaction(token, id);
      onChanged();
      await loadData();
    } catch (error) {
      Alert.alert('Erro ao remover transacao', getErrorMessage(error));
    }
  }

  function startEditing(transaction: Transaction) {
    setEditingId(transaction.id);
    setDescription(transaction.description);
    setAmount(String(transaction.amount));
    setType(transaction.type);
    setCategoryId(transaction.categoryId ?? undefined);
  }

  return (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>Transacoes</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Descricao</Text>
        <TextInput
          onChangeText={setDescription}
          style={styles.input}
          value={description}
        />
        <Text style={styles.label}>Valor</Text>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={setAmount}
          style={styles.input}
          value={amount}
        />
        <SegmentedButtons
          options={[
            { label: 'Gasto', value: 'expense' },
            { label: 'Receita', value: 'income' },
          ]}
          selectedValue={type}
          onSelect={(value) => setType(value as TransactionType)}
        />
        <CategorySelector
          categories={categories}
          selectedCategoryId={categoryId}
          onSelect={setCategoryId}
        />
        <Button onPress={handleSubmit} title={submitTitle} />
        {editingId ? <Button title="Cancelar edicao" onPress={resetForm} /> : null}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.label}>Lista</Text>
        <Button title="Atualizar" onPress={loadData} />
      </View>
      {isLoading ? <ActivityIndicator /> : null}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.listText}>
              <Text style={styles.itemTitle}>{item.description}</Text>
              <Text style={styles.muted}>
                {item.type === 'expense' ? 'Gasto' : 'Receita'} -{' '}
                {moneyFormatter.format(Number(item.amount))}
              </Text>
            </View>
            <View style={styles.itemActions}>
              <Button title="Editar" onPress={() => startEditing(item)} />
              <Button title="Excluir" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

function CategoriesScreen({
  onChanged,
  token,
}: {
  onChanged: () => void;
  token: string;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('expense');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadCategories() {
    setIsLoading(true);

    try {
      setCategories(await getCategories(token));
    } catch (error) {
      Alert.alert('Erro ao carregar categorias', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, [token]);

  function resetForm() {
    setName('');
    setType('expense');
    setEditingId(null);
  }

  async function handleSubmit() {
    if (!name) {
      Alert.alert('Dados invalidos', 'Informe o nome da categoria.');
      return;
    }

    try {
      if (editingId) {
        await updateCategory(token, editingId, { name, type });
      } else {
        await createCategory(token, { name, type });
      }

      resetForm();
      onChanged();
      await loadCategories();
    } catch (error) {
      Alert.alert('Erro ao salvar categoria', getErrorMessage(error));
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCategory(token, id);
      onChanged();
      await loadCategories();
    } catch (error) {
      Alert.alert('Erro ao remover categoria', getErrorMessage(error));
    }
  }

  function startEditing(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setType(category.type);
  }

  return (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>Categorias</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Nome</Text>
        <TextInput onChangeText={setName} style={styles.input} value={name} />
        <SegmentedButtons
          options={[
            { label: 'Gasto', value: 'expense' },
            { label: 'Receita', value: 'income' },
            { label: 'Ambos', value: 'both' },
          ]}
          selectedValue={type}
          onSelect={(value) => setType(value as CategoryType)}
        />
        <Button
          onPress={handleSubmit}
          title={editingId ? 'Atualizar categoria' : 'Criar categoria'}
        />
        {editingId ? <Button title="Cancelar edicao" onPress={resetForm} /> : null}
      </View>
      {isLoading ? <ActivityIndicator /> : null}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.listText}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.muted}>{categoryTypeLabel(item.type)}</Text>
            </View>
            <View style={styles.itemActions}>
              <Button title="Editar" onPress={() => startEditing(item)} />
              <Button title="Excluir" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

function FixedExpensesScreen({
  onChanged,
  token,
}: {
  onChanged: () => void;
  token: string;
}) {
  const [items, setItems] = useState<FixedExpense[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadItems() {
    setIsLoading(true);

    try {
      setItems(await getFixedExpenses(token));
    } catch (error) {
      Alert.alert('Erro ao carregar gastos fixos', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [token]);

  function resetForm() {
    setName('');
    setAmount('');
    setDueDay('');
    setIsActive(true);
    setEditingId(null);
  }

  async function handleSubmit() {
    const numericAmount = parseAmount(amount);
    const parsedDueDay = parseOptionalDay(dueDay);

    if (!name || numericAmount === null || parsedDueDay === null) {
      Alert.alert('Dados invalidos', 'Informe nome, valor positivo e dia valido.');
      return;
    }

    try {
      const payload = {
        amount: numericAmount,
        dueDay: parsedDueDay,
        isActive,
        name,
      };

      if (editingId) {
        await updateFixedExpense(token, editingId, payload);
      } else {
        await createFixedExpense(token, payload);
      }

      resetForm();
      onChanged();
      await loadItems();
    } catch (error) {
      Alert.alert('Erro ao salvar gasto fixo', getErrorMessage(error));
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteFixedExpense(token, id);
      onChanged();
      await loadItems();
    } catch (error) {
      Alert.alert('Erro ao remover gasto fixo', getErrorMessage(error));
    }
  }

  function startEditing(item: FixedExpense) {
    setEditingId(item.id);
    setName(item.name);
    setAmount(String(item.amount));
    setDueDay(item.dueDay ? String(item.dueDay) : '');
    setIsActive(item.isActive);
  }

  return (
    <RecurringItemsContent
      amount={amount}
      day={dueDay}
      dayLabel="Dia de vencimento"
      editingId={editingId}
      isActive={isActive}
      isLoading={isLoading}
      items={items}
      name={name}
      screenTitle="Gastos fixos"
      submitTitle={editingId ? 'Atualizar gasto fixo' : 'Criar gasto fixo'}
      onAmountChange={setAmount}
      onDayChange={setDueDay}
      onDelete={handleDelete}
      onEdit={startEditing}
      onNameChange={setName}
      onReset={resetForm}
      onSubmit={handleSubmit}
      onToggleActive={() => setIsActive((current) => !current)}
    />
  );
}

function FixedIncomesScreen({
  onChanged,
  token,
}: {
  onChanged: () => void;
  token: string;
}) {
  const [items, setItems] = useState<FixedIncome[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [receiveDay, setReceiveDay] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadItems() {
    setIsLoading(true);

    try {
      setItems(await getFixedIncomes(token));
    } catch (error) {
      Alert.alert('Erro ao carregar ganhos fixos', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [token]);

  function resetForm() {
    setName('');
    setAmount('');
    setReceiveDay('');
    setIsActive(true);
    setEditingId(null);
  }

  async function handleSubmit() {
    const numericAmount = parseAmount(amount);
    const parsedReceiveDay = parseOptionalDay(receiveDay);

    if (!name || numericAmount === null || parsedReceiveDay === null) {
      Alert.alert('Dados invalidos', 'Informe nome, valor positivo e dia valido.');
      return;
    }

    try {
      const payload = {
        amount: numericAmount,
        isActive,
        name,
        receiveDay: parsedReceiveDay,
      };

      if (editingId) {
        await updateFixedIncome(token, editingId, payload);
      } else {
        await createFixedIncome(token, payload);
      }

      resetForm();
      onChanged();
      await loadItems();
    } catch (error) {
      Alert.alert('Erro ao salvar ganho fixo', getErrorMessage(error));
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteFixedIncome(token, id);
      onChanged();
      await loadItems();
    } catch (error) {
      Alert.alert('Erro ao remover ganho fixo', getErrorMessage(error));
    }
  }

  function startEditing(item: FixedIncome) {
    setEditingId(item.id);
    setName(item.name);
    setAmount(String(item.amount));
    setReceiveDay(item.receiveDay ? String(item.receiveDay) : '');
    setIsActive(item.isActive);
  }

  return (
    <RecurringItemsContent
      amount={amount}
      day={receiveDay}
      dayLabel="Dia de recebimento"
      editingId={editingId}
      isActive={isActive}
      isLoading={isLoading}
      items={items}
      name={name}
      screenTitle="Ganhos fixos"
      submitTitle={editingId ? 'Atualizar ganho fixo' : 'Criar ganho fixo'}
      onAmountChange={setAmount}
      onDayChange={setReceiveDay}
      onDelete={handleDelete}
      onEdit={startEditing}
      onNameChange={setName}
      onReset={resetForm}
      onSubmit={handleSubmit}
      onToggleActive={() => setIsActive((current) => !current)}
    />
  );
}

type RecurringItem = {
  id: string;
  name: string;
  amount: number;
  isActive: boolean;
};

function RecurringItemsContent<TItem extends RecurringItem>({
  amount,
  day,
  dayLabel,
  editingId,
  isActive,
  isLoading,
  items,
  name,
  screenTitle,
  submitTitle,
  onAmountChange,
  onDayChange,
  onDelete,
  onEdit,
  onNameChange,
  onReset,
  onSubmit,
  onToggleActive,
}: {
  amount: string;
  day: string;
  dayLabel: string;
  editingId: string | null;
  isActive: boolean;
  isLoading: boolean;
  items: TItem[];
  name: string;
  screenTitle: string;
  submitTitle: string;
  onAmountChange: (value: string) => void;
  onDayChange: (value: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: TItem) => void;
  onNameChange: (value: string) => void;
  onReset: () => void;
  onSubmit: () => void;
  onToggleActive: () => void;
}) {
  return (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>{screenTitle}</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Nome</Text>
        <TextInput onChangeText={onNameChange} style={styles.input} value={name} />
        <Text style={styles.label}>Valor</Text>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={onAmountChange}
          style={styles.input}
          value={amount}
        />
        <Text style={styles.label}>{dayLabel}</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={onDayChange}
          style={styles.input}
          value={day}
        />
        <Button
          title={isActive ? 'Ativo' : 'Inativo'}
          onPress={onToggleActive}
        />
        <Button title={submitTitle} onPress={onSubmit} />
        {editingId ? <Button title="Cancelar edicao" onPress={onReset} /> : null}
      </View>
      {isLoading ? <ActivityIndicator /> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.listText}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.muted}>
                {moneyFormatter.format(Number(item.amount))} -{' '}
                {item.isActive ? 'ativo' : 'inativo'}
              </Text>
            </View>
            <View style={styles.itemActions}>
              <Button title="Editar" onPress={() => onEdit(item)} />
              <Button title="Excluir" onPress={() => onDelete(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

function CategorySelector({
  categories,
  selectedCategoryId,
  onSelect,
}: {
  categories: Category[];
  selectedCategoryId?: string;
  onSelect: (categoryId: string | undefined) => void;
}) {
  return (
    <View style={styles.selectorBlock}>
      <Text style={styles.label}>Categoria</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.choice,
            selectedCategoryId === undefined && styles.activeChoice,
          ]}
          onPress={() => onSelect(undefined)}
        >
          <Text>Sem categoria</Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.choice,
              selectedCategoryId === category.id && styles.activeChoice,
            ]}
            onPress={() => onSelect(category.id)}
          >
            <Text>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function SegmentedButtons({
  options,
  selectedValue,
  onSelect,
}: {
  options: Array<{ label: string; value: string }>;
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.row}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.segmentButton,
            selectedValue === option.value && styles.activeChoice,
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text style={styles.tabText}>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.metricValue}>{moneyFormatter.format(value)}</Text>
    </View>
  );
}

function parseAmount(value: string) {
  const amount = Number(value.replace(',', '.'));

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return amount;
}

function parseOptionalDay(value: string) {
  if (!value) {
    return undefined;
  }

  const day = Number(value);

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    return null;
  }

  return day;
}

function categoryTypeLabel(type: CategoryType) {
  if (type === 'income') {
    return 'Receita';
  }

  if (type === 'expense') {
    return 'Gasto';
  }

  return 'Ambos';
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Erro inesperado';
}

const styles = StyleSheet.create({
  activeChoice: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  activeTab: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  card: {
    borderColor: '#d4d4d8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  choice: {
    borderColor: '#d4d4d8',
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  content: {
    flex: 1,
    gap: 14,
    padding: 16,
  },
  form: {
    gap: 12,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#e4e4e7',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  input: {
    borderColor: '#a1a1aa',
    borderRadius: 6,
    borderWidth: 1,
    padding: 10,
  },
  itemActions: {
    gap: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    color: '#3f3f46',
    fontSize: 14,
    fontWeight: '600',
  },
  listItem: {
    borderBottomColor: '#e4e4e7',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  listText: {
    flex: 1,
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  muted: {
    color: '#71717a',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  segmentButton: {
    alignItems: 'center',
    borderColor: '#d4d4d8',
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    padding: 10,
  },
  selectorBlock: {
    gap: 8,
  },
  tab: {
    alignItems: 'center',
    borderColor: '#d4d4d8',
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 110,
    padding: 10,
  },
  tabText: {
    fontWeight: '600',
  },
  tabs: {
    gap: 8,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
});
