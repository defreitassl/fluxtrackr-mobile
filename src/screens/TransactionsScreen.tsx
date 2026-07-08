import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
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
import { CategorySelector } from '../components/CategorySelector';
import { SegmentedButtons } from '../components/SegmentedButtons';
import { styles } from '../styles/styles';
import { Category, Transaction, TransactionType } from '../types/api';
import { formatMoney } from '../utils/currency';
import { getErrorMessage } from '../utils/errors';
import { parseAmount } from '../utils/forms';

export function TransactionsScreen({
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
                {formatMoney(Number(item.amount))}
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
