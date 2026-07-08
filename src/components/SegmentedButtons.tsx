import { Text, TouchableOpacity, View } from 'react-native';

import { styles } from '../styles/styles';

export function SegmentedButtons({
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
