import { useEffect, useState } from 'react';
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
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../api/client';
import { Icon } from '../components/Icon';
import {
  AppText,
  Card,
  EmptyState,
  FormField,
  IconButton,
  PrimaryButton,
} from '../components/ui';
import { styles } from '../styles/styles';
import { colors } from '../styles/theme';
import { Category, CategoryType } from '../types/api';
import { getErrorMessage } from '../utils/errors';
import { getCategoryIcon } from '../utils/icons';
import { categoryTypeLabel } from '../utils/labels';

export function CategoriesScreen({
  onChanged,
  token,
}: {
  onChanged: () => void;
  token: string;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
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

  function openCreateForm() {
    setEditingCategory(null);
    setIsFormVisible(true);
  }

  function openEditForm(category: Category) {
    setEditingCategory(category);
    setIsFormVisible(true);
  }

  function handleDelete(category: Category) {
    Alert.alert('Excluir categoria', `Remover "${category.name}"?`, [
      { style: 'cancel', text: 'Cancelar' },
      {
        onPress: async () => {
          try {
            await deleteCategory(token, category.id);
            onChanged();
            await loadCategories();
          } catch (error) {
            Alert.alert('Erro ao remover categoria', getErrorMessage(error));
          }
        },
        style: 'destructive',
        text: 'Excluir',
      },
    ]);
  }

  async function handleSaved() {
    setIsFormVisible(false);
    setEditingCategory(null);
    onChanged();
    await loadCategories();
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ gap: 8 }}>
          <AppText size="title" weight="bold">
            Gestão de Categorias
          </AppText>
          <Text style={styles.sectionSubtitle}>
            Organize seus fluxos financeiros para melhor controle.
          </Text>
        </View>

        <PrimaryButton icon="add" label="Nova Categoria" onPress={openCreateForm} />

        {isLoading ? <ActivityIndicator color={colors.primary} /> : null}

        {categories.length > 0 ? (
          <View style={{ gap: 12 }}>
            {categories.map((category) => (
              <CategoryRow
                category={category}
                key={category.id}
                onDelete={() => handleDelete(category)}
                onEdit={() => openEditForm(category)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="shapes-outline"
            message="Crie categorias para classificar gastos, receitas e recorrências."
            title="Nenhuma categoria"
          />
        )}
      </ScrollView>

      <CategoryFormModal
        initialCategory={editingCategory}
        isVisible={isFormVisible}
        token={token}
        onClose={() => setIsFormVisible(false)}
        onSaved={handleSaved}
      />
    </View>
  );
}

function CategoryRow({
  category,
  onDelete,
  onEdit,
}: {
  category: Category;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const tone =
    category.type === 'income'
      ? colors.primary
      : category.type === 'both'
        ? colors.tertiary
        : colors.danger;
  const background =
    category.type === 'income'
      ? colors.primaryMuted
      : category.type === 'both'
        ? colors.tertiaryContainer
        : colors.dangerContainer;

  return (
    <Card style={{ padding: 18 }}>
      <View style={styles.row}>
        <View style={[styles.transactionIcon, { backgroundColor: background }]}>
          <Icon color={tone} name={getCategoryIcon(category.name, category.type)} />
        </View>
        <View style={styles.listText}>
          <AppText size="large" weight="bold">
            {category.name}
          </AppText>
          <View style={styles.row}>
            <View
              style={{
                backgroundColor: tone,
                borderRadius: 99,
                height: 8,
                width: 8,
              }}
            />
            <AppText mono muted size="caption">
              {categoryTypeLabel(category.type)}
            </AppText>
          </View>
        </View>
        <View style={styles.itemActions}>
          <IconButton
            color={colors.muted}
            name="create-outline"
            onPress={onEdit}
            size={19}
          />
          <IconButton
            color={colors.muted}
            name="trash-outline"
            onPress={onDelete}
            size={19}
          />
        </View>
      </View>
    </Card>
  );
}

function CategoryFormModal({
  initialCategory,
  isVisible,
  onClose,
  onSaved,
  token,
}: {
  initialCategory: Category | null;
  isVisible: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
  token: string;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('expense');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(initialCategory?.name ?? '');
    setType(initialCategory?.type ?? 'expense');
  }, [initialCategory, isVisible]);

  async function handleSubmit() {
    if (!name.trim()) {
      Alert.alert('Dados inválidos', 'Informe o nome da categoria.');
      return;
    }

    setIsSaving(true);

    try {
      if (initialCategory) {
        await updateCategory(token, initialCategory.id, { name: name.trim(), type });
      } else {
        await createCategory(token, { name: name.trim(), type });
      }

      await onSaved();
    } catch (error) {
      Alert.alert('Erro ao salvar categoria', getErrorMessage(error));
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
              {initialCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </AppText>
            <IconButton name="close" onPress={onClose} />
          </View>

          <View style={{ gap: 22, paddingTop: 22 }}>
            <FormField
              icon="pricetag-outline"
              label="Nome"
              onChangeText={setName}
              placeholder="Ex: Alimentação"
              value={name}
            />

            <View style={styles.segmentedControl}>
              {categoryTypeOptions.map((option) => {
                const isActive = type === option.value;
                const color =
                  option.value === 'income'
                    ? colors.primary
                    : option.value === 'both'
                      ? colors.tertiary
                      : colors.danger;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setType(option.value)}
                    style={[
                      styles.segmentedItem,
                      isActive && {
                        backgroundColor:
                          option.value === 'expense'
                            ? colors.dangerContainer
                            : option.value === 'income'
                              ? colors.primaryMuted
                              : colors.tertiaryContainer,
                      },
                    ]}
                  >
                    <Icon color={isActive ? color : colors.muted} name={option.icon} />
                    <Text
                      style={[
                        styles.segmentedText,
                        isActive && { color },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <PrimaryButton
              icon="checkmark-circle-outline"
              isLoading={isSaving}
              label={initialCategory ? 'Salvar alterações' : 'Criar categoria'}
              onPress={handleSubmit}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const categoryTypeOptions: Array<{
  icon: 'arrow-down' | 'arrow-up' | 'swap-horizontal';
  label: string;
  value: CategoryType;
}> = [
  { icon: 'arrow-down', label: 'Gasto', value: 'expense' },
  { icon: 'arrow-up', label: 'Receita', value: 'income' },
  { icon: 'swap-horizontal', label: 'Ambos', value: 'both' },
];
