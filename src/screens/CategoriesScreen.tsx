import { useEffect, useState } from 'react';
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
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../api/client';
import { SegmentedButtons } from '../components/SegmentedButtons';
import { styles } from '../styles/styles';
import { Category, CategoryType } from '../types/api';
import { getErrorMessage } from '../utils/errors';
import { categoryTypeLabel } from '../utils/labels';

export function CategoriesScreen({
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
