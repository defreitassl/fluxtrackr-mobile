import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { styles } from '../styles/styles';
import { colors } from '../styles/theme';
import { Icon, IconName } from './Icon';

export function AppText({
  children,
  mono = false,
  muted = false,
  numberOfLines,
  size = 'body',
  style,
  weight = 'regular',
}: {
  children: ReactNode;
  mono?: boolean;
  muted?: boolean;
  numberOfLines?: number;
  size?: 'caption' | 'body' | 'large' | 'title' | 'display';
  style?: StyleProp<TextStyle>;
  weight?: 'regular' | 'semibold' | 'bold';
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        styles.text,
        textSizeStyles[size],
        textWeightStyles[weight],
        mono && styles.text_mono,
        muted && styles.text_muted,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Card({
  children,
  glow = false,
  style,
}: {
  children: ReactNode;
  glow?: boolean;
  style?: ViewStyle | ViewStyle[];
}) {
  return <View style={[styles.card, glow && styles.cardGlow, style]}>{children}</View>;
}

export function PrimaryButton({
  disabled = false,
  icon,
  isLoading = false,
  label,
  onPress,
  tone = 'primary',
  style,
}: {
  disabled?: boolean;
  icon?: IconName;
  isLoading?: boolean;
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'danger' | 'ghost';
  style?: ViewStyle | ViewStyle[];
}) {
  const isGhost = tone === 'ghost';
  const color = tone === 'danger' ? colors.danger : colors.onPrimary;
  const contentColor = isGhost ? colors.primary : color;

  return (
    <Pressable
      disabled={disabled || isLoading}
      onPress={onPress}
      style={[
        styles.primaryButton,
        tone === 'danger' && styles.dangerButton,
        isGhost && styles.ghostButton,
        (disabled || isLoading) && styles.disabledButton,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <>
          {icon ? <Icon color={contentColor} name={icon} size={19} /> : null}
          <Text
            style={[
              styles.primaryButtonText,
              isGhost && styles.ghostButtonText,
              tone === 'danger' && styles.dangerButtonText,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  color = colors.muted,
  name,
  onPress,
  size = 22,
  style,
}: {
  color?: string;
  name: IconName;
  onPress: () => void;
  size?: number;
  style?: ViewStyle | ViewStyle[];
}) {
  return (
    <Pressable onPress={onPress} style={[styles.iconButton, style]}>
      <Icon color={color} name={name} size={size} />
    </Pressable>
  );
}

export function FormField({
  icon,
  label,
  ...inputProps
}: TextInputProps & {
  icon?: IconName;
  label: string;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.inputShell}>
        {icon ? <Icon color={colors.muted} name={icon} size={20} /> : null}
        <TextInput
          placeholderTextColor="#6f7b92"
          selectionColor={colors.primary}
          style={styles.input}
          {...inputProps}
        />
      </View>
    </View>
  );
}

export function Chip({
  active = false,
  icon,
  label,
  onPress,
  tone = 'neutral',
}: {
  active?: boolean;
  icon?: IconName;
  label: string;
  onPress?: () => void;
  tone?: 'neutral' | 'primary' | 'danger' | 'telegram';
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.chip,
        active && styles.chipActive,
        tone === 'danger' && styles.chipDanger,
        tone === 'telegram' && styles.chipTelegram,
      ]}
    >
      {icon ? (
        <Icon
          color={active || tone !== 'neutral' ? chipToneColor(tone) : colors.muted}
          name={icon}
          size={16}
        />
      ) : null}
      <Text
        style={[
          styles.chipText,
          (active || tone !== 'neutral') && { color: chipToneColor(tone) },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function EmptyState({
  icon,
  message,
  title,
}: {
  icon: IconName;
  message: string;
  title: string;
}) {
  return (
    <Card style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Icon color={colors.primary} name={icon} size={28} />
      </View>
      <AppText size="title" weight="semibold">
        {title}
      </AppText>
      <AppText muted style={styles.centerText}>
        {message}
      </AppText>
    </Card>
  );
}

export function SectionHeader({
  actionLabel,
  children,
  onAction,
}: {
  actionLabel?: string;
  children: ReactNode;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <AppText size="title" weight="bold">
        {children}
      </AppText>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.inlineAction}>
          <Text style={styles.inlineActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Toggle({
  isActive,
  onToggle,
}: {
  isActive: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.toggleTrack, isActive && styles.toggleTrackActive]}
    >
      <View style={[styles.toggleThumb, isActive && styles.toggleThumbActive]} />
    </Pressable>
  );
}

function chipToneColor(tone: 'neutral' | 'primary' | 'danger' | 'telegram') {
  if (tone === 'danger') {
    return colors.danger;
  }

  if (tone === 'telegram') {
    return colors.telegram;
  }

  return colors.primary;
}

const textSizeStyles = {
  body: styles.text_body,
  caption: styles.text_caption,
  display: styles.text_display,
  large: styles.text_large,
  title: styles.text_title,
};

const textWeightStyles = {
  bold: styles.text_bold,
  regular: styles.text_regular,
  semibold: styles.text_semibold,
};
