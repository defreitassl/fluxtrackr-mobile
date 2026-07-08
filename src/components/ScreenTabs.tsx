import { ScrollView, Text, TouchableOpacity } from 'react-native';

import { screens } from '../constants/screens';
import { styles } from '../styles/styles';
import { Screen } from '../types/navigation';

export function ScreenTabs({
  currentScreen,
  onChange,
}: {
  currentScreen: Screen;
  onChange: (screen: Screen) => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.tabs}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {screens.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[styles.tab, currentScreen === item.key && styles.activeTab]}
          onPress={() => onChange(item.key)}
        >
          <Text style={styles.tabText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
