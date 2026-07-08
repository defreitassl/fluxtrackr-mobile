import { Text, View } from 'react-native';

import { styles } from '../styles/styles';
import { colors } from '../styles/theme';
import { Screen } from '../types/navigation';
import { Icon } from './Icon';
import { IconButton } from './ui';

export function AppHeader({
  currentScreen,
  userEmail,
}: {
  currentScreen: Screen;
  userEmail?: string;
}) {
  const showAvatar = currentScreen !== 'profile';

  return (
    <View style={styles.topBar}>
      <View style={styles.topBrand}>
        {showAvatar ? (
          <View style={styles.avatar}>
            <Icon color={colors.primary} name="person" size={22} />
          </View>
        ) : null}
        <View>
          <Text style={styles.title}>FluxTrackr</Text>
          {userEmail && currentScreen === 'dashboard' ? (
            <Text style={styles.muted}>{userEmail}</Text>
          ) : null}
        </View>
      </View>
      <IconButton
        color={colors.primary}
        name="notifications-outline"
        onPress={() => undefined}
      />
    </View>
  );
}
