import { Text, View } from 'react-native';

import { styles } from '../styles/styles';
import { formatMoney } from '../utils/currency';

export function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.metricValue}>{formatMoney(value)}</Text>
    </View>
  );
}
