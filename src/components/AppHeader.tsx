import { Button, Text, View } from 'react-native';

import { styles } from '../styles/styles';

export function AppHeader({ onLogout }: { onLogout: () => void }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>FluxTrackr</Text>
      <Button title="Sair" onPress={onLogout} />
    </View>
  );
}
