import { Text, View } from 'react-native';

import { styles } from '../styles/styles';
import { colors } from '../styles/theme';
import { Screen } from '../types/navigation';
import { Icon } from './Icon';
import { IconButton } from './ui';

export function AppHeader({
  currentScreen,
  onNotificationsPress,
  unreadCount,
  userEmail,
}: {
  currentScreen: Screen;
  onNotificationsPress: () => void;
  unreadCount: number;
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
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={styles.title}>
            FluxTrackr
          </Text>
          {userEmail && currentScreen === 'dashboard' ? (
            <Text numberOfLines={1} style={styles.muted}>
              {userEmail}
            </Text>
          ) : null}
        </View>
      </View>
      <View>
        <IconButton color={colors.primary} name="notifications-outline" onPress={onNotificationsPress} />
        {unreadCount > 0 ? <View style={styles.notificationBadge}><Text style={styles.notificationBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text></View> : null}
      </View>
    </View>
  );
}
