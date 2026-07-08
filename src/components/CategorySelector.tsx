import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { styles } from '../styles/styles';
import { Category } from '../types/api';

export function CategorySelector({
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
