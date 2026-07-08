import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  createFixedIncome,
  deleteFixedIncome,
  getFixedIncomes,
  updateFixedIncome,
} from '../api/client';
import { RecurringItemsContent } from '../components/RecurringItemsContent';
import { FixedIncome } from '../types/api';
import { getErrorMessage } from '../utils/errors';
import { parseAmount, parseOptionalDay } from '../utils/forms';

export function FixedIncomesScreen({
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
