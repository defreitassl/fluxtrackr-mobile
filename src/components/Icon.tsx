import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';

import { colors } from '../styles/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Icon({
  color = colors.text,
  name,
  size = 22,
}: {
  color?: string;
  name: IconName;
  size?: number;
}) {
  return <Ionicons color={color} name={name} size={size} />;
}
