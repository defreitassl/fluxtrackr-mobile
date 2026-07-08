import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  createFixedExpense,
  deleteFixedExpense,
  getFixedExpenses,
  updateFixedExpense,
} from '../api/client';
import { RecurringItemsContent } from '../components/RecurringItemsContent';
import { FixedExpense } from '../types/api';
import { getErrorMessage } from '../utils/errors';
import { parseAmount, parseOptionalDay } from '../utils/forms';

export function FixedExpensesScreen({
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
