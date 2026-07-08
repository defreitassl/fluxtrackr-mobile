import {
  ActivityIndicator,
  Button,
  FlatList,
  Text,
  TextInput,
  View,
} from 'react-native';

import { styles } from '../styles/styles';
import { formatMoney } from '../utils/currency';

type RecurringItem = {
  id: string;
  name: string;
  amount: number;
  isActive: boolean;
};

export function RecurringItemsContent<TItem extends RecurringItem>({
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
                {formatMoney(Number(item.amount))} -{' '}
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
