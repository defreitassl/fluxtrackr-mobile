import { Pressable, Text, View } from 'react-native';

import { screens } from '../constants/screens';
import { styles } from '../styles/styles';
import { colors } from '../styles/theme';
import { Screen } from '../types/navigation';
import { Icon, IconName } from './Icon';

const navIcons: Record<Screen, IconName> = {
  categories: 'shapes',
  dashboard: 'home',
  planning: 'bar-chart',
  profile: 'person',
  transactions: 'receipt',
};

export function BottomNavigation({
  currentScreen,
  onChange,
}: {
  currentScreen: Screen;
  onChange: (screen: Screen) => void;
}) {
  return (
    <View style={styles.bottomNav}>
      {screens.map((item) => {
        const isActive = currentScreen === item.key;

        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={[styles.bottomNavItem, isActive && styles.bottomNavItemActive]}
          >
            <Icon
              color={isActive ? colors.onPrimary : colors.muted}
              name={isActive ? navIcons[item.key] : `${navIcons[item.key]}-outline` as IconName}
              size={21}
            />
            <Text
              numberOfLines={1}
              style={[
                styles.bottomNavLabel,
                isActive && styles.bottomNavLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
